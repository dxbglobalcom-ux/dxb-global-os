import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { ownsSocket, probeSocket, socketIdentity } from "../../scripts/b36/socket-guard.mjs";

// B36 · Block 3-bis — THE DOOR OF THE HOLDING'S READ GATEWAY IS NOT TAKEN.
//
// THE DEFECT THIS FILE HOLDS, measured 2026-08-25. A session ran
// scripts/b36/company-read-gateway.mjs by hand, passing `--list`, to see what
// the holding could be asked. The file ignored the argument, started a SECOND
// gateway, and its start-up removed whatever sat on the socket path — which was
// the door the RESIDENT service was listening on. The resident service went on
// running, healthy, with nothing in front of it; the holding became unreadable
// (`ledger-truth` printed "the company's read gateway is not answering") until
// the service was restarted. Nothing was written to the company and no
// credential moved.
//
// Three separate faults, and each of these tests holds one of them:
//   1. a second copy removed a socket that had a LIVE listener behind it;
//   2. an argument the file did not understand still started a service;
//   3. on the way out, a copy removed a socket it had never opened.
//
// NO COMPANY CREDENTIAL IS NEEDED HERE, and that is deliberate:
// tests/b36/battery-carries-no-company-key.test.ts forbids the battery a
// connectable address for the holding. Every refusal below happens BEFORE the
// gateway reads a credential or opens a connection, so the whole file runs
// against temporary sockets of its own making.

const REPO = process.cwd();
const GATEWAY = join(REPO, "scripts/b36/company-read-gateway.mjs");

/** A short directory: a unix socket path has ~107 bytes to live in. */
const room = mkdtempSync(join(tmpdir(), "dxbg-"));
const openDoors: Server[] = [];

afterEach(() => {
  while (openDoors.length) {
    const s = openDoors.pop();
    try { s?.close(); } catch { /* already down */ }
  }
});

function listenOn(path: string): Promise<Server> {
  return new Promise((resolve, reject) => {
    const s = createServer(() => { /* a door that opens is enough */ });
    s.on("error", reject);
    s.listen(path, () => { openDoors.push(s); resolve(s); });
  });
}

/** Runs the gateway and hands back both halves of what it said, plus its code. */
function runGateway(args: string[], socket: string): { code: number; said: string } {
  try {
    const out = execFileSync("node", [GATEWAY, ...args], {
      cwd: REPO,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 30_000,
      env: { ...process.env, DXB_COMPANY_READ_SOCKET: socket },
    });
    return { code: 0, said: out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? -1, said: `${err.stdout ?? ""}\n${err.stderr ?? ""}` };
  }
}

describe("B36 · the read gateway's door", () => {
  it("(1) knows a free path, a live listener and a dead socket apart", async () => {
    const free = join(room, "free.sock");
    expect(await probeSocket(free)).toBe("absent");

    const live = join(room, "live.sock");
    await listenOn(live);
    expect(await probeSocket(live)).toBe("live");

    // A socket file with nobody behind it. The listener is killed outright so
    // node never gets to tidy the file away — which is exactly the shape a
    // crashed gateway leaves.
    const dead = join(room, "dead.sock");
    const child = `const {createServer}=require("node:net");createServer(()=>{}).listen(${JSON.stringify(dead)},()=>console.log("up"));`;
    const proc = execFileSync("node", ["-e", `
      const { spawn } = require("node:child_process");
      const p = spawn(process.execPath, ["-e", ${JSON.stringify(child)}], { stdio: ["ignore", "pipe", "ignore"] });
      p.stdout.on("data", () => { p.kill("SIGKILL"); setTimeout(() => { console.log("killed"); process.exit(0); }, 200); });
    `], { encoding: "utf8", timeout: 15_000 });
    expect(proc).toContain("killed");
    expect(existsSync(dead), "the killed listener's socket file should still be on disk").toBe(true);
    expect(await probeSocket(dead)).toBe("stale");
  });

  it("(2) a second gateway REFUSES to start rather than take a live door", async () => {
    const path = join(room, "taken.sock");
    await listenOn(path);
    const before = socketIdentity(path);

    const { code, said } = runGateway([], path);

    expect(code, "the second gateway started anyway").toBe(3);
    expect(said).toMatch(/already listening/);
    expect(said).toMatch(/company-read-client\.mjs/);
    // The door is untouched — the same file, the same inode, still answering.
    expect(existsSync(path), "the live socket was removed").toBe(true);
    expect(socketIdentity(path), "the live socket was replaced").toBe(before);
    expect(await probeSocket(path), "the live listener lost its door").toBe("live");
  });

  it("(3) an argument it does not understand is a refusal, not a service", async () => {
    const path = join(room, "arg.sock");
    await listenOn(path);
    const before = socketIdentity(path);

    // `--list` was the exact word that caused the 2026-08-25 outage.
    const { code, said } = runGateway(["--list-everything-please"], path);

    expect(code, "an unknown argument still started something").toBe(2);
    expect(said).toMatch(/I do not understand/);
    expect(said, "the refusal does not say where questions are actually asked")
      .toMatch(/company-read-client\.mjs/);
    expect(socketIdentity(path), "a refused invocation touched the door").toBe(before);
  });

  it("(4) --list prints the frozen catalogue and never goes near the socket", async () => {
    const path = join(room, "list.sock");
    await listenOn(path);
    const before = socketIdentity(path);

    const { code, said } = runGateway(["--list"], path);

    expect(code, "--list did not exit cleanly").toBe(0);
    // "today" is the one question the gateway adds to the catalogue itself, so
    // it is there whatever claims.json holds.
    expect(said).toMatch(/(^|\n)today\t/);
    expect(socketIdentity(path), "--list touched the door").toBe(before);
    expect(await probeSocket(path), "--list silenced the listener").toBe("live");
  });

  it("(5) a door is only ever ours while the inode we opened is still there", async () => {
    const path = join(room, "identity.sock");
    const first = await listenOn(path);
    const mine = socketIdentity(path);
    expect(ownsSocket(path, mine)).toBe(true);

    // Somebody else puts a different socket at the same NAME.
    await new Promise<void>((r) => first.close(() => r()));
    rmSync(path, { force: true });
    await listenOn(path);

    expect(socketIdentity(path)).not.toBe(mine);
    expect(ownsSocket(path, mine), "a stranger's socket was mistaken for ours").toBe(false);
    expect(ownsSocket(path, null), "a process that opened nothing claims to own a door").toBe(false);
  });

  it("(6) the resident service is told to come back if its door disappears", () => {
    // The other half of the defect: the gateway kept running with no socket in
    // front of it and nothing said so. It now exits, and the unit restarts it.
    const gateway = execFileSync("cat", [GATEWAY], { encoding: "utf8" });
    expect(gateway, "the gateway no longer watches its own door").toMatch(/ownsSocket\(SOCKET, OURS\)/);
    expect(gateway, "the gateway removes a socket without proving it is its own")
      .not.toMatch(/if \(existsSync\(SOCKET\)\) unlinkSync\(SOCKET\);\n?\s*server\.listen/);

    const unit = execFileSync("cat", [join(REPO, "scripts/systemd/dxb-company-read.service")], { encoding: "utf8" });
    expect(unit, "the unit stopped restarting the gateway").toMatch(/Restart=always/);
  });
});

// The room is the test's own; nothing in it belongs to the holding.
process.on("exit", () => { try { rmSync(room, { recursive: true, force: true }); } catch { /* going down */ } });
