import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { judgeLaunch } from "../../apps/dashboard/src/instrumentation.js";

// B36 · Block 4 — THE DASHBOARD MAY NOT BE STARTED BY HAND.
//
// WHY THIS FILE EXISTS, and it is not a hypothetical. Block 4 took the company's
// address out of `apps/dashboard/src/app/api/voice/call/route.ts`, which had been
// inventing one for itself, and `scripts/dashboard.sh` was written the same hour
// to hand it in. The CEO's auditor then asked the only question that matters —
// is the LIVE dashboard actually started that way? — and the answer, measured on
// 2026-08-24 at 22:36, was no:
//
//     next-server (v16.2.10) pid 3785656, up 6h50m, bound to *:3000
//     parent chain → `pnpm --filter ./apps/dashboard dev`, from a session shell
//     grep -c '^DXB_DATABASE_URL=' /proc/3785656/environ  →  0
//
// The CEO's voice line was already broken and nothing said so; the next call
// would have found out. A wrapper nobody is forced to use is a note, not a gate.
//
// WHY IT IS A HOST FILE. The sandboxed half of the battery has its own PID
// namespace and no network, so it cannot see — and must not be able to see — the
// processes running on this machine. The live half of this gate only means
// anything outside the sandbox, so the file is named in scripts/construction/
// battery.sh HOST_FILES beside tests/ops/freeze-guard.test.ts.

const REPO = process.cwd();
const PORT = process.env.DXB_DASHBOARD_PORT ?? "3000";

/** The listening dashboard's pid, or null when nothing is serving. */
function listeningPid(): number | null {
  let out = "";
  try {
    out = execFileSync("ss", ["-ltnp"], { encoding: "utf8" });
  } catch {
    return null; // no `ss` here — the live half simply does not apply
  }
  for (const line of out.split("\n")) {
    if (!new RegExp(`:${PORT}\\s`).test(line)) continue;
    const m = /pid=(\d+)/.exec(line);
    if (m) return Number(m[1]);
  }
  return null;
}

function environOf(pid: number): Record<string, string> {
  const raw = readFileSync(`/proc/${pid}/environ`, "utf8");
  const env: Record<string, string> = {};
  for (const entry of raw.split("\0")) {
    const i = entry.indexOf("=");
    if (i > 0) env[entry.slice(0, i)] = entry.slice(i + 1);
  }
  return env;
}

describe("B36 Block 4 — the dashboard is started by its wrapper or not at all", () => {
  // MEASURE THE INSTRUMENT FIRST: a gate that has never been seen refusing has
  // never been tested. Both refusals below were also reproduced against a real
  // `next dev` on 2026-08-24 — exit 2 and exit 1, nothing left listening.
  it("(0) the judgement refuses a hand-started server, and says which fault it is", () => {
    const bare = judgeLaunch({});
    expect(bare.ok, "a server with no launcher stamp was allowed to serve").toBe(false);
    expect(bare.ok === false && bare.reason).toMatch(/scripts\/dashboard\.sh/);

    const stamped = judgeLaunch({ DXB_DASHBOARD_LAUNCHER: "a hand-typed command" });
    expect(stamped.ok, "a server with no database address was allowed to serve").toBe(false);
    expect(stamped.ok === false && stamped.reason).toMatch(/DXB_DATABASE_URL/);

    const blank = judgeLaunch({ DXB_DASHBOARD_LAUNCHER: "   ", DXB_DATABASE_URL: "   " });
    expect(blank.ok, "whitespace is not a launcher").toBe(false);
  });

  it("(1) and it allows a server the wrapper started", () => {
    const good = judgeLaunch({
      DXB_DASHBOARD_LAUNCHER: "scripts/dashboard.sh dev",
      DXB_DATABASE_URL: "postgresql://user:pw@127.0.0.1:1/db",
    });
    expect(good.ok, "the wrapper's own environment was refused — the gate is stuck shut").toBe(true);
    expect(good.ok === true && good.launcher).toBe("scripts/dashboard.sh dev");
  });

  it("(2) the wrapper really exports both things the gate looks for", () => {
    const wrapper = readFileSync(join(REPO, "scripts/dashboard.sh"), "utf8");
    expect(wrapper, "the wrapper does not stamp the server").toMatch(
      /export DXB_DASHBOARD_LAUNCHER=/,
    );
    expect(wrapper, "the wrapper does not hand in an address").toMatch(/export DXB_DATABASE_URL=/);
    expect(
      wrapper,
      "the wrapper no longer refuses when it has no address to hand in",
    ).toMatch(/no company address found/);
    expect(
      wrapper,
      "the wrapper no longer binds to loopback by default — measured 2026-08-24, the dashboard " +
        "was answering on 192.168.178.44:3000, the home network",
    ).toMatch(/DXB_DASHBOARD_HOST:-127\.0\.0\.1/);

    const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.dashboard, "`pnpm dashboard` no longer goes through the wrapper").toContain(
      "scripts/dashboard.sh",
    );
    expect(pkg.scripts["dashboard:start"]).toContain("scripts/dashboard.sh");
  });

  it("(3) the server refuses at startup, not at the first request", () => {
    const file = join(REPO, "apps/dashboard/src/instrumentation.ts");
    expect(existsSync(file), "Next.js has no startup hook to refuse in any more").toBe(true);
    const text = readFileSync(file, "utf8");
    expect(text, "register() no longer consults the judgement").toMatch(/judgeLaunch\(/);
    expect(text, "a refusal no longer stops the process").toMatch(/process\.exit\(2\)/);
    expect(text, "the build would start failing — it must be exempt").toMatch(
      /phase-production-build/,
    );
  });

  it("(4) LIVE — whatever is serving the dashboard right now was started properly", () => {
    const pid = listeningPid();
    if (pid === null) {
      // Nothing is serving. That is not a failure: the dashboard is started by
      // hand when the CEO wants it, and this case has nothing to judge.
      expect(pid).toBeNull();
      return;
    }
    const env = environOf(pid);
    expect(
      env.DXB_DASHBOARD_LAUNCHER,
      `the dashboard serving :${PORT} (pid ${pid}) was NOT started by scripts/dashboard.sh. ` +
        "Stop it and run `pnpm dashboard`. This is exactly the state the auditor found on " +
        "2026-08-24: a live dashboard with no company address, whose voice-call route would " +
        "fail on the CEO's next call.",
    ).toBeTruthy();
    expect(
      env.DXB_DATABASE_URL,
      `the dashboard serving :${PORT} (pid ${pid}) carries no DXB_DATABASE_URL`,
    ).toBeTruthy();
  });
});
