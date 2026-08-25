#!/usr/bin/env node
/**
 * B36 · Block 3-bis — WHO OWNS THE DOOR.
 *
 * WHY THIS FILE EXISTS, measured 2026-08-25. A session ran the read gateway by
 * hand to see what it could answer. The gateway's start-up did what it had
 * always done — it removed whatever file was sitting on the socket path and put
 * its own there — so the RESIDENT service, still running and still healthy, lost
 * the door it was listening on and never noticed. When the hand-started copy
 * exited it took the socket with it, and the holding became unreadable until the
 * service was restarted. Nothing was written to the company and no credential
 * moved; the company was simply unanswerable for a minute.
 *
 * The rule this file installs: a process may only ever remove a socket that
 * NOBODY is listening on, and it may only remove on the way out a socket it put
 * there itself. A door with a live listener behind it is never taken.
 *
 * Nothing here opens a database connection or reads a credential — it is the
 * cheapest possible check, so it runs BEFORE the gateway touches either.
 */
import { connect } from "node:net";
import { existsSync, statSync } from "node:fs";

/** How long we wait for a connect() before we assume somebody IS there. The
 *  answer on a unix socket is immediate; a wait that long means a listener that
 *  is busy, and a busy listener is still a listener. */
const PROBE_MS = 1500;

/**
 * Is anything listening on this path?
 *
 *   "absent" — no file there at all; the path is free.
 *   "stale"  — a socket file left behind by a dead process; nobody answers.
 *   "live"   — something accepted our connection. It is not ours to remove.
 *
 * Every unexpected outcome resolves to "live". The cost of being wrong that way
 * is a refusal to start; the cost of being wrong the other way is what happened
 * on 2026-08-25.
 */
export function probeSocket(path) {
  if (!existsSync(path)) return Promise.resolve("absent");
  return new Promise((resolve) => {
    let settled = false;
    const finish = (verdict) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { sock.destroy(); } catch { /* already gone */ }
      resolve(verdict);
    };
    const timer = setTimeout(() => finish("live"), PROBE_MS);
    const sock = connect(path);
    sock.on("connect", () => finish("live"));
    sock.on("error", (e) => finish(e.code === "ECONNREFUSED" || e.code === "ENOENT" ? "stale" : "live"));
  });
}

/**
 * The socket's identity — device and inode, not its name. A path can be
 * re-created by somebody else while we hold it open, and then the name still
 * points at a door that is no longer ours.
 */
export function socketIdentity(path) {
  try {
    const s = statSync(path);
    return `${s.dev}:${s.ino}`;
  } catch {
    return null;
  }
}

/** Is the socket at `path` still the one whose identity we recorded? */
export function ownsSocket(path, identity) {
  return identity !== null && socketIdentity(path) === identity;
}
