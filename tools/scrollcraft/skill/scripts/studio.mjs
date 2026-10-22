#!/usr/bin/env node
/**
 * scrollcraft asset generator: the holding's OWN studio (ComfyUI on its own GPU).
 * The skill's generation CLI: every `studio.mjs still|shot|probe` line in the skill
 * runs here. Free, local, no key; what this exits 3 on is made another way.
 *
 *   POST http://127.0.0.1:8188/prompt          { prompt: <graph>, client_id }
 *   GET  http://127.0.0.1:8188/history/<id>    poll until completed
 *   GET  http://127.0.0.1:8188/view?...        fetch the output
 *
 * COMMANDS
 *   still  <prompt> <out.png> [--ar 16:9] [--ref a.png] [--quality high]
 *          FLUX.1-Krea-dev, about 2 MP (16:9 -> 1920x1088). --quality high = 28
 *          steps, anything else 20. --ref exits 3: there is no local reference-edit
 *          model, and img2img is not a substitute for one.
 *
 *   shot   <prompt> <head.png> <out.mp4> [--tail b.png] [--dur 5]
 *          MiniMax H3 FL2VA (first AND last frame to video). --tail pins the last
 *          frame, the seamless-chain trick. Size follows the head's aspect: 16:9 ->
 *          1152x640 (1280x720 does not fit the card), never above that pixel count;
 *          heads beyond 1:3 .. 3:1 exit 3. Up to 15 s. The written mp4 carries no
 *          audio track. Frames and refs are local files: an http(s) URL exits 3
 *          (the bridge talks to 127.0.0.1 only and fetches nothing).
 *
 *   probe  server, card, queue, model files and the safety gate, one line each.
 *          Exits 0 ready now · 4 installed but the gate refuses now · 1 unreachable
 *          or a model file missing.
 *
 * The graphs are not re-typed here: they come from the studio's own builders,
 * /home/dxb/tools/h3/img.py build() and workflow.py build()/align_frames(),
 * imported as a library (`python3 -I -B -c`, nothing else in that folder runs),
 * so a model file or a LoRA changes in one place only.
 *
 * Exit codes: 0 ok · 1 ERROR · 3 STUDIO_CANNOT (the studio cannot make it; use ChatGPT
 * image or the client's own material) · 4 STUDIO_BUSY (the safety gate refused; try again later).
 *
 * Env: STUDIO_COMFY_URL (default http://127.0.0.1:8188, must be 127.0.0.1),
 *      STUDIO_COMFY_ROOT (default /home/dxb/tools/ComfyUI), STUDIO_H3_DIR,
 *      STUDIO_PYTHON, SCROLLCRAFT_FFMPEG, STUDIO_NVIDIA_SMI, STUDIO_MEMINFO,
 *      STUDIO_SS, STUDIO_SYSTEMCTL (how ComfyUI's own server process is verified),
 *      STUDIO_POLL_MS, STUDIO_TIMEOUT_MS (overrides the still/shot wait),
 *      STUDIO_KEEP_INPUTS=1 (keep the staged frames for a look),
 *      DXB_MEDIA_GPU_BUSY_MIB / DXB_MEDIA_RAM_FREE_GIB / DXB_MEDIA_SWAP_FREE_FRAC.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const COMFY = (process.env.STUDIO_COMFY_URL || "http://127.0.0.1:8188").replace(/\/+$/, "");
const ROOT = process.env.STUDIO_COMFY_ROOT || "/home/dxb/tools/ComfyUI";
const H3_DIR = process.env.STUDIO_H3_DIR || "/home/dxb/tools/h3";
const PYTHON = process.env.STUDIO_PYTHON || "python3";
const FFMPEG = process.env.SCROLLCRAFT_FFMPEG || "ffmpeg";
const FFPROBE = process.env.SCROLLCRAFT_FFMPEG
  ? path.join(path.dirname(FFMPEG), path.basename(FFMPEG).replace(/ffmpeg/i, "ffprobe"))
  : "ffprobe";
const NVIDIA_SMI = process.env.STUDIO_NVIDIA_SMI || "nvidia-smi";
const MEMINFO = process.env.STUDIO_MEMINFO || "/proc/meminfo";
const SS = process.env.STUDIO_SS || "ss";
const SYSTEMCTL = process.env.STUDIO_SYSTEMCTL || "systemctl";
const COMFY_UNIT = "dxb-comfyui.service";
const POLL_MS = Number(process.env.STUDIO_POLL_MS || 2000);
const TIMEOUT_MS = Number(process.env.STUDIO_TIMEOUT_MS) || null;

// The holding's media lane refuses a GPU job while the card (>3000 MiB used), the RAM
// (<12 GiB available) or the swap (<25 % free) is busy — packages/outbox-executor/src/
// media-lane.ts MEDIA_LIMITS + defaultResourceCheck(). Same thresholds, same env names.
// One difference, on purpose: the lane counts the WHOLE card, so ComfyUI keeping FLUX
// resident after a still would refuse the next still. Here ComfyUI's own process memory
// is subtracted — it is the studio's cache, and ComfyUI evicts it itself when the next
// model needs the room. Anything else holding the card still refuses, and so does any
// reading that is missing or does not add up: the gate fails closed.
const LIMITS = {
  gpuBusyMib: Number(process.env.DXB_MEDIA_GPU_BUSY_MIB ?? 3000),
  ramFreeGib: Number(process.env.DXB_MEDIA_RAM_FREE_GIB ?? 12),
  swapFreeFrac: Number(process.env.DXB_MEDIA_SWAP_FREE_FRAC ?? 0.25),
};

const STILL_AREA = 1920 * 1088;   // measured 2026-10-15: 67 s on this card
const SHOT_AREA = 1152 * 640;     // measured 2026-10-15: 5 s clip in 153 s; 1280x720 does not fit
const SHOT_MAX_ASPECT = 3;        // 1:3 .. 3:1 keeps both clip sides >= 256 at SHOT_AREA
const SHOT_MIN_SIDE = 256;
const MAX_SHOT_SECONDS = 15;      // H3's trained range ends at 362 frames (~15.1 s)
const FLUX_GUIDANCE = 4.5;        // Krea-dev's own card

class StudioCannot extends Error { constructor(m) { super(m); this.exitCode = 3; } }
class StudioBusy extends Error { constructor(m) { super(m); this.exitCode = 4; } }

// ------------------------------------------------------------- helpers ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function flag(argv, name, dflt = null) {
  const i = argv.indexOf(name);
  return i > -1 && argv[i + 1] ? argv[i + 1] : dflt;
}
function flags(argv, name) {
  const out = [];
  argv.forEach((a, i) => { if (a === name && argv[i + 1]) out.push(argv[i + 1]); });
  return out;
}

function parseAspect(ar) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*[:x]\s*(\d+(?:\.\d+)?)\s*$/.exec(String(ar));
  if (!m || !Number(m[1]) || !Number(m[2])) throw new Error(`bad --ar "${ar}" (want W:H, e.g. 16:9)`);
  return Number(m[1]) / Number(m[2]);
}

/** Still size for an aspect: the measured 1920x1088 pixel count, both sides multiples of 16. */
export function sizeForAspect(ar) {
  const r = parseAspect(ar);
  const s16 = (v) => Math.max(16, Math.round(v / 16) * 16);
  return { width: s16(Math.sqrt(STILL_AREA * r)), height: s16(Math.sqrt(STILL_AREA / r)) };
}

/** Clip size for a head image: the measured sizes for 16:9 / 9:16, otherwise the same
 *  aspect at no more than 1152x640's pixel count, on H3's 32-pixel step. A head beyond
 *  1:3 .. 3:1 is refused (exit 3): the clip would be a sliver. */
export function shotSize(w, h) {
  const r = w / h;
  if (!(r >= 1 / SHOT_MAX_ASPECT && r <= SHOT_MAX_ASPECT)) {
    throw new StudioCannot(`a ${w}x${h} head image (the studio's clips stay between 1:${SHOT_MAX_ASPECT} and ${SHOT_MAX_ASPECT}:1) — crop it first`);
  }
  if (Math.abs(Math.log(r / (16 / 9))) < 0.03) return { width: 1152, height: 640 };
  if (Math.abs(Math.log(r / (9 / 16))) < 0.03) return { width: 640, height: 1152 };
  const f32 = (v) => Math.max(32, Math.floor(v / 32) * 32);
  const size = { width: f32(Math.sqrt(SHOT_AREA * r)), height: f32(Math.sqrt(SHOT_AREA / r)) };
  if (size.width * size.height > SHOT_AREA || size.width < SHOT_MIN_SIDE || size.height < SHOT_MIN_SIDE) {
    throw new Error(`clip size ${size.width}x${size.height} for ${w}x${h} is outside the measured envelope`);
  }
  return size;
}

const isUrl = (v) => /^https?:\/\//i.test(String(v));
function refuseUrls(...vals) {
  if (vals.some(isUrl)) throw new StudioCannot("remote image URL — download it to a local file first");
}

function assertLocal() {
  let host;
  try { host = new URL(COMFY).hostname; } catch { host = null; }
  if (host !== "127.0.0.1") throw new Error(`STUDIO_COMFY_URL must point at 127.0.0.1, got ${COMFY}`);
}

// redirect: "error" — a redirect is a failure, never followed, so nothing but 127.0.0.1 is contacted.
async function comfy(p, init = {}) {
  try {
    return await fetch(COMFY + p, { ...init, redirect: "error", signal: AbortSignal.timeout(60_000) });
  } catch (e) {
    const why = e.cause?.code || e.cause?.message || e.message;
    if (/redirect/i.test(String(e.cause?.message))) throw new Error(`ComfyUI at ${COMFY} answered ${p} with a redirect — refused, not followed`);
    throw new Error(`ComfyUI not reachable at ${COMFY} (${why})`);
  }
}
async function getJson(p) {
  const res = await comfy(p);
  if (!res.ok) throw new Error(`GET ${p}: HTTP ${res.status}`);
  return res.json();
}

// The graph comes from the studio's own builders; only their module bodies run (defs only).
const PY_BUILD = String.raw`
import json, sys
spec = json.loads(sys.argv[1])
sys.path.insert(0, spec["h3_dir"])
if spec["kind"] == "still":
    import img
    g = img.build(spec["prompt"], spec["width"], spec["height"], spec["steps"],
                  spec["guidance"], spec["seed"], spec["prefix"])
    print(json.dumps({"graph": g}))
else:
    import workflow
    n = workflow.align_frames(spec["seconds"])
    g = workflow.build(spec["prompt"], spec["width"], spec["height"], n, seed=spec["seed"],
                       prefix=spec["prefix"], first_frame=spec.get("first_frame"),
                       last_frame=spec.get("last_frame"))
    print(json.dumps({"graph": g, "frames": n}))
`;
function buildGraph(spec) {
  const out = execFileSync(PYTHON, ["-I", "-B", "-c", PY_BUILD, JSON.stringify({ h3_dir: H3_DIR, ...spec })],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return JSON.parse(out);
}

const newSeed = () => crypto.randomInt(1, 2 ** 31 - 1);
const jobId = () => crypto.randomUUID().slice(0, 8);

function ffprobeSize(file) {
  const out = execFileSync(FFPROBE, ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file], { encoding: "utf8" }).trim();
  const [w, h] = out.split("\n")[0].split("x").map(Number);
  if (!w || !h) throw new Error(`cannot read the size of ${file}`);
  return { w, h };
}

/** Scale + center-crop a frame to exactly W x H and COPY it into ComfyUI/input
 *  (a symlink resolving outside input/ is rejected by ComfyUI). Returns the name. */
function stageFrame(file, name, width, height) {
  const dest = path.join(ROOT, "input", name);
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", file,
    "-vf", `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`,
    "-frames:v", "1", "-update", "1", dest], { stdio: ["ignore", "ignore", "pipe"] });
  return name;
}

// ---------------------------------------------------------------- gate ----
/** ComfyUI's own server process, VERIFIED: the PID listening on the ComfyUI port (ss) and
 *  the MainPID of its systemd user unit. When both readings exist they must agree; when
 *  neither can be read the set is empty and nothing is discounted. A process that merely
 *  runs from the ComfyUI folder is not ComfyUI. */
function comfyServerPids() {
  const port = new URL(COMFY).port || "80";
  const quiet = { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10_000 };
  let listen = null, main = null;
  try {
    listen = new Set();
    for (const line of execFileSync(SS, ["-Hltnp"], quiet).split("\n")) {
      const local = line.trim().split(/\s+/)[3] || "";
      const at = local.lastIndexOf(":");
      if (local.slice(at + 1) !== port) continue;
      if (!["127.0.0.1", "0.0.0.0", "*", "[::]", "[::ffff:127.0.0.1]"].includes(local.slice(0, at))) continue;
      for (const m of line.matchAll(/pid=(\d+)/g)) listen.add(Number(m[1]));
    }
  } catch { listen = null; }
  try {
    const v = execFileSync(SYSTEMCTL, ["--user", "show", "-p", "MainPID", "--value", COMFY_UNIT], quiet).trim();
    main = /^\d+$/.test(v) && Number(v) > 0 ? Number(v) : null;
  } catch { main = null; }
  if (listen?.size && main) return listen.has(main) ? new Set([main]) : new Set();
  if (listen?.size) return listen;
  return main ? new Set([main]) : new Set();
}

// A reading is a plain non-negative number or it is no reading ("N/A", "[N/A]", "" -> NaN).
const reading = (s) => (/^\d+(\.\d+)?$/.test(String(s ?? "").trim()) ? Number(String(s).trim()) : NaN);

/** The card, the RAM, the swap and ComfyUI's own queue, read now. Any reading that is
 *  missing, unparsable or inconsistent refuses: the gate never passes on a guess. */
export async function gate() {
  const q = await getJson("/queue");
  const running = q.queue_running?.length ?? 0, pending = q.queue_pending?.length ?? 0;
  if (running + pending > 0) return { ok: false, reason: `ComfyUI queue busy: ${running} running, ${pending} pending` };

  let mi;
  try { mi = fs.readFileSync(MEMINFO, "utf8"); } catch (err) {
    return { ok: false, reason: `RAM reading unavailable: ${String(err.message || err).slice(0, 120)}` };
  }
  const kb = (key) => reading((mi.match(new RegExp(`^${key}:\\s+(\\S+)`, "m")) ?? [])[1]);
  const availKb = kb("MemAvailable"), swapTotal = kb("SwapTotal"), swapFree = kb("SwapFree");
  if (!Number.isFinite(availKb)) return { ok: false, reason: `RAM reading unavailable: no MemAvailable in ${MEMINFO}` };
  if (!Number.isFinite(swapTotal) || !Number.isFinite(swapFree) || swapFree > swapTotal) {
    return { ok: false, reason: `swap reading unavailable: SwapTotal ${swapTotal}, SwapFree ${swapFree} kB in ${MEMINFO}` };
  }
  const availGib = availKb / 1024 / 1024;
  if (availGib < LIMITS.ramFreeGib) {
    return { ok: false, reason: `RAM available ${availGib.toFixed(1)} GiB < ${LIMITS.ramFreeGib}` };
  }
  if (swapTotal > 0 && swapFree / swapTotal < LIMITS.swapFreeFrac) {
    return { ok: false, reason: `swap free ${Math.round((100 * swapFree) / swapTotal)} % < ${Math.round(100 * LIMITS.swapFreeFrac)} %` };
  }
  let g, apps;
  try {
    g = execFileSync(NVIDIA_SMI, ["--query-gpu=name,memory.used,memory.total", "--format=csv,noheader,nounits"], { encoding: "utf8" });
    apps = execFileSync(NVIDIA_SMI, ["--query-compute-apps=pid,used_memory", "--format=csv,noheader,nounits"], { encoding: "utf8" });
  } catch (err) {
    return { ok: false, reason: `GPU reading unavailable: nvidia-smi failed: ${String(err.message || err).slice(0, 120)}` };
  }
  const parts = g.trim().split("\n")[0].split(",").map((s) => s.trim());
  const used = reading(parts[parts.length - 2]), total = reading(parts[parts.length - 1]);
  if (!(total > 0 && used <= total)) {
    return { ok: false, reason: `GPU reading unavailable: memory.used "${parts[parts.length - 2]}", memory.total "${parts[parts.length - 1]}"` };
  }
  const verified = comfyServerPids();
  let comfyMib = 0;
  for (const line of apps.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const [pidS, mibS] = line.split(",").map((s) => s.trim());
    const mib = reading(mibS);
    if (!/^\d+$/.test(pidS ?? "") || !Number.isFinite(mib)) {
      return { ok: false, reason: `GPU reading unavailable: compute app "${line.slice(0, 80)}"` };
    }
    if (verified.has(Number(pidS))) comfyMib += mib;
  }
  if (comfyMib > used) {
    return { ok: false, reason: `GPU reading unavailable: ComfyUI holds ${comfyMib} MiB of ${used} MiB used` };
  }
  const other = used - comfyMib;
  if (other > LIMITS.gpuBusyMib) {
    return { ok: false, reason: `card busy: ${other} MiB used outside ComfyUI > ${LIMITS.gpuBusyMib}` };
  }
  const who = verified.size ? `ComfyUI pid ${[...verified].join(",")} holds ${comfyMib}` : "ComfyUI's server process not verified, nothing discounted";
  return {
    ok: true,
    detail: `card ${other} MiB used outside ComfyUI (${who}), RAM ${availGib.toFixed(1)} GiB available, swap ${swapTotal ? Math.round((100 * swapFree) / swapTotal) : 100} % free`,
  };
}

async function requireGate() {
  const v = await gate();
  if (!v.ok) throw new StudioBusy(v.reason);
}

// ------------------------------------------------------------- comfyui ----
function submitError(j, status) {
  const parts = [];
  if (j?.error) parts.push(j.error.message || JSON.stringify(j.error));
  for (const [id, ne] of Object.entries(j?.node_errors || {})) {
    for (const e of ne.errors || []) parts.push(`node ${id} (${ne.class_type}): ${e.message}${e.details ? " — " + e.details : ""}`);
  }
  return parts.join("; ") || `HTTP ${status}`;
}

async function submit(graph) {
  const res = await comfy("/prompt", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: crypto.randomUUID() }),
  });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.prompt_id) throw new Error(`ComfyUI refused the prompt: ${submitError(j, res.status)}`);
  return j.prompt_id;
}

function executionError(status) {
  for (const [kind, m] of status?.messages || []) {
    if (kind === "execution_error") {
      return `node ${m.node_id} (${m.node_type}): ${m.exception_type ? m.exception_type + ": " : ""}${m.exception_message}`;
    }
    if (kind === "execution_interrupted") return `interrupted at node ${m.node_id} (${m.node_type})`;
  }
  return JSON.stringify(status || {}).slice(0, 500);
}

async function waitPrompt(pid, { label, timeoutMs }) {
  const t0 = Date.now();
  let delay = POLL_MS;
  for (;;) {
    const h = await getJson(`/history/${encodeURIComponent(pid)}`);
    const st = h?.[pid]?.status;
    if (st?.status_str === "error") throw new Error(`${label}: ComfyUI failed at ${executionError(st)}`);
    if (st?.completed) return h[pid].outputs || {};
    const s = Math.round((Date.now() - t0) / 1000);
    if (Date.now() - t0 > timeoutMs) {
      throw Object.assign(new Error(`${label}: timed out after ${s}s (prompt ${pid})`), { timedOut: true });
    }
    const q = await getJson("/queue").catch(() => null);
    const queued = q?.queue_pending?.some((it) => it?.[1] === pid);
    process.stderr.write(`  ${label}: ${queued ? "queued" : "running"} (${s}s)\n`);
    await sleep(delay);
    delay = Math.min(delay * 1.25, 10_000);
  }
}

/** Take a timed-out job back out of ComfyUI: delete it while pending, interrupt it only
 *  when it is the running one. True only once ComfyUI's queue confirms it is gone. */
async function cancelPrompt(pid) {
  const where = async () => {
    const q = await getJson("/queue");
    if (q?.queue_pending?.some((it) => it?.[1] === pid)) return "pending";
    if (q?.queue_running?.some((it) => it?.[1] === pid)) return "running";
    return Array.isArray(q?.queue_pending) && Array.isArray(q?.queue_running) ? "gone" : "unknown";
  };
  const post = (p, body) => comfy(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    for (let i = 0; i < 10; i++) {
      const w = await where();
      if (w === "gone") return true;
      if (i === 0 && w === "pending") await post("/queue", { delete: [pid] });
      if (i === 0 && w === "running") await post("/interrupt", { prompt_id: pid });
      await sleep(POLL_MS);
    }
  } catch { /* an unreadable queue is not a confirmation */ }
  return false;
}

function outputFiles(outputs) {
  const files = [];
  for (const o of Object.values(outputs)) {
    for (const v of Object.values(o)) {
      for (const f of Array.isArray(v) ? v : []) {
        if (f && typeof f === "object" && f.filename) files.push(f);
      }
    }
  }
  return files.filter((f) => (f.type || "output") === "output");
}

async function fetchOutput(f, dest) {
  const qs = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || "", type: f.type || "output" });
  const res = await comfy(`/view?${qs}`);
  if (!res.ok) throw new Error(`download ${res.status} ${f.subfolder ? f.subfolder + "/" : ""}${f.filename}`);
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
  fs.writeFileSync(path.resolve(dest), Buffer.from(await res.arrayBuffer()));
  return dest;
}

// ------------------------------------------------------------ commands ----
async function still(rest) {
  const [prompt, out] = rest;
  if (!prompt || !out) throw new Error('usage: studio.mjs still "<prompt>" <out.png> [--ar 16:9] [--ref a.png] [--quality high]');
  refuseUrls(...flags(rest, "--ref"));
  if (flags(rest, "--ref").length) {
    throw new StudioCannot("reference-guided still (no local edit model) — use ChatGPT image, or the client's own photo");
  }
  const { width, height } = sizeForAspect(flag(rest, "--ar", "16:9"));
  const steps = flag(rest, "--quality", "high") === "high" ? 28 : 20;
  await requireGate();
  const { graph } = buildGraph({
    kind: "still", prompt, width, height, steps, guidance: FLUX_GUIDANCE,
    seed: newSeed(), prefix: `scrollcraft/sc_${jobId()}`,
  });
  const pid = await submit(graph);
  const outputs = await waitPrompt(pid, { label: path.basename(out), timeoutMs: TIMEOUT_MS ?? 10 * 60 * 1000 });
  const f = outputFiles(outputs).find((x) => /\.(png|jpe?g|webp)$/i.test(x.filename));
  if (!f) throw new Error(`${path.basename(out)}: completed with no image output: ${JSON.stringify(outputs).slice(0, 300)}`);
  await fetchOutput(f, out);
  console.log(out);
}

async function shot(rest) {
  const [prompt, head, out] = rest;
  if (!prompt || !head || !out) {
    throw new Error('usage: studio.mjs shot "<prompt>" <head.png> <out.mp4> [--tail b.png] [--dur 5]');
  }
  const dur = Number(flag(rest, "--dur", "5"));
  if (!(dur > 0)) throw new Error(`bad --dur "${flag(rest, "--dur")}"`);
  if (dur > MAX_SHOT_SECONDS) {
    throw new StudioCannot(`a ${dur} s clip (the studio's MiniMax H3 lane makes at most ${MAX_SHOT_SECONDS} s per shot) — chain shorter shots with --tail`);
  }
  const tail = flag(rest, "--tail");
  refuseUrls(head, tail);
  for (const f of [head, tail].filter(Boolean)) if (!fs.existsSync(f)) throw new Error("input not found: " + path.resolve(f));

  const src = ffprobeSize(head);
  const { width, height } = shotSize(src.w, src.h);
  await requireGate();

  const id = jobId();
  const staged = [];   // registered BEFORE ffmpeg writes it, so a failed stage leaves nothing
  let leftIn = null;   // the prompt id still inside ComfyUI after a timeout: its inputs stay
  try {
    const first = `sc_${id}_head.png`;
    staged.push(first); stageFrame(head, first, width, height);
    let last = null;
    if (tail) { last = `sc_${id}_tail.png`; staged.push(last); stageFrame(tail, last, width, height); }
    const { graph, frames } = buildGraph({
      kind: "shot", prompt, width, height, seconds: dur, seed: newSeed(),
      prefix: `scrollcraft/sc_${id}`, first_frame: first, last_frame: last,
    });
    process.stderr.write(`  ${path.basename(out)}: ${width}x${height}, ${frames} frames (${(frames / 24).toFixed(2)} s @24fps)\n`);
    const pid = await submit(graph);
    let outputs;
    try {
      outputs = await waitPrompt(pid, { label: path.basename(out), timeoutMs: TIMEOUT_MS ?? 30 * 60 * 1000 });
    } catch (err) {
      if (err.timedOut && !(await cancelPrompt(pid))) {
        leftIn = pid;
        err.message += ` — still in ComfyUI; its inputs are kept: ${staged.map((n) => path.join(ROOT, "input", n)).join(", ")}`;
      } else if (err.timedOut) {
        err.message += " — removed from ComfyUI";
      }
      throw err;
    }
    const f = outputFiles(outputs).find((x) => /\.(mp4|webm|mov)$/i.test(x.filename));
    if (!f) throw new Error(`${path.basename(out)}: completed with no video output: ${JSON.stringify(outputs).slice(0, 300)}`);
    const raw = path.resolve(out) + `.engine-${id}${path.extname(f.filename)}`;
    await fetchOutput(f, raw);
    try {
      // H3 renders a soundtrack beside the picture; a scrubbed clip must not carry one.
      execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", raw,
        "-map", "0:v:0", "-c", "copy", "-an", "-movflags", "+faststart", path.resolve(out)],
        { stdio: ["ignore", "ignore", "pipe"] });
    } finally {
      fs.rmSync(raw, { force: true });
    }
    console.log(out);
  } finally {
    if (process.env.STUDIO_KEEP_INPUTS !== "1" && !leftIn) {
      for (const n of staged) fs.rmSync(path.join(ROOT, "input", n), { force: true });
    }
  }
}

const MODEL_KEYS = ["unet_name", "clip_name", "clip_name1", "clip_name2", "vae_name", "lora_name"];

async function missingModels(graph) {
  const need = [];
  for (const n of Object.values(graph)) {
    for (const k of MODEL_KEYS) if (typeof n.inputs?.[k] === "string") need.push([n.class_type, k, n.inputs[k]]);
  }
  const lists = {};
  const missing = [];
  for (const [cls, k, file] of need) {
    lists[cls] ??= (await getJson(`/object_info/${cls}`))?.[cls]?.input?.required || {};
    const have = lists[cls][k]?.[0];
    if (!Array.isArray(have) || !have.includes(file)) missing.push(file);
  }
  return { count: need.length, missing };
}

async function probe() {
  let stats;
  try { stats = await getJson("/system_stats"); } catch (e) {
    console.log(`comfyui: UNREACHABLE (${e.message})`);
    throw e;
  }
  console.log(`comfyui: reachable ${COMFY}, version ${stats?.system?.comfyui_version ?? "unknown"}`);
  const d = stats?.devices?.[0];
  if (d) {
    const mib = (b) => Math.round(b / 2 ** 20);
    console.log(`gpu: ${String(d.name).replace(/\s*:\s*cudaMallocAsync$/, "")} — VRAM used ${mib(d.vram_total - d.vram_free)} MiB, free ${mib(d.vram_free)} MiB of ${mib(d.vram_total)} MiB`);
  } else {
    console.log("gpu: none reported by ComfyUI");
  }
  const q = await getJson("/queue");
  console.log(`queue: ${q.queue_running?.length ?? 0} running, ${q.queue_pending?.length ?? 0} pending`);

  let bad = false;
  const samples = {
    flux: buildGraph({ kind: "still", prompt: "probe", width: 1920, height: 1088, steps: 28, guidance: FLUX_GUIDANCE, seed: 1, prefix: "probe" }).graph,
    h3: buildGraph({ kind: "shot", prompt: "probe", width: 1152, height: 640, seconds: 5, seed: 1, prefix: "probe", first_frame: "a.png", last_frame: "b.png" }).graph,
  };
  for (const [name, graph] of Object.entries(samples)) {
    const { count, missing } = await missingModels(graph);
    if (missing.length) bad = true;
    console.log(missing.length ? `models ${name}: MISSING ${missing.join(", ")}` : `models ${name}: ok (${count} files)`);
  }
  const v = await gate().catch((e) => ({ ok: false, reason: e.message }));
  console.log(v.ok ? `gate: ok — ${v.detail}` : `gate: REFUSES — ${v.reason}`);
  // 0 ready now · 4 installed but busy now · 1 a model file missing (unreachable threw above)
  if (bad) process.exitCode = 1;
  else if (!v.ok) process.exitCode = 4;
}

// ---------------------------------------------------------------- main ----
async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    assertLocal();
    if (cmd === "probe") await probe();
    else if (cmd === "still") await still(rest);
    else if (cmd === "shot") await shot(rest);
    else {
      console.error(`scrollcraft studio generator (the holding's own GPU; free)

  node studio.mjs probe
  node studio.mjs still "<prompt>" <out.png> [--ar 16:9] [--ref ref.png] [--quality high]
  node studio.mjs shot  "<prompt>" <head.png> <out.mp4> [--tail tail.png] [--dur 5]
`);
      process.exit(1);
    }
  } catch (err) {
    if (err instanceof StudioCannot) { console.error("STUDIO_CANNOT: " + err.message); process.exit(3); }
    if (err instanceof StudioBusy) { console.error("STUDIO_BUSY: " + err.message); process.exit(4); }
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  await main();
}
