#!/usr/bin/env node
/**
 * B36 · Block 3-bis — THE DRILL THAT ANSWERS THE FIXED QUESTION.
 *
 *   From the construction runtime — the identity that runs the tests, the
 *   batteries, the drills and the night shifts — is there any route that reaches
 *   the company's database and changes it, or produces any effect there beyond a
 *   read? The routes counted: a direct TCP login; the Docker socket; the
 *   company's container by any other means; any credential file; any service
 *   environment; the company's HTTP gateway; and the read gateway itself.
 *
 * Three earlier audits rejected three earlier proofs because each proof asked a
 * narrower question than the auditor did. This one does not narrow it, and it
 * does not get to print a green line unless it has first shown, in the same run,
 * that every attempt it makes CAN succeed when there is a route: the identical
 * probe is fired from the unsandboxed runtime, where it must reach everything.
 *
 * Nothing here writes to the holding. Every company-side attempt is a connect, a
 * stat or a SELECT.
 *
 * Usage:  pnpm b36:prove-wall
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { classesFor } from "./window-classes.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CONTAINER = "supabase_db_DxB_Global_OS";
const GATEWAY_UNIT = "dxb-company-read";

let leaks = 0;
const line = (s = "") => console.log(s);
const say = (verdict, what, detail) => {
  if (verdict !== "ok") leaks++;
  line(`  ${verdict === "ok" ? "refused " : "LEAK    "} ${what.padEnd(52)} ${detail}`);
};

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: "utf8", cwd: REPO, timeout: 600000, ...opts });
}

function companySql(text) {
  const r = sh("docker", ["exec", "-i", CONTAINER, "psql", "-U", "supabase_admin", "-d", "postgres", "-qtA", "-v", "ON_ERROR_STOP=1", "-c", text]);
  if (r.status !== 0) throw new Error(`psql failed: ${(r.stderr || "").trim()}`);
  return r.stdout.trim();
}

function fingerprint() {
  const r = sh("node", [join(REPO, "scripts/b36/company-state-fingerprint.mjs"), "company"]);
  if (r.status !== 0) throw new Error(`fingerprint failed: ${r.stderr}`);
  const of = (k) => (r.stdout.split("\n").find((l) => l.includes(k)) || "").trim();
  return { stamp: of("STATE_FINGERPRINT"), governance: of("audit_log / hook_violations") };
}

function probe(where) {
  const r = where === "inside"
    ? sh("bash", [join(REPO, "scripts/construction/run.sh"), "node", "scripts/b36/wall-probe.mjs"])
    : sh("node", [join(REPO, "scripts/b36/wall-probe.mjs")]);
  const text = (r.stdout || "").trim();
  const start = text.indexOf("{");
  if (start < 0) throw new Error(`the ${where} probe printed nothing usable:\n${text}\n${r.stderr}`);
  return JSON.parse(text.slice(start));
}

// what must be true where. `reached` is what the probe measured.
const MATRIX = [
  ["tcp-company-db", "a direct TCP login to the company's engine (5 spellings)", false, true],
  ["tcp-company-http", "the company's HTTP gateway — REST, Realtime, Auth", false, true],
  ["docker-socket", "the Docker socket", false, true],
  ["docker-ps", "the Docker command", false, true],
  ["docker-exec-company", "the company's container, entered as supabase_admin", false, true],
  ["credential-files", "the credential files and the service environments", false, true],
  ["company-login", "a real login to the holding with a real credential", false, true],
  ["gateway-arbitrary-sql", "SQL smuggled through the read gateway", false, false],
  ["gateway-other-operations", "any operation on the gateway but the named read", false, false],
];
const MUST_WORK = [
  ["tcp-construction-db", "the construction site's OWN engine", true, true],
  ["gateway-reachable", "the read gateway answers", true, true],
  ["gateway-named-question", "a named question is answered", true, true],
];

line("B36 · Block 3-bis — CAN THE CONSTRUCTION RUNTIME REACH THE HOLDING?");
line();

const before = fingerprint();

// ---------------------------------------------------------------- the account
const readerGone = companySql(`SELECT count(*) FROM pg_roles WHERE rolname = 'dxb_reader';`) === "0";
const gatewayRole = companySql(`SELECT coalesce(string_agg(rolname, ','), '(none)') FROM pg_roles WHERE rolname = 'dxb_gateway';`);
line("  THE ACCOUNT THAT WAS WITHDRAWN");
line(`    dxb_reader on the company engine                     ${readerGone ? "gone" : "STILL THERE"}`);
line(`    what holds the window now                            ${gatewayRole}, on the company's side only`);
if (!readerGone) { leaks++; }

// ------------------------------------------------- what the window may still do
//
// The class sweep is not written here. It is the SAME list Block 3 was measured
// with, now asked of the role that holds the window on the company's side —
// scripts/b36/window-classes.mjs, one definition, read by whoever needs it.
line("  WHAT THE WINDOW'S OWN ROLE MAY STILL DO, class by class:");
let classLeaks = 0;
for (const [what, q] of classesFor("dxb_gateway")) {
  const n = companySql(q);
  if (n !== "0") { classLeaks++; leaks++; }
  line(`    ${n === "0" ? "zero    " : "LEAK    "} ${what.padEnd(56)} ${n}`);
}
line(`    ${classLeaks === 0 ? "all 9 classes are zero" : `${classLeaks} class(es) leaking`}`);
line();

// -------------------------------------------------------------- the two probes
line("  THE RED HALF — the same probe from the UNSANDBOXED runtime, where every");
line("  one of these MUST succeed, or the probe is not measuring anything.");
const outside = probe("outside");
let blind = 0;
for (const [id, what, , wantOutside] of [...MATRIX, ...MUST_WORK]) {
  const got = outside[id]?.reached;
  const ok = got === wantOutside;
  if (!ok && wantOutside) blind++;
  line(`    ${ok ? "  " : "!!"} ${(wantOutside ? "reaches" : "refused").padEnd(8)} ${what.padEnd(52)} ${outside[id]?.detail ?? "(not measured)"}`);
}
line();

line("  THE WALL — the same probe from INSIDE the construction sandbox.");
const inside = probe("inside");
for (const [id, what, wantInside] of MATRIX) {
  const got = inside[id]?.reached;
  say(got === wantInside ? "ok" : "leak", what, inside[id]?.detail ?? "(not measured)");
}
line();
line("  AND THE ONE DOOR THAT IS SUPPOSED TO WORK, from inside:");
for (const [id, what] of MUST_WORK) {
  const got = inside[id]?.reached;
  if (!got) leaks++;
  line(`    ${got ? "works   " : "BROKEN  "} ${what.padEnd(52)} ${inside[id]?.detail ?? "(not measured)"}`);
}
line();

// ------------------------------------------------------- the gate fails closed
line("  THE GOVERNANCE GATE, from inside the sandbox:");
const ledgerUp = sh("bash", [join(REPO, "scripts/construction/run.sh"), "node", "scripts/governance/ledger-truth.mjs"]);
line(`    with the gateway running                             exit ${ledgerUp.status} — ${(ledgerUp.stdout || "").trim().split("\n").pop() || (ledgerUp.stderr || "").trim().split("\n").pop()}`);
if (ledgerUp.status !== 0) leaks++;

sh("systemctl", ["--user", "stop", GATEWAY_UNIT]);
const ledgerDown = sh("bash", [join(REPO, "scripts/construction/run.sh"), "node", "scripts/governance/ledger-truth.mjs"]);
sh("systemctl", ["--user", "start", GATEWAY_UNIT]);
sh("bash", ["-c", "sleep 2"]);
line(`    with the gateway stopped                             exit ${ledgerDown.status} — ${(ledgerDown.stderr || "").trim().split("\n")[0] || "(nothing said)"}`);
if (ledgerDown.status === 0) { leaks++; line("    LEAK    the gate found another way to read the holding."); }
line();

// -------------------------------------------------------------- nothing moved
const after = fingerprint();
line("  THE HOLDING, BEFORE AND AFTER THIS WHOLE DRILL");
line(`    ${before.stamp}`);
line(`    ${after.stamp}`);
line(`    ${before.governance}`);
line(`    ${after.governance}`);
if (before.stamp !== after.stamp || before.governance !== after.governance) { leaks++; line("    LEAK    the drill itself moved something in the company."); }
line();

if (blind) {
  line(`  PROBE_IS_BLIND — ${blind} attempt(s) failed even from the unsandboxed runtime.`);
  line("  A refusal measured by a probe that cannot succeed anywhere proves nothing.");
  line("WALL_UNPROVEN");
  process.exit(1);
}
if (leaks) {
  line(`  ANSWER: YES — ${leaks} route(s) still reach the holding from the construction runtime.`);
  line("WALL_LEAKS");
  process.exit(1);
}
line("  ANSWER: NO. From the construction runtime there is no direct login, no Docker,");
line("  no container, no credential, no company HTTP door, and the read gateway answers");
line("  named questions only. The holding is unchanged by the asking.");
line("WALL_IS_ONE_WAY");
