// A REAL ENGINE, OFFLINE — the bench every b46 case runs its subject on.
//
// WHY IT EXISTS. The CEO's order of 2026-09-17: "test etmeden asla hata deme. GERÇEK BİR TEST ile
// ancak hataya hata denir koda veya yazıya bakarak değil." So these cases may not assert about the
// research engine by reading it; they must RUN it. But the engine's whole job is to reach the
// outside world, and a test suite may not depend on the weather out there, spend money, or open a
// window on the CEO's screen.
//
// The answer is the one the house already uses (tests/phase7/watchdog.test.ts:86-110): copy the
// engine to a temporary directory, put fake executables in front of it on PATH, and run the REAL
// scripts. Every decision under test — the judge, the cover chain, the page selector, the counter —
// is the engine's own code; only the outside world is a stand-in. The copy is deleted afterwards,
// and nothing is written into the repository (his paperwork ban).
//
// `mcpx.sh` is reached by absolute path inside the engine, not through PATH, so it is overwritten
// INSIDE THE COPY — never in the repository.

import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(resolve(import.meta.filename));
export const REPO = resolve(HERE, "..", "..");
export const SKILL = join(REPO, ".claude/skills/dxb-research");

export interface Bench {
  /** the engine copy's root — .../engine */
  engine: string;
  /** the fake-executable directory placed in front of PATH */
  bin: string;
  /** the temporary root, removed by dispose() */
  root: string;
  dispose(): void;
}

/**
 * THE STAND-IN. One script serves as `opencli`, `curl`, `gh` and `mcpx.sh`; what it answers is
 * decided by two environment variables, so a case picks the outside world it wants:
 *   DXB_STUB_BODY  — a file whose contents are printed as the channel's answer
 *   DXB_STUB_RC    — the exit code to leave with (default 0)
 *   DXB_STUB_ONLY  — when set, only the channel whose name appears in the argv gets the body;
 *                    every other channel gets a plain, healthy result
 *   DXB_STUB_URLS  — every channel answers with twenty addresses of its OWN host, so a case
 *                    can watch which channels the selector actually gives a turn to
 */
const STUB = `#!/usr/bin/env python3
import os, re, sys
body = os.environ.get("DXB_STUB_BODY", "")
rc = int(os.environ.get("DXB_STUB_RC", "0") or 0)
only = os.environ.get("DXB_STUB_ONLY", "")
urls = os.environ.get("DXB_STUB_URLS", "")
argv = " ".join(sys.argv)

def tag():
    """The channel this call belongs to, taken from the command the map wrote."""
    for a in sys.argv[1:]:
        if re.fullmatch(r"[a-z][a-z0-9-]{2,}", a):
            return a
    m = re.search(r"https?://(?:www\\.)?([a-z0-9-]+)\\.", argv)
    return m.group(1) if m else "bench"

if only and only not in argv:
    print("- title: healthy stand-in result\\n  url: https://bench.example/healthy-page")
    sys.exit(0)
if urls:
    t = tag()
    for i in range(20):
        print("- title: %s result %d\\n  url: https://%s.example/thread-%d" % (t, i, t, i))
    sys.exit(rc)
if body:
    sys.stdout.write(open(body, encoding="utf-8").read())
else:
    print("- title: healthy stand-in result\\n  url: https://bench.example/healthy-page")
sys.exit(rc)
`;

/**
 * THE REAL RESEARCH BROWSER IS NOT A STAND-IN. Every browser read of the engine goes through
 * scripts/hidden.py (bin/opencli and fetch.py's browser door import it) to the hidden research
 * Chrome on 127.0.0.1:9333 — a copy of the CEO's signed-in sites. Measured 2026-09-24 with strace:
 * this suite made 90 connections to that port and drove it for real; traced again with the port
 * dead, every caller was N04's quora door or N09's fleet ground (its browser channels and its last
 * resort). hidden.py takes its port from DXB_HIDDEN_PORT, so the bench points it at port 1, where
 * nothing can listen (no user process may bind below 1024): every browser door fails at once with
 * its own named line, exactly as it does when that Chrome is down.
 */
export const DEAD_HIDDEN_PORT = "1";

export function makeBench(): Bench {
  // every case builds its children's env from process.env, so this reaches every run on the bench
  process.env.DXB_HIDDEN_PORT = DEAD_HIDDEN_PORT;
  const root = mkdtempSync(join(tmpdir(), "dxb-b46-"));
  const engine = join(root, "engine");
  // -r, not -a: measured 2026-09-26 in the sandboxed battery (dxbbuild, tmpfs) — `cp -a` tries to
  // preserve ACLs/xattrs and dies with "preserving permissions … Invalid argument"; -r keeps mode bits
  // and symlinks, which is all the bench needs.
  execFileSync("cp", ["-r", SKILL, engine]);
  rmSync(join(engine, "scripts", "__pycache__"), { recursive: true, force: true });
  rmSync(join(engine, "fleet", "__pycache__"), { recursive: true, force: true });
  rmSync(join(engine, "hooks", "__pycache__"), { recursive: true, force: true });

  const bin = join(root, "bin");
  mkdirSync(bin);
  // EVERY BINARY THE CHANNEL MAP CALLS, counted from the map itself: opencli · curl · gh ·
  // bili · flock, plus the readers the chain reaches for. One of them was missed on the first
  // attempt — `bili` — and the bench quietly went out to the real network and brought back
  // 1 458 bytes, which nearly became a finding about the engine. A bench that leaks is worse
  // than no bench.
  for (const name of ["opencli", "curl", "gh", "bili", "yt-dlp", "pdftotext", "scrapling"]) {
    const p = join(bin, name);
    writeFileSync(p, STUB);
    chmodSync(p, 0o755);
  }
  // reached by absolute path inside the engine — so it is replaced in the COPY
  writeFileSync(join(engine, "scripts", "mcpx.sh"), STUB);
  chmodSync(join(engine, "scripts", "mcpx.sh"), 0o755);

  return { engine, bin, root, dispose: () => rmSync(root, { recursive: true, force: true }) };
}

export interface SweepResult {
  stdout: string;
  code: number;
  out: string;
  /** the coverage table, channel name → the verdict printed for it */
  verdicts: Record<string, string>;
}

/**
 * Runs the copy's own sweep.sh, offline, and parses the coverage table it prints.
 * The engine reads its arguments positionally — QUERY then OUT — so the output folder is
 * placed second and the flags follow. (Getting that wrong once made every channel report
 * `FAIL (kod ?)` and nearly turned a bench defect into a finding about the engine.)
 */
export function runSweep(b: Bench, query: string, flags: string[] = [], env: Record<string, string> = {}): SweepResult {
  const out = join(b.root, `out-${Math.random().toString(36).slice(2, 8)}`);
  let stdout = "";
  let code = 0;
  try {
    stdout = execFileSync("bash", [join(b.engine, "scripts", "sweep.sh"), query, out, ...flags], {
      encoding: "utf8",
      env: { ...process.env, ...env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 180_000,
    });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    stdout = String(err.stdout ?? "") + String(err.stderr ?? "");
    code = err.status ?? 1;
  }
  const verdicts: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    const m = /^([a-z0-9][a-z0-9._-]*)\s+\d+\s+\d+\s{2}(.+?)\s*$/.exec(line);
    if (m) verdicts[m[1]] = m[2];
  }
  return { stdout, code, out, verdicts };
}

/** Calls the engine's own judge directly — the one door both the sweep and the chain use. */
export function judge(b: Bench, filePath: string): string {
  return execFileSync("python3", [join(b.engine, "scripts", "rlib.py"), "--judge", filePath], {
    encoding: "utf8",
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
  }).trim();
}

/** Writes a sample page into the bench and returns its path. */
export function sample(b: Bench, name: string, body: string): string {
  const p = join(b.root, name);
  writeFileSync(p, body, "utf8");
  return p;
}

// ── the pages this engine has actually met, kept verbatim as the bench's samples ──────────

/** 135 bytes, exit 0. Measured 2026-09-17: the sweep stamped the channel `ok`. */
export const TAVILY_QUOTA =
  "You reached the monthly keyless Tavily limit. Please add an API key or wait until next month to continue using the keyless access mode.";

/** 102 bytes, exit 0. Measured the same hour, stamped `ok` too. */
export const FIRECRAWL_QUOTA =
  "You've hit Firecrawl's free MCP rate limit. Sign up for a free account to continue with higher limits.";

/** The marker that was dropped from the sweep's word list on 2026-09-17 at 16:17. */
export const ACCESS_DENIED =
  "<html><head><title>Access Denied</title></head><body><h1>Access Denied</h1>" +
  "<p>You don't have permission to access this resource on this server.</p></body></html>";

/**
 * THE PAGE THE ENGINE THREW AWAY. Quora prints its own error sentence at the HEAD of a page that
 * also carries the answers. Measured 2026-09-17, five live openings: 21 573 characters, 1 874 real
 * words, 8 separate people — and the sweep discarded all five because the sentence was there.
 */
export const QUORA_WITH_BANNER =
  "Something went wrong. Wait a moment and try again.\n\n" +
  Array.from({ length: 420 }, (_, i) => `Answer paragraph ${i} in which a real person explains what actually happened to them in production and why they changed their mind about it.`).join("\n");

/** Its login shell, 41 words. This one IS a wall. */
export const QUORA_LOGIN_SHELL =
  "Something went wrong. Wait a moment and try again.\nLogin to Quora\nSign up with Google\n" +
  "Continue with Facebook\nBy continuing you indicate that you have read and agree to the Terms of Service and Privacy Policy.";
