#!/usr/bin/env node
/**
 * B36 · Block 3-bis — the construction side's ONLY way to see the holding.
 *
 * It sends a NAME over a unix socket and receives a value. It cannot send SQL,
 * it holds no credential, and there is no second path in this file: if the
 * gateway is not there, the caller fails closed. That is deliberate — a
 * governance gate that silently promotes itself to the owner of everything is
 * exactly the defect the third audit found (ledger-truth.mjs:220-221, a
 * `docker exec … -U postgres` fallback).
 */
import { connect } from "node:net";

export const SOCKET = process.env.DXB_COMPANY_READ_SOCKET
  || `${process.env.XDG_RUNTIME_DIR || "/tmp"}/dxb/company-read.sock`;

export function ask(op, id, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const sock = connect(SOCKET);
    let buf = "";
    const done = (fn, arg) => { try { sock.destroy(); } catch { /* already gone */ } fn(arg); };
    const timer = setTimeout(() => done(reject, new Error(`company read gateway did not answer in ${timeoutMs}ms`)), timeoutMs);
    sock.on("connect", () => sock.write(JSON.stringify({ op, id }) + "\n"));
    sock.on("data", (c) => {
      buf += c.toString("utf8");
      const i = buf.indexOf("\n");
      if (i < 0) return;
      clearTimeout(timer);
      let res;
      try { res = JSON.parse(buf.slice(0, i)); } catch { return done(reject, new Error("gateway answered with something that is not JSON")); }
      if (!res.ok) return done(reject, new Error(res.error || "gateway refused"));
      done(resolve, res.value);
    });
    sock.on("error", (e) => { clearTimeout(timer); done(reject, new Error(`company read gateway unreachable at ${SOCKET}: ${e.code || e.message}`)); });
  });
}

export const askClaim = (id) => ask("ask", id);
