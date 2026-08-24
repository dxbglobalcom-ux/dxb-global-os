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
import { existsSync, readFileSync, statSync } from "node:fs";
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

// ------------------------------------ every address the holding answers on
/**
 * NOT A GUESS, AND NOT A LIST OF PORTS. The first wall was broken on 2026-08-24
 * by an auditor who did not attack a port at all — he asked the container for its
 * own address and connected to 172.18.0.6:5432, which no rule had ever named.
 *
 * So the drill now asks Docker the same question the attacker asked, every run:
 * the address of every container belonging to the holding, crossed with every
 * port that container exposes, plus every routable address this host owns and
 * every bridge gateway, crossed with the two published doors. If the holding
 * grows a container tomorrow, the sweep grows with it. If Docker answers nothing,
 * the drill says so and refuses to print a verdict.
 */
function companyAddresses() {
  const out = new Set();
  const names = (sh("docker", ["ps", "--format", "{{.Names}}"]).stdout || "")
    .split("\n").map((x) => x.trim()).filter((n) => n.endsWith("_DxB_Global_OS"));
  for (const n of names) {
    const r = sh("docker", ["inspect", "-f",
      "{{range $k,$v := .NetworkSettings.Networks}}{{$v.IPAddress}} {{$v.GlobalIPv6Address}} {{end}}"
      + "|{{range $p,$c := .Config.ExposedPorts}}{{$p}} {{end}}", n]);
    if (r.status !== 0) continue;
    const [ipPart = "", portPart = ""] = (r.stdout || "").trim().split("|");
    const ips = ipPart.split(/\s+/).filter((x) => x && x !== "<no value>");
    const ports = portPart.split(/\s+/).filter(Boolean).map((x) => x.split("/")[0]);
    for (const ip of ips) for (const port of ports) out.add(`${ip}:${port}`);
  }
  // and the host's own addresses, and each bridge gateway, on the published doors
  const hostIps = (sh("bash", ["-c",
    "ip -o -4 addr show | awk '{print $4}' | cut -d/ -f1"]).stdout || "")
    .split("\n").map((x) => x.trim()).filter(Boolean);
  for (const ip of hostIps) for (const port of [54321, 54322]) out.add(`${ip}:${port}`);
  return [...out];
}

function constructionAddress() {
  const r = sh("docker", ["inspect", "-f",
    "{{range $k,$v := .NetworkSettings.Networks}}{{$v.IPAddress}}{{end}}", "supabase_db_DxB_Build"]);
  const ip = (r.stdout || "").trim();
  return r.status === 0 && ip ? `${ip}:5432` : "";
}

const COMPANY_ADDRS = companyAddresses();
const CONSTRUCTION_ADDR = constructionAddress();

function probe(where) {
  const PROBE = join(REPO, "scripts/b36/wall-probe.mjs");
  // Handed over as arguments, not as environment: the sandbox is entered through
  // `sudo`, which resets the environment, and an env var would arrive empty
  // inside — a sweep of an empty list that looks exactly like a clean sweep.
  const pass = [`--company-addrs=${COMPANY_ADDRS.join(",")}`, `--construction-addr=${CONSTRUCTION_ADDR}`];
  const r = where === "inside"
    ? sh("bash", [join(REPO, "scripts/construction/run.sh"), "node", "scripts/b36/wall-probe.mjs", ...pass])
    : where === "identity"
      // The construction identity, OUTSIDE the sandbox. This is the second wall
      // on its own: no namespace, no bwrap — just the operating system and the
      // kernel's own packet filter.
      ? sh("sudo", ["-n", "-u", "dxbbuild", "node", PROBE, ...pass])
      : sh("node", [PROBE, ...pass]);
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
  ["tcp-company-every-address", "the holding at EVERY address it answers on — container, bridge, LAN", false, true],
  ["company-login-at-container-address", "a real PostgreSQL login at the holding's CONTAINER address", false, true],
  ["gateway-arbitrary-sql", "SQL smuggled through the read gateway", false, false],
  ["gateway-other-operations", "any operation on the gateway but the named read", false, false],
];
/**
 * Proven only in the unsandboxed runtime, on purpose. It fires the container-address
 * login code at the CONSTRUCTION engine's container address, where nothing forbids
 * it, so a refusal above can never be the code failing to work at all. It is not
 * asked of the sandbox, which has no network of any kind and could not reach a
 * container address even if it were allowed to.
 */
const RED_ONLY = [
  ["construction-login-at-container-address", "the same login code, at a CONTAINER address, on the construction engine", null, true],
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
// ------------------------------------------------------ the wall's own file
// Measured HERE, on the host, because inside the sandbox a user namespace maps
// the real root to `nobody` and uid 0 cannot be seen at all.
{
  const WALL = "/usr/local/sbin/dxb-construction-sandbox";
  const st = existsSync(WALL) ? statSync(WALL) : null;
  const sameAsSource = st
    && readFileSync(WALL, "utf8") === readFileSync(join(REPO, "scripts/construction/sandbox.sh"), "utf8");
  line("  THE WALL'S OWN FILE — the construction may not rewrite what confines it");
  line(`    ${WALL}`);
  line(`    owner uid                                            ${st ? st.uid : "(not installed)"}  (must be 0)`);
  line(`    writable by anyone but its owner                     ${st ? ((st.mode & 0o022) ? "YES" : "no") : "-"}`);
  line(`    identical to scripts/construction/sandbox.sh         ${sameAsSource ? "yes" : "NO — they have drifted"}`);
  if (!st || st.uid !== 0 || (st.mode & 0o022) || !sameAsSource) leaks++;
  line();
}

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
line("  THE ADDRESSES THE SWEEP USES — asked of Docker this run, not written down:");
line(`    the holding answers on ${COMPANY_ADDRS.length} address(es):`);
for (const a of COMPANY_ADDRS) line(`      ${a}`);
line(`    the construction's own container address              ${CONSTRUCTION_ADDR || "(none found)"}`);
if (COMPANY_ADDRS.length === 0 || !CONSTRUCTION_ADDR) {
  line("    BLIND   Docker told the drill nothing; a sweep of an empty list is not a sweep.");
}
line();

line("  THE RED HALF — the same probe from the UNSANDBOXED runtime, where every");
line("  one of these MUST succeed, or the probe is not measuring anything.");
const outside = probe("outside");
let blind = (COMPANY_ADDRS.length === 0 || !CONSTRUCTION_ADDR) ? 1 : 0;
for (const [id, what, , wantOutside] of [...MATRIX, ...MUST_WORK, ...RED_ONLY]) {
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
line(`    identity that fired them: ${inside["identity"]?.detail ?? "(not measured)"}`);
if (!/uid=997\b/.test(inside["identity"]?.detail ?? "")) {
  leaks++;
  line("    LEAK    the sandbox did not run as the construction identity (uid 997).");
}
line();
line("  AND THE ONE DOOR THAT IS SUPPOSED TO WORK, from inside:");
for (const [id, what] of MUST_WORK) {
  const got = inside[id]?.reached;
  if (!got) leaks++;
  line(`    ${got ? "works   " : "BROKEN  "} ${what.padEnd(52)} ${inside[id]?.detail ?? "(not measured)"}`);
}
line();

// ---------------------------------------------------------- the second wall
//
// The sandbox has no network at all, so the packet filter below should never
// fire. It is here for the case the sandbox is not used: the construction
// identity, on the bare machine, with nothing between it and the holding but the
// operating system.
line("  THE SECOND WALL — the construction identity `dxbbuild`, OUTSIDE the sandbox,");
line("  with no namespace of any kind between it and the holding:");
const identity = probe("identity");
const SECOND = [
  ["identity", "who is asking", null],
  ["tcp-company-db", "the company's engine, every spelling", false],
  ["tcp-company-http", "the company's HTTP gateway, every spelling", false],
  ["docker-socket", "the Docker socket, talked to and not merely seen", false],
  ["docker-ps", "the Docker command", false],
  ["credential-files", "the credential files and the service environments", false],
  ["company-login", "a real login to the holding", false],
  ["tcp-company-every-address", "the holding at EVERY address it answers on — the attack that broke wall one", false],
  ["company-login-at-container-address", "a real PostgreSQL login at the holding's CONTAINER address", false],
  ["tcp-construction-db", "its OWN engine — this one MUST work", true],
];
for (const [id, what, want] of SECOND) {
  const got = identity[id]?.reached;
  if (want !== null && got !== want) { leaks++; }
  const mark = want === null ? "        " : (got === want ? (want ? "works   " : "refused ") : "LEAK    ");
  line(`    ${mark} ${what.padEnd(52)} ${identity[id]?.detail ?? "(not measured)"}`);
}
// ------------------------------------------ and the shape of the wall itself
/**
 * Not "is a table loaded" — WHAT KIND of table. The wall that failed its audit on
 * 2026-08-24 was loaded, enabled and counting the whole time; it was simply the
 * wrong shape, because it named the ports it forbade instead of the destinations
 * it allowed. So the drill reads the live ruleset and refuses a green verdict
 * unless the kernel is actually holding a default-deny.
 */
const nft = sh("sudo", ["-n", "nft", "list", "table", "inet", "dxb_wall"]);
const rules = (nft.stdout || "").split("\n").map((x) => x.trim()).filter(Boolean);
const denies = rules.filter((r) => /\b(reject|drop)\b/.test(r));
const refused = denies.reduce((n, r) => n + Number((r.match(/counter packets (\d+)/) || [0, 0])[1]), 0);
const refusedBytes = denies.reduce((n, r) => n + Number((r.match(/bytes (\d+)/) || [0, 0])[1]), 0);
// EVERY accept in the table is printed, not only the ones that name a port, so a
// door can never be opened where the report does not show it.
const allowed = rules.filter((r) => /\baccept\b/.test(r) && /counter/.test(r));
// Written as `skuid 997 jump`, never as `skuid != 997 accept`. Measured
// 2026-08-24: a packet the kernel emits with no owning socket carries no skuid,
// so `!= 997` does not match it, it is not accepted either, and it falls into the
// default-deny — which had this machine destroying the loopback replies of the
// CEO's own editor processes for every user on it. The drill refuses a green
// verdict if the wall is ever written back into that shape.
const hasIdentity = rules.some((r) => /meta skuid 997 jump/.test(r));
const negatedIdentity = rules.some((r) => /skuid\s*!=\s*997/.test(r));
const hasDefaultDeny = denies.some((r) => !/dport/.test(r) && /l4proto tcp/.test(r))
  && denies.some((r) => !/dport/.test(r) && !/l4proto/.test(r));
const denyNamesPorts = denies.some((r) => /dport/.test(r));
line(`    the table is loaded                                  ${nft.status === 0 ? "yes" : "NO — LEAK"}`);
line(`    it examines the construction identity, and only it    ${hasIdentity ? "yes" : "NO — LEAK"}`);
line(`    it never tests \`skuid != 997\` (kills ownerless packets) ${negatedIdentity ? "IT DOES — LEAK" : "correct"}`);
line(`    it is a DEFAULT-DENY, not a list of forbidden ports   ${hasDefaultDeny ? "yes" : "NO — LEAK"}`);
line(`    no rule forbids by port number (the shape that failed) ${denyNamesPorts ? "IT DOES — LEAK" : "correct"}`);
line(`    every accept it holds, and what the kernel counted on each:`);
for (const a of allowed) line(`      ${a.replace(/ comment "[^"]*"/, "").slice(0, 96)}`);
line(`    the kernel's own count of refusals so far            ${refused} packets, ${refusedBytes} bytes`);
if (nft.status !== 0 || !hasIdentity || negatedIdentity || !hasDefaultDeny || denyNamesPorts) leaks++;

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
