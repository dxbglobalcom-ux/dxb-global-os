// node --test scripts/studio.test.mjs
//
// studio.mjs against a FAKE ComfyUI: an http server on a random port, a temp dir as the
// ComfyUI root, a fake nvidia-smi, ss, systemctl and /proc/meminfo. Nothing here touches
// the real card or the real server.
//
// Evidence boundary: these tests prove the bridge's own logic (gate, staging, cleanup,
// exit codes, what it refuses) and the exact graph it sends, built by PINNED copies of the
// studio's builders in fixtures/h3/ (copied from /home/dxb/tools/h3/ on 2026-10-15). They do
// not prove what the real H3/FLUX models render; that is proven by the real runs on the card.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { execFile, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDIO = path.join(HERE, "studio.mjs");

const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "studio-test-")));
const root = path.join(tmp, "ComfyUI");
for (const d of ["input", "output"]) fs.mkdirSync(path.join(root, d), { recursive: true });
const work = path.join(tmp, "work");
fs.mkdirSync(work);

// ---------------------------------------------------------------- fixtures ----
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const HEAD = path.join(work, "head.png");
const TAIL = path.join(work, "tail.png");
const HEAD_SQ = path.join(work, "head-square.png");
const CLIP = path.join(work, "engine.mp4"); // what the fake engine "renders": video + audio
ff(["-f", "lavfi", "-i", "color=c=red:s=1920x1080", "-frames:v", "1", HEAD]);
ff(["-f", "lavfi", "-i", "color=c=blue:s=1920x1080", "-frames:v", "1", TAIL]);
ff(["-f", "lavfi", "-i", "color=c=green:s=800x800", "-frames:v", "1", HEAD_SQ]);
const HEAD_WIDE = path.join(work, "head-4x1.png");
ff(["-f", "lavfi", "-i", "color=c=gray:s=1600x400", "-frames:v", "1", HEAD_WIDE]);
ff(["-f", "lavfi", "-i", "testsrc=s=320x176:r=24:d=1", "-f", "lavfi", "-i", "sine=d=1",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", CLIP]);
const PNG_BYTES = fs.readFileSync(HEAD);

// fake nvidia-smi: card total use and the compute apps, steered by env
const SMI = path.join(work, "nvidia-smi");
fs.writeFileSync(SMI, `#!/usr/bin/env node
const a = process.argv.join(" ");
if (a.includes("--query-compute-apps")) {
  console.log(process.env.FAKE_COMFY_PID + ", " + (process.env.FAKE_COMFY_MIB || "300"));
  console.log("424242, 100");
  if (process.env.FAKE_OTHER_PID) console.log(process.env.FAKE_OTHER_PID + ", " + process.env.FAKE_OTHER_MIB);
} else {
  console.log("NVIDIA Fake 16GB, " + (process.env.FAKE_GPU_USED || "1200") + ", 16311");
}
`);
fs.chmodSync(SMI, 0o755);

// fake ss / systemctl: who listens on the ComfyUI port, and the unit's MainPID
const SS = path.join(work, "ss");
fs.writeFileSync(SS, `#!/usr/bin/env node
if (process.env.FAKE_SS_FAIL) process.exit(1);
const port = new URL(process.env.STUDIO_COMFY_URL).port;
console.log("LISTEN 0      511        127.0.0.1:1 0.0.0.0:* users:((\\"code\\",pid=77,fd=4))");
console.log("LISTEN 0      128        127.0.0.1:" + port + " 0.0.0.0:* users:((\\"python\\",pid=" + (process.env.FAKE_LISTEN_PID || process.env.FAKE_COMFY_PID) + ",fd=43))");
`);
fs.chmodSync(SS, 0o755);
const SYSTEMCTL = path.join(work, "systemctl");
fs.writeFileSync(SYSTEMCTL, `#!/usr/bin/env node
if (process.env.FAKE_SYSTEMCTL_FAIL) process.exit(1);
console.log(process.env.FAKE_MAIN_PID || process.env.FAKE_COMFY_PID);
`);
fs.chmodSync(SYSTEMCTL, 0o755);

// an ffmpeg that writes a partial file where it was told to, then fails (ffprobe is real)
const BADBIN = path.join(work, "badbin");
fs.mkdirSync(BADBIN);
fs.writeFileSync(path.join(BADBIN, "ffmpeg"), `#!/usr/bin/env node
require("fs").writeFileSync(process.argv.at(-1), "partial");
process.exit(1);
`);
fs.chmodSync(path.join(BADBIN, "ffmpeg"), 0o755);
fs.symlinkSync(execFileSync("sh", ["-c", "command -v ffprobe"], { encoding: "utf8" }).trim(), path.join(BADBIN, "ffprobe"));

const meminfoRaw = (name, text) => {
  const p = path.join(work, `meminfo-${name}`);
  fs.writeFileSync(p, text);
  return p;
};

const meminfo = (availGib, swapFreeFrac = 0.9) => {
  const p = path.join(work, `meminfo-${availGib}-${swapFreeFrac}`);
  const kb = (g) => Math.round(g * 1024 * 1024);
  fs.writeFileSync(p, [
    `MemTotal:       ${kb(32)} kB`,
    `MemAvailable:   ${kb(availGib)} kB`,
    `SwapTotal:      ${kb(16)} kB`,
    `SwapFree:       ${kb(16 * swapFreeFrac)} kB`,
  ].join("\n") + "\n");
  return p;
};

// ------------------------------------------------------------- fake server ----
const S = {
  posted: [],          // every /prompt body
  inputsAtPost: [],    // which input files existed when the prompt arrived
  historyCalls: 0,
  mode: "ok",          // ok | exec-error | validation-error | redirect | hang-pending | hang-running
  queue: { queue_running: [], queue_pending: [] },
  deletes: [],         // prompt ids removed through POST /queue {delete}
  interrupts: [],      // POST /interrupt bodies (hang-running ignores them: the job stays)
  gone: false,         // the hanging job has left ComfyUI's queue
  outsideHits: 0,      // requests that reached the "outside" server
};
const reset = () => {
  S.posted = []; S.inputsAtPost = []; S.historyCalls = 0; S.mode = "ok"; S.queue = { queue_running: [], queue_pending: [] };
  S.deletes = []; S.interrupts = []; S.gone = false; S.outsideHits = 0;
};
const readBody = (req, cb) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => cb(raw ? JSON.parse(raw) : {}));
};

const MODEL_LISTS = {
  UNETLoader: { unet_name: ["flux1-krea-dev_fp8_scaled.safetensors", "minimax_h3_fl2va_pruned_fp8_scaled.safetensors"] },
  DualCLIPLoader: { clip_name1: ["clip_l.safetensors", "t5xxl_fp8_e4m3fn_scaled.safetensors"], clip_name2: ["clip_l.safetensors", "t5xxl_fp8_e4m3fn_scaled.safetensors"] },
  CLIPLoader: { clip_name: ["qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"] },
  VAELoader: { vae_name: ["ae.safetensors", "minimax_h3_video_vae_fp16.safetensors", "minimax_h3_audio_vae_fp32.safetensors"] },
  LoraLoaderModelOnly: { lora_name: ["minimax_h3_fl2v_turbo_4step_v1.0_768p_comfyui_bf16.safetensors"] },
};

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (S.mode === "redirect") {
    res.writeHead(302, { Location: outsideBase + req.url });
    return res.end();
  }
  if (req.method === "POST" && u.pathname === "/interrupt") {
    return readBody(req, (b) => { S.interrupts.push(b); send(res, 200, {}); });
  }
  if (req.method === "POST" && u.pathname === "/queue") {
    return readBody(req, (b) => {
      for (const id of b.delete || []) {
        S.deletes.push(id);
        if (S.mode === "hang-pending" && id === "pid-" + S.posted.length) S.gone = true;
      }
      send(res, 200, {});
    });
  }
  if (u.pathname === "/queue" && S.mode.startsWith("hang") && S.posted.length && !S.gone) {
    const item = [1, "pid-" + S.posted.length, {}, {}, []];
    return send(res, 200, S.mode === "hang-pending"
      ? { queue_running: [], queue_pending: [item] }
      : { queue_running: [item], queue_pending: [] });
  }
  if (req.method === "POST" && u.pathname === "/prompt") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = JSON.parse(raw);
      S.posted.push(body);
      S.inputsAtPost.push(fs.readdirSync(path.join(root, "input")));
      if (S.mode === "validation-error") {
        return send(res, 400, {
          error: { type: "prompt_outputs_failed_validation", message: "Prompt outputs failed validation" },
          node_errors: { "1": { errors: [{ message: "Value not in list", details: "unet_name: 'nope.safetensors' not in []" }], class_type: "UNETLoader" } },
        });
      }
      send(res, 200, { prompt_id: "pid-" + S.posted.length, number: 1, node_errors: {} });
    });
    return;
  }
  if (u.pathname === "/system_stats") {
    return send(res, 200, { system: { comfyui_version: "0.34.0-fake" }, devices: [{ name: "cuda:0 Fake Card", vram_total: 16 * 2 ** 30, vram_free: 12 * 2 ** 30 }] });
  }
  if (u.pathname === "/queue") return send(res, 200, S.queue);
  if (u.pathname.startsWith("/object_info/")) {
    const node = u.pathname.split("/").pop();
    const req_ = Object.fromEntries(Object.entries(MODEL_LISTS[node] || {}).map(([k, v]) => [k, [v]]));
    return send(res, 200, { [node]: { input: { required: req_ } } });
  }
  if (u.pathname.startsWith("/history/")) {
    const pid = u.pathname.split("/").pop();
    S.historyCalls++;
    if (S.historyCalls === 1 || S.mode.startsWith("hang")) return send(res, 200, {}); // still running
    const graph = S.posted.at(-1).prompt;
    const saver = Object.entries(graph).find(([, n]) => /^Save(Image|Video)$/.test(n.class_type));
    const isVideo = saver[1].class_type === "SaveVideo";
    if (S.mode === "exec-error") {
      return send(res, 200, { [pid]: { outputs: {}, status: { status_str: "error", completed: false, messages: [
        ["execution_start", {}],
        ["execution_error", { node_id: "9", node_type: "KSampler", exception_type: "torch.OutOfMemoryError", exception_message: "CUDA out of memory. Tried to allocate 2.50 GiB" }],
      ] } } });
    }
    return send(res, 200, { [pid]: {
      outputs: { [saver[0]]: { images: [{ filename: isVideo ? "clip_00001_.mp4" : "img_00001_.png", subfolder: "scrollcraft", type: "output" }], ...(isVideo ? { animated: [true] } : {}) } },
      status: { status_str: "success", completed: true, messages: [] },
    } });
  }
  if (u.pathname === "/view") {
    if (u.searchParams.get("type") !== "output" || u.searchParams.get("subfolder") !== "scrollcraft") return send(res, 404, { error: "bad view" });
    return u.searchParams.get("filename").endsWith(".mp4")
      ? send(res, 200, fs.readFileSync(CLIP), "video/mp4")
      : send(res, 200, PNG_BYTES, "image/png");
  }
  send(res, 404, { error: "not found " + u.pathname });
});

// a server standing for "anywhere but ComfyUI": a redirect must never reach it
const outside = http.createServer((req, res) => {
  S.outsideHits++;
  send(res, 200, { queue_running: [], queue_pending: [] });
});

let base, outsideBase;
before(async () => {
  await new Promise((r) => outside.listen(0, "127.0.0.1", r));
  outsideBase = `http://127.0.0.1:${outside.address().port}`;
  // The studio recognises ComfyUI's own process on the card only as the verified server
  // (port listener per fake ss, unit MainPID per fake systemctl). Here that is this process.
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); outside.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

function studio(args, env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [STUDIO, ...args], {
      encoding: "utf8",
      timeout: 60_000,
      env: {
        ...process.env,
        STUDIO_COMFY_URL: base,
        STUDIO_COMFY_ROOT: root,
        STUDIO_NVIDIA_SMI: SMI,
        STUDIO_SS: SS,
        STUDIO_SYSTEMCTL: SYSTEMCTL,
        STUDIO_H3_DIR: path.join(HERE, "fixtures", "h3"),
        STUDIO_MEMINFO: meminfo(20),
        STUDIO_POLL_MS: "30",
        FAKE_COMFY_PID: String(process.pid),
        ...env,
      },
    }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }));
  });
}

const probeStreams = (file) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-of", "json", file], { encoding: "utf8" })).streams;

// ------------------------------------------------------------------- cases ----
test("--ar maps to ~2 MP sizes, both sides multiples of 16", async () => {
  const { sizeForAspect } = await import(STUDIO);
  assert.deepEqual(sizeForAspect("16:9"), { width: 1920, height: 1088 });
  assert.deepEqual(sizeForAspect("9:16"), { width: 1088, height: 1920 });
  assert.deepEqual(sizeForAspect("1:1"), { width: 1440, height: 1440 });
  assert.deepEqual(sizeForAspect("4:3"), { width: 1664, height: 1248 });
  assert.deepEqual(sizeForAspect("3:4"), { width: 1248, height: 1664 });
  assert.deepEqual(sizeForAspect("21:9"), { width: 2208, height: 944 });
  const odd = sizeForAspect("5:2");
  assert.equal(odd.width % 16, 0); assert.equal(odd.height % 16, 0);
  assert.ok(Math.abs(odd.width / odd.height - 2.5) < 0.05);
  assert.throws(() => sizeForAspect("wide"));
});

test("still: posts a FLUX.1-Krea-dev graph carrying the prompt, polls, downloads the file", async () => {
  reset();
  const out = path.join(work, "out", "still.png");
  const r = await studio(["still", "a quiet lobby at golden hour", out, "--ar", "9:16", "--quality", "high"]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(r.stdout.trim(), out);
  assert.deepEqual(fs.readFileSync(out), PNG_BYTES);
  assert.equal(S.posted.length, 1);
  assert.ok(S.posted[0].client_id);
  const g = Object.values(S.posted[0].prompt);
  const by = (cls) => g.filter((n) => n.class_type === cls);
  assert.equal(by("UNETLoader")[0].inputs.unet_name, "flux1-krea-dev_fp8_scaled.safetensors");
  assert.equal(by("DualCLIPLoader")[0].inputs.type, "flux");
  assert.equal(by("VAELoader")[0].inputs.vae_name, "ae.safetensors");
  assert.equal(by("FluxGuidance").length, 1);
  assert.ok(by("CLIPTextEncode").some((n) => n.inputs.text === "a quiet lobby at golden hour"));
  const lat = by("EmptySD3LatentImage")[0].inputs;
  assert.deepEqual([lat.width, lat.height], [1088, 1920]);
  assert.equal(by("KSampler")[0].inputs.steps, 28);
  assert.ok(S.historyCalls >= 2, "polled until completed");
  assert.match(r.stderr, /running|queued/);
});

test("still --ref: no local edit model -> exit 3 STUDIO_CANNOT, nothing posted", async () => {
  reset();
  const r = await studio(["still", "x", path.join(work, "r.png"), "--ref", HEAD]);
  assert.equal(r.code, 3);
  assert.match(r.stderr, /STUDIO_CANNOT: reference-guided still \(no local edit model\) — use the paid engine under the site budget, or the client's own photo/);
  assert.equal(S.posted.length, 0);
});

test("shot: H3 FL2VA graph with first+last frame staged into input, 17k+5 frames, audio stripped", async () => {
  reset();
  const out = path.join(work, "out", "shot.mp4");
  const r = await studio(["shot", "slow dolly forward", HEAD, out, "--tail", TAIL, "--dur", "5"]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(r.stdout.trim(), out);
  const g = S.posted[0].prompt;
  const nodes = Object.values(g);
  const i2v = nodes.find((n) => n.class_type === "MiniMaxH3ImageToVideo").inputs;
  assert.equal(i2v.prompt, "slow dolly forward");
  assert.deepEqual([i2v.width, i2v.height, i2v.length], [1152, 640, 124]);
  assert.equal(124 % 17, 5);
  const first = g[i2v.first_frame[0]].inputs.image;
  const last = g[i2v.last_frame[0]].inputs.image;
  assert.notEqual(first, last);
  assert.ok(S.inputsAtPost[0].includes(first), "first frame copied into ComfyUI/input before submit");
  assert.ok(S.inputsAtPost[0].includes(last), "last frame copied into ComfyUI/input before submit");
  assert.equal(nodes.find((n) => n.class_type === "UNETLoader").inputs.unet_name, "minimax_h3_fl2va_pruned_fp8_scaled.safetensors");
  assert.ok(nodes.some((n) => n.class_type === "LoraLoaderModelOnly"));
  // the staged frames are exactly the clip size (scaled + center-cropped), and real copies
  // were made — not symlinks. They are removed again once the job is done.
  const streams = probeStreams(out);
  assert.ok(streams.some((s) => s.codec_type === "video"));
  assert.ok(!streams.some((s) => s.codec_type === "audio"), "audio track stripped");
  assert.equal(fs.readdirSync(path.join(root, "input")).length, 0, "staged copies cleaned up");
});

test("shot: staged frames are scaled/cropped to the clip size", async () => {
  reset();
  const out = path.join(work, "out", "shot-sq.mp4");
  const r = await studio(["shot", "orbit", HEAD_SQ, out], { STUDIO_KEEP_INPUTS: "1" });
  assert.equal(r.code, 0, r.stderr);
  const i2v = Object.values(S.posted[0].prompt).find((n) => n.class_type === "MiniMaxH3ImageToVideo").inputs;
  assert.equal(i2v.width, i2v.height, "square head -> square clip");
  assert.ok(i2v.width * i2v.height <= 1152 * 640);
  assert.equal(i2v.width % 32, 0);
  assert.equal(i2v.last_frame, undefined, "no --tail -> no last frame");
  const staged = path.join(root, "input", S.inputsAtPost[0][0]);
  assert.ok(!fs.lstatSync(staged).isSymbolicLink());
  const s = probeStreams(staged)[0];
  assert.deepEqual([s.width, s.height], [i2v.width, i2v.height]);
  for (const f of fs.readdirSync(path.join(root, "input"))) fs.rmSync(path.join(root, "input", f));
});

test("shot --dur 20: beyond the studio's 15 s -> exit 3 STUDIO_CANNOT", async () => {
  reset();
  const r = await studio(["shot", "x", HEAD, path.join(work, "long.mp4"), "--dur", "20"]);
  assert.equal(r.code, 3);
  assert.match(r.stderr, /STUDIO_CANNOT: .*15/);
  assert.equal(S.posted.length, 0);
});

test("gate: low RAM -> exit 4 STUDIO_BUSY naming the condition, nothing posted", async () => {
  reset();
  const r = await studio(["still", "x", path.join(work, "g.png")], { STUDIO_MEMINFO: meminfo(6) });
  assert.equal(r.code, 4);
  assert.match(r.stderr, /STUDIO_BUSY: RAM available 6\.0 GiB < 12/);
  assert.equal(S.posted.length, 0);
});

test("gate: card busy with ANOTHER process -> exit 4", async () => {
  reset();
  const r = await studio(["still", "x", path.join(work, "g.png")], { FAKE_GPU_USED: "9500", FAKE_COMFY_MIB: "1000" });
  assert.equal(r.code, 4);
  assert.match(r.stderr, /STUDIO_BUSY: card busy: 8500 MiB used outside ComfyUI > 3000/);
});

test("gate: ComfyUI's own resident model memory does not refuse the next job", async () => {
  reset();
  const out = path.join(work, "out", "second.png");
  const r = await studio(["still", "x", out], { FAKE_GPU_USED: "9500", FAKE_COMFY_MIB: "9000" });
  assert.equal(r.code, 0, r.stderr);
  assert.ok(fs.existsSync(out));
});

test("gate: low swap -> exit 4", async () => {
  reset();
  const r = await studio(["still", "x", path.join(work, "g.png")], { STUDIO_MEMINFO: meminfo(20, 0.1) });
  assert.equal(r.code, 4);
  assert.match(r.stderr, /STUDIO_BUSY: swap free 10 % < 25 %/);
});

test("gate: ComfyUI queue busy -> exit 4", async () => {
  reset();
  S.queue = { queue_running: [[1, "someone-else", {}, {}, []]], queue_pending: [] };
  const r = await studio(["still", "x", path.join(work, "g.png")]);
  assert.equal(r.code, 4);
  assert.match(r.stderr, /STUDIO_BUSY: ComfyUI queue busy: 1 running, 0 pending/);
  assert.equal(S.posted.length, 0);
});

test("ComfyUI execution error -> exit 1 naming the node and the message", async () => {
  reset();
  S.mode = "exec-error";
  const r = await studio(["still", "x", path.join(work, "e.png")]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ERROR: .*node 9 \(KSampler\).*CUDA out of memory/);
});

test("ComfyUI validation error at submit -> exit 1 naming the node error", async () => {
  reset();
  S.mode = "validation-error";
  const r = await studio(["still", "x", path.join(work, "v.png")]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ERROR: .*UNETLoader.*Value not in list/);
});

test("probe: one line each for server, card, queue, models and gate", async () => {
  reset();
  const r = await studio(["probe"]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /^comfyui: reachable .* version 0\.34\.0-fake$/m);
  assert.match(r.stdout, /^gpu: cuda:0 Fake Card .*used 4096 MiB.*free 12288 MiB/m);
  assert.match(r.stdout, /^queue: 0 running, 0 pending$/m);
  assert.match(r.stdout, /^models flux: ok/m);
  assert.match(r.stdout, /^models h3: ok/m);
  assert.match(r.stdout, /^gate: ok/m);
});

test("only 127.0.0.1 is contacted", async () => {
  const r = await studio(["probe"], { STUDIO_COMFY_URL: "http://example.com:8188" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ERROR: .*127\.0\.0\.1/);
});

// ------------------------------------------------- fail-closed and cleanup ----
const inputs = () => fs.readdirSync(path.join(root, "input"));
const clearInputs = () => { for (const f of inputs()) fs.rmSync(path.join(root, "input", f)); };

test("gate: a missing, invalid or inconsistent reading refuses (exit 4), it never passes", async () => {
  const cases = [
    [{ FAKE_GPU_USED: "N/A" }, /STUDIO_BUSY: GPU reading unavailable/],
    [{ FAKE_COMFY_MIB: "[N/A]" }, /STUDIO_BUSY: GPU reading unavailable/],
    [{ FAKE_GPU_USED: "20000" }, /STUDIO_BUSY: GPU reading unavailable/],
    [{ STUDIO_NVIDIA_SMI: path.join(work, "no-such-smi") }, /STUDIO_BUSY: GPU reading unavailable/],
    [{ STUDIO_MEMINFO: meminfoRaw("no-avail", "MemTotal: 33554432 kB\nSwapTotal: 0 kB\nSwapFree: 0 kB\n") }, /STUDIO_BUSY: RAM reading unavailable/],
    [{ STUDIO_MEMINFO: path.join(work, "no-such-meminfo") }, /STUDIO_BUSY: RAM reading unavailable/],
    [{ STUDIO_MEMINFO: meminfoRaw("no-swap", "MemAvailable: 20971520 kB\n") }, /STUDIO_BUSY: swap reading unavailable/],
    [{ STUDIO_MEMINFO: meminfoRaw("bad-swap", "MemAvailable: 20971520 kB\nSwapTotal: 100 kB\nSwapFree: 200 kB\n") }, /STUDIO_BUSY: swap reading unavailable/],
  ];
  for (const [env, re] of cases) {
    reset();
    const r = await studio(["still", "x", path.join(work, "nan.png")], env);
    assert.equal(r.code, 4, `${JSON.stringify(env)}: ${r.stderr}`);
    assert.match(r.stderr, re);
    assert.equal(S.posted.length, 0);
  }
});

test("gate: a foreign GPU process started from ComfyUI's folder is counted (only the verified server is discounted)", async () => {
  reset();
  const { spawn } = await import("node:child_process");
  const intruder = spawn("sleep", ["30"], { cwd: root, stdio: "ignore" });
  try {
    const r = await studio(["still", "x", path.join(work, "f.png")],
      { FAKE_GPU_USED: "9500", FAKE_COMFY_MIB: "1000", FAKE_OTHER_PID: String(intruder.pid), FAKE_OTHER_MIB: "8000" });
    assert.equal(r.code, 4, r.stderr);
    assert.match(r.stderr, /STUDIO_BUSY: card busy: 8500 MiB used outside ComfyUI > 3000/);
    assert.equal(S.posted.length, 0);
  } finally { intruder.kill(); }
});

test("gate: when the ComfyUI server process cannot be verified, nothing is discounted", async () => {
  // resident ComfyUI memory alone passes when verified (see above); unverified, it counts
  for (const env of [
    { FAKE_SS_FAIL: "1", FAKE_SYSTEMCTL_FAIL: "1" },
    { FAKE_LISTEN_PID: "999999", FAKE_MAIN_PID: "999998" },
  ]) {
    reset();
    const r = await studio(["still", "x", path.join(work, "u.png")], { FAKE_GPU_USED: "9500", FAKE_COMFY_MIB: "9000", ...env });
    assert.equal(r.code, 4, `${JSON.stringify(env)}: ${r.stderr}`);
    assert.match(r.stderr, /STUDIO_BUSY: card busy: 9500 MiB used outside ComfyUI > 3000/);
  }
  // one reading alone is enough
  for (const env of [{ FAKE_SS_FAIL: "1" }, { FAKE_SYSTEMCTL_FAIL: "1" }]) {
    reset();
    const r = await studio(["still", "x", path.join(work, "u1.png")], { FAKE_GPU_USED: "9500", FAKE_COMFY_MIB: "9000", ...env });
    assert.equal(r.code, 0, `${JSON.stringify(env)}: ${r.stderr}`);
  }
});

test("a redirect from ComfyUI is refused, never followed", async () => {
  reset();
  S.mode = "redirect";
  const r = await studio(["still", "x", path.join(work, "redir.png")]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ERROR: .*redirect/);
  assert.equal(S.outsideHits, 0, "the redirect target was contacted");
  assert.equal(S.posted.length, 0);
});

test("shot: ffmpeg failing while staging leaves nothing in ComfyUI/input", async () => {
  reset();
  clearInputs();
  const r = await studio(["shot", "x", HEAD, path.join(work, "out", "ff.mp4"), "--tail", TAIL],
    { SCROLLCRAFT_FFMPEG: path.join(BADBIN, "ffmpeg") });
  assert.equal(r.code, 1);
  assert.equal(S.posted.length, 0);
  assert.deepEqual(inputs(), [], "partial staged frame left behind");
});

test("shot timeout: a pending job is deleted from ComfyUI's queue, then the inputs go", async () => {
  reset();
  clearInputs();
  S.mode = "hang-pending";
  const r = await studio(["shot", "x", HEAD, path.join(work, "out", "tp.mp4"), "--tail", TAIL], { STUDIO_TIMEOUT_MS: "150" });
  assert.equal(r.code, 1);
  assert.match(r.stderr, /ERROR: .*timed out/);
  assert.deepEqual(S.deletes, ["pid-1"]);
  assert.equal(S.interrupts.length, 0, "a pending job is deleted, not interrupted");
  assert.deepEqual(inputs(), []);
});

test("shot timeout: a running job that does not stop keeps its inputs, named with the prompt id", async () => {
  reset();
  clearInputs();
  S.mode = "hang-running";
  const r = await studio(["shot", "x", HEAD, path.join(work, "out", "tr.mp4"), "--tail", TAIL], { STUDIO_TIMEOUT_MS: "150" });
  assert.equal(r.code, 1);
  assert.ok(S.interrupts.length >= 1, "the running job was interrupted");
  assert.equal(S.deletes.length, 0);
  const kept = inputs();
  assert.equal(kept.length, 2, "both frames kept while the job may still read them");
  for (const f of kept) assert.ok(r.stderr.includes(f), `kept file ${f} named`);
  assert.match(r.stderr, /pid-1/);
  clearInputs();
});

test("a remote image URL as frame or ref -> exit 3, nothing fetched or posted", async () => {
  const want = /STUDIO_CANNOT: remote image URL — download it to a local file first/;
  for (const args of [
    ["shot", "x", "https://example.com/head.png", path.join(work, "u.mp4")],
    ["shot", "x", HEAD, path.join(work, "u.mp4"), "--tail", "http://example.com/tail.png"],
    ["still", "x", path.join(work, "u.png"), "--ref", "https://example.com/ref.png"],
  ]) {
    reset();
    const r = await studio(args);
    assert.equal(r.code, 3, `${args.join(" ")}: ${r.stderr}`);
    assert.match(r.stderr, want);
    assert.equal(S.posted.length, 0);
  }
});

test("shotSize: never above 1152x640 pixels, both sides >= 256; beyond 1:3 .. 3:1 -> exit 3", async () => {
  const { shotSize } = await import(STUDIO);
  for (let r = 1 / 3; r <= 3.0001; r *= 1.05) {
    const { width, height } = shotSize(1000 * r, 1000);
    assert.ok(width * height <= 1152 * 640, `${r}: ${width}x${height}`);
    assert.ok(width >= 256 && height >= 256, `${r}: ${width}x${height}`);
  }
  assert.ok(shotSize(640, 1920).width >= 256, "1:3 itself is allowed");
  for (const [w, h] of [[1000000, 1], [1, 1000000], [1600, 400]]) {
    assert.throws(() => shotSize(w, h), (e) => e.exitCode === 3, `${w}x${h}`);
  }
  reset();
  const r = await studio(["shot", "x", HEAD_WIDE, path.join(work, "wide.mp4")]);
  assert.equal(r.code, 3, r.stderr);
  assert.match(r.stderr, /STUDIO_CANNOT: .*1:3.*3:1/);
  assert.equal(S.posted.length, 0);
  assert.deepEqual(inputs(), []);
});

test("probe: installed but the gate refuses -> exit 4", async () => {
  reset();
  const r = await studio(["probe"], { STUDIO_MEMINFO: meminfo(6) });
  assert.equal(r.code, 4, r.stderr);
  assert.match(r.stdout, /^gate: REFUSES — RAM available 6\.0 GiB < 12/m);
  reset();
  const down = await studio(["probe"], { STUDIO_COMFY_URL: "http://127.0.0.1:1" });
  assert.equal(down.code, 1);
});

test("doctor: studio ready = ok, busy now = busy (yellow), unreachable = FAIL (red)", async () => {
  const doctor = (env) => new Promise((resolve) => {
    execFile(process.execPath, [path.join(HERE, "doctor.mjs")], {
      encoding: "utf8", timeout: 60_000, cwd: work,
      env: {
        ...process.env, SCROLLCRAFT_HOME: path.join(work, "ws"),
        STUDIO_COMFY_URL: base, STUDIO_COMFY_ROOT: root, STUDIO_NVIDIA_SMI: SMI, STUDIO_SS: SS,
        STUDIO_SYSTEMCTL: SYSTEMCTL, STUDIO_H3_DIR: path.join(HERE, "fixtures", "h3"),
        STUDIO_MEMINFO: meminfo(20), FAKE_COMFY_PID: String(process.pid), ...env,
      },
    }, (err, stdout) => resolve(stdout));
  });
  const row = (out) => out.split("\n").find((l) => l.includes("studio (ComfyUI)")) || "";
  reset();
  assert.match(row(await doctor({})), /\[\u001b\[32m ok \u001b\[0m\] studio/);
  reset();
  assert.match(row(await doctor({ STUDIO_MEMINFO: meminfo(6) })), /\[\u001b\[33mbusy\u001b\[0m\] studio/);
  reset();
  assert.match(row(await doctor({ STUDIO_COMFY_URL: "http://127.0.0.1:1" })), /\[\u001b\[31mFAIL\u001b\[0m\] studio/);
});
