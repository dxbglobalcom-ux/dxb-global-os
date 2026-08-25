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
import { pathToFileURL } from "node:url";

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

// ---------------------------------------------------------------- as a command
//
// WHY THIS HALF EXISTS, measured 2026-08-25. Until today the only file in this
// folder a person could RUN was the gateway itself — and running the gateway
// starts a second service and takes the door away from the resident one. A
// session that simply wanted to see what the holding could be asked reached for
// the only executable there was, and silenced the company for a minute. So the
// asking side is now the runnable one, and it can do no harm: it holds no
// credential, it opens no door, and it only ever speaks to a gateway that is
// already there.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const usage = () => {
    console.error("dxb company read client — ask the running gateway a named question");
    console.error("");
    console.error("  --ping             is the gateway there?");
    console.error("  --list             the questions it will answer");
    console.error("  --ask <id>         the answer to one of them");
    console.error("");
    console.error(`  socket: ${SOCKET}`);
  };
  const fail = (e) => {
    console.error(`[client] ${e.message || e}`);
    console.error("[client] if nobody is listening: systemctl --user start dxb-company-read");
    process.exit(1);
  };
  try {
    if (argv[0] === "--ping") {
      console.log(await ask("ping"));
    } else if (argv[0] === "--list") {
      for (const id of String(await ask("catalogue")).split(",").filter(Boolean)) console.log(id);
    } else if (argv[0] === "--ask" && argv[1]) {
      console.log(await askClaim(argv[1]));
    } else {
      usage();
      process.exit(argv.length === 0 ? 0 : 2);
    }
  } catch (e) { fail(e); }
}
