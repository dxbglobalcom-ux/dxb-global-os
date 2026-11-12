#!/usr/bin/env node
/**
 * dxb-motion-graphics · sfx — the generated basics.
 *
 * Six effects made from nothing but ffmpeg's own sources (noise and sine through
 * an envelope), so a job always has a whoosh, a pop, a tick, a sub drop and a
 * riser even where the bundled packs are missing. They carry no licence: the
 * output of this file is the holding's own. They are plainer than the recorded
 * files beside them — INDEX.md marks each one "generated".
 *
 *   node synth.mjs [outDir]      outDir defaults to this folder
 *
 * Every file is 48 kHz, 24-bit, mono, peak -3 dBFS, and the same on every run.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 48000;
const PEAK_DBFS = -3;

// White noise in [-1, 1]. random(n) keeps its own seeded state per n, so two
// layers of one effect use different n and every run repeats the same samples.
const noise = (n = 0) => `(random(${n})*2-1)`;
const source = (expr, seconds) => `aevalsrc='${expr}':d=${seconds}:s=${RATE}`;

// One lavfi graph per effect. The envelope is written into the expression, per
// sample; a `volume` filter with eval=frame would step it every 1024 samples.
const BASICS = [
  { file: "whoosh/whoosh-soft-generated-01.wav",   // slow swell and fall, mid band
    graph: `${source(`${noise()}*pow(sin(PI*t/0.9),2)`, 0.9)},bandpass=f=700:width_type=o:w=2` },
  { file: "whoosh/whoosh-sharp-generated-01.wav",  // 50 ms attack, bright, quick decay
    graph: `${source(`${noise()}*if(lt(t,0.05),pow(t/0.05,2),exp(-(t-0.05)*14))`, 0.35)},highpass=f=1800,lowpass=f=9000,afade=t=out:st=0.32:d=0.03` },
  { file: "pop/pop-generated-01.wav",              // sine falling 520 -> 300 Hz
    graph: `${source("sin(2*PI*(520*t-900*t*t))*exp(-t*38)*min(1,t/0.003)", 0.12)},afade=t=out:st=0.1:d=0.02` },
  { file: "tick/tick-generated-01.wav",            // 30 ms of high noise
    graph: `${source(`${noise()}*exp(-t*220)*min(1,t/0.0005)`, 0.03)},highpass=f=3000,lowpass=f=10000,afade=t=out:st=0.025:d=0.005` },
  { file: "sub/sub-drop-generated-01.wav",         // sine falling 90 -> 35 Hz
    graph: `${source("sin(2*PI*(90*t-19.6*t*t))*min(1,t/0.01)*exp(-t*2.2)", 1.4)},afade=t=out:st=1.2:d=0.2` },
  { file: "riser/riser-generated-01.wav",          // low noise first, bright noise late, cut at the top
    graph: `${source(`${noise(0)}*pow(t/2.5,2)`, 2.5)},lowpass=f=900[low];`
         + `${source(`${noise(1)}*pow(t/2.5,4)`, 2.5)},highpass=f=2500,lowpass=f=9000[high];`
         + `[low][high]amix=inputs=2:normalize=0,afade=t=out:st=2.48:d=0.02` },
];

function ffmpeg(args) {
  const run = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" });
  if (run.error) throw new Error(`ffmpeg could not be started: ${run.error.message}`);
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${run.stderr.trim().split("\n").pop()}`);
  return run.stderr;
}

function peakDbfs(graph) {
  const log = ffmpeg(["-f", "lavfi", "-i", graph, "-af", "astats=measure_perchannel=none", "-f", "null", "-"]);
  const peaks = [...log.matchAll(/Peak level dB: (-?[\d.]+)/g)];
  if (peaks.length === 0) throw new Error("ffmpeg reported no peak level (a silent graph?)");
  return Number(peaks.at(-1)[1]);
}

const outDir = process.argv[2] || dirname(fileURLToPath(import.meta.url));
try {
  for (const { file, graph } of BASICS) {
    const gainDb = PEAK_DBFS - peakDbfs(graph);
    const target = join(outDir, file);
    mkdirSync(dirname(target), { recursive: true });
    ffmpeg(["-y", "-f", "lavfi", "-i", graph, "-af", `volume=${gainDb.toFixed(4)}dB`,
      "-ar", String(RATE), "-ac", "1", "-c:a", "pcm_s24le", "-bitexact", target]);
    console.log(`generated ${file}`);
  }
} catch (err) {
  console.error(`synth: ${err.message}`);
  process.exit(1);
}
