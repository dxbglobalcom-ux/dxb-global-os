// node --test scripts/studio.test.mjs
//
// studio.mjs against a FAKE ComfyUI: an http server on a random port, a temp dir as the
// ComfyUI root, a fake nvidia-smi and a fake /proc/meminfo. Nothing here touches the
// real card or the real server.

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
} else {
  console.log("NVIDIA Fake 16GB, " + (process.env.FAKE_GPU_USED || "1200") + ", 16311");
}
`);
fs.chmodSync(SMI, 0o755);

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
  mode: "ok",          // ok | exec-error | validation-error
  queue: { queue_running: [], queue_pending: [] },
};
const reset = () => { S.posted = []; S.inputsAtPost = []; S.historyCalls = 0; S.mode = "ok"; S.queue = { queue_running: [], queue_pending: [] }; };

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
    if (S.historyCalls === 1) return send(res, 200, {}); // still running on the first look
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

let base;
before(async () => {
  // The studio recognises ComfyUI's own process on the card by its working directory
  // (the ComfyUI root). Here the "ComfyUI process" is this test process.
  process.chdir(root);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

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
