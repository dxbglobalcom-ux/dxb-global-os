#!/usr/bin/env node
/**
 * B36 · Block 6 — THE PROOF COMMAND.   `pnpm verify:separation`
 *
 * ONE command that answers the only question this row was opened for:
 *
 *   Can the construction site enter the company's database, write in it, or get
 *   around the wall — and do the company's own things still work?
 *
 * It answers it in five steps, and it is not allowed to print a green line until
 * it has first shown, in the same run, that each of its instruments can print a
 * RED one:
 *
 *   0. THE INSTRUMENTS PROVE THEMSELVES.  A row really appears on an engine and
 *      the differ must name it; a real write is really accepted by a real login
 *      and the prober must call it accepted; a fallback is really planted in this
 *      repository and the sweep must find it. Each is undone in the same step.
 *   1. The company is photographed: every table in `public` with its row count,
 *      plus the sequences, the large objects and the two governance tables.
 *   2. The whole battery runs — the construction site's entire suite, in its
 *      sandbox, plus the three files that must run on this machine's side.
 *   3. The company is photographed again and the two are subtracted. Any table
 *      whose count moved is RED, and it is named with its delta.
 *   4. A write is attempted against the company as `dxb_gateway` — the only
 *      account that still exists on that engine. Thirteen shapes, including the
 *      three escapes: turning its own read-only setting off, granting itself the
 *      right to write, and minting itself a superuser. Any accepted statement
 *      is RED.
 *   5. This repository is swept for a line that binds the company's address to
 *      DXB_DATABASE_URL. Any hit is RED.
 *
 * WHY THE RED HALF IS NOT OPTIONAL. Three audits rejected three earlier proofs
 * in this row because each measured a refusal with an instrument nobody had ever
 * shown finding anything. On 2026-08-23 a detector in Block 4 reported a
 * comfortable zero because `\b` is a backspace in PostgreSQL's regular
 * expressions. A gate that has never been seen red has never been tested.
 *
 * REGISTERED ADAPTATION, 2026-08-25 — WHAT "RED-FIRST" MEANS NOW.
 * The plan (PLAN.md §"Block 6", written 2026-08-23) says the command must be run
 * "against today's configuration first" and must FAIL on step 4 and step 5. That
 * configuration no longer exists: Block 3-bis withdrew the construction site's
 * login on 2026-08-24 and Block 4 deleted all 95 fallbacks the same day, both
 * accepted. Running this command against 2026-08-23 would mean putting the
 * account and the fallbacks back into the CEO's live company — the exact act the
 * row exists to prevent. His requirement is met instead by step 0, which
 * reproduces the red condition on the CONSTRUCTION engine and in a planted file,
 * every single run, and refuses to continue if any instrument fails to go red.
 *
 * REGISTERED ADAPTATION, 2026-08-25 — WHERE IT IS WIRED IN.
 * The plan says "wired into the battery so it runs with everything else". It
 * cannot be run BY the battery: step 2 IS the battery, and
 * tests/b36/battery-carries-no-company-key.test.ts forbids any file the battery
 * loads from carrying a way into the company — which this command must have. So
 * the battery holds `tests/b36/separation-gate.test.ts`, which imports the
 * judgements below and requires each of them to convict on constructed input,
 * and requires this command to stay registered as `verify:separation`. The
 * brains of the gate are therefore tested on every battery run; the live
 * five-step drill is this command, run whole.
 *
 * WHAT WRITES AND WHAT DOES NOT.
 *   · Against the COMPANY: nothing is written, ever. Every read is a SELECT, and
 *     every write attempt is deliberately refused; each attempt is opened with
 *     BEGIN and closed with ROLLBACK so that even an accepted one would leave
 *     nothing behind — an accepted one is the failure this command exists to
 *     catch, not a change it is willing to make.
 *   · Against the CONSTRUCTION engine: step 0 creates one table and one
 *     temporary account, and removes both in the same step. That engine is
 *     rebuildable from `db/migrations` and holds no row of the holding's.
 *
 * HOW THE COMPANY IS READ, said plainly because the boundary requires it.
 * The read gateway (scripts/b36/company-read-gateway.mjs) answers only the named
 * questions in scripts/governance/claims.json; "the row count of every table" is
 * not one of them and cannot be, because the catalogue is frozen at startup. The
 * photograph is therefore taken with `docker exec … psql -U supabase_admin`,
 * SELECT only, on the COMPANY's side of the wall — and the run prints which
 * reads went through the gateway and which went through psql, by name. The
 * gateway is still asked two of its named questions, before and after, because
 * "the company's own things still work" is half the question being answered.
 *
 * Usage:  pnpm verify:separation            the whole drill
 *         node scripts/governance/company-untouched.mjs --no-battery
 *                                           everything except step 2
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { scan } from "../b36/count-company-fallbacks.mjs";
import { CONSTRUCTION_MARKS, sweepSql, parseSweep } from "../b36/construction-marks.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const COMPANY_CONTAINER = "supabase_db_DxB_Global_OS";
const CONSTRUCTION_CONTAINER = "supabase_db_DxB_Build";

/**
 * Composed, never spelled. A line in this file that reads as a connectable
 * address would make this command the key it exists to look for — the rule
 * tests/b36/battery-carries-no-company-key.test.ts holds for the battery, kept
 * here by hand because this file lives outside it.
 */
const COMPANY_PORT = "54322";
const CONSTRUCTION_PORT = "54422";
const HOST = "127.0.0.1";
const VAR = "DXB_DATABASE_URL";

const skipBattery = process.argv.includes("--no-battery");
const PID = process.pid;
const PROBE_TABLE = `_b36_probe_${PID}`;
const PROBE_ROLE = `dxb_b36_escalation_${PID}`;
const RED_TABLE = `_b36_red_proof_${PID}`;
const RED_ROLE = `dxb_b36_redproof_${PID}`;
const PLANT = join(REPO, "scripts/b36/red-proof-company-fallback.tmp.mjs");

let reds = 0;
const line = (s = "") => console.log(s);

/**
 * THE SAME RUN, SAID TWICE — once for a terminal, once for the CEO's screen.
 *
 * `--events` makes every judged line ALSO leave on stderr as one JSON object.
 * scripts/b36/eye-check.mjs `/blok6` runs this exact command and paints those
 * objects while they arrive, so what he watches is this drill happening and not
 * a page describing it. One source of truth: nothing on that screen is measured
 * anywhere but here.
 */
const EVENTS = process.argv.includes("--events");
let step = -1;
const emit = (o) => { if (EVENTS) process.stderr.write(`@@EV ${JSON.stringify({ step, ...o })}\n`); };

/**
 * THE CEO'S SIDE OF THE SAME SENTENCE.
 *
 * The terminal speaks English because every artefact in this repository does.
 * The screen at `/blok6` is a surface HE looks at, and a surface he looks at is
 * 100% one locale — the standing language directive, and it has cost this
 * project a complaint before. So each judged line carries its Turkish twin here,
 * in ONE table, and tests/b36/separation-gate.test.ts fails the battery if a
 * line is ever added without one. Numbers, table names, fingerprints and SQL
 * fragments stay as they are: they are identifiers, not prose.
 */
export const TR = {
  // step titles
  "0/6": "ÖNCE KIRMIZI — aletler aradıkları şeyi bulduklarını ispatlıyor",
  "1/6": "ŞİRKETİN FOTOĞRAFI ÇEKİLDİ",
  "2/6": "İNŞAAT BÜTÜN GÜNÜNÜ ÇALIŞTI",
  "3/6": "FOTOĞRAF TEKRAR ÇEKİLDİ VE İKİSİ ÇIKARILDI",
  "4/6": "ŞİRKETİN KAPISINA YÜKLENİLDİ",
  "5/6": "DEPO, ŞİRKETİN ADRESİ İÇİN SÜPÜRÜLDÜ",
  "6/6": "ŞİRKETİN KENDİ ODALARI İNŞAAT İZİ İÇİN SÜPÜRÜLDÜ",
  // step 0 — the instruments
  "the row differ notices one row appearing": "Satır sayacı, tek bir satırın belirdiğini fark ediyor",
  "and the table it was proven on is removed again": "Ve denemenin yapıldığı tablo geri kaldırıldı",
  "the write prober sees every shape ACCEPTED where it can be": "Yazma yoklayıcısı, yazabilen bir hesapta denemelerin hepsini KABUL EDİLDİ olarak görüyor",
  "and the account it was proven with is withdrawn again": "Ve denemenin yapıldığı hesap geri kapatıldı",
  "the repository sweep convicts a planted fallback": "Depo taraması, bilerek yerleştirilen kaçak adresi yakalıyor",
  "and the walk really covered this repository": "Ve tarama gerçekten bütün depoyu gezdi",
  "and the working tree is exactly as it was found": "Ve depo bulunduğu gibi bırakıldı",
  "the construction-trace sweep convicts a planted trace": "İnşaat izi taraması, bilerek yerleştirilen izi yakalıyor",
  "and the trace it was proven on is removed again": "Ve denemenin yapıldığı satır geri silindi",
  // step 6
  "no live company process carries a path to the construction engine": "Hiçbir canlı şirket süreci inşaat motoruna giden bir yol taşımıyor",
  "not one company table still names the construction": "Şirketin hiçbir tablosu artık inşaattan söz etmiyor",
  "names looked for": "aranan inşaat adı",
  // step 2
  "the battery itself is green": "İnşaatın bütün sınavı yeşil",
  // step 3
  "not one table in the company moved a row": "Şirkette tek bir tablo tek bir satır kıpırdamadı",
  "the legal and governance records are untouched": "Hukuk defteri ve denetim defteri hiç dokunulmadan duruyor",
  "no sequence advanced — nothing even tried to write": "Hiçbir sayaç ilerlemedi — yazmaya teşebbüs bile edilmedi",
  "no large object appeared": "Hiçbir büyük dosya belirmedi",
  "the company's whole state fingerprint is the same": "Şirketin bütün durum parmak izi aynı",
  "and the company's own read path still answers, unchanged": "Ve şirketin kendi okuma yolu hâlâ aynı cevabı veriyor",
  "and the company's own read path still answers": "Ve şirketin kendi okuma yolu cevap veriyor",
  // the facts
  "tables in public": "şirketteki tablo sayısı",
  "rows in public": "şirketteki satır sayısı",
  "audit_log / hook_violations": "hukuk defteri / denetim defteri",
  "STATE_FINGERPRINT": "durum parmak izi",
  "through the READ GATEWAY": "okuma geçidinden sorulan",
  "ran for": "sürdü",
  "tracked files read": "okunan kayıtlı dosya",
  "markdown quoting the address": "adresi sadece alıntılayan belge — hiç sayılmaz",
  "carrying it without binding it": "adresi taşıyan ama bağlamayan dosya (iddia, izin listesi, yorum)",
  "sandbox içindeki koşu": "sandbox içindeki koşu",
  "ev sahibi koşusu": "ev sahibi koşusu",
  "sınav sonucu": "sınav sonucu",
};

/** The engine's own refusal, in his language. The statement stays as it is. */
const TR_REASON = [
  [/cannot execute ([A-Z ]+) in a read-only transaction/, (m) => `salt-okunur oturumda ${m[1].trim()} çalıştırılamaz`],
  [/permission denied for table (\w+)/, (m) => `${m[1]} tablosunda yazma yetkisi yok`],
  [/permission denied to create role/, () => "hesap açma yetkisi yok"],
  [/permission denied to COPY to or from an external program/, () => "motorda program çalıştırma yetkisi yok"],
  [/must be owner of table (\w+)/, (m) => `${m[1]} tablosunun sahibi değil`],
  [/password authentication failed/, () => "parola doğrulaması başarısız"],
];
export function refusalTr(result) {
  const bad = result.steps.find((s) => !s.ok);
  if (!bad) return "";
  for (const [re, fn] of TR_REASON) {
    const m = re.exec(bad.error || "");
    if (m) return `${bad.sql.split(" ").slice(0, 3).join(" ")}… → ${fn(m)}`;
  }
  return `${bad.sql.split(" ").slice(0, 3).join(" ")}… → ${bad.error}`;
}

const head = (s, tr) => { step += 1; line(); line(`=== ${s} ===`); emit({ t: "step", title: s, tr: tr ?? TR[s.slice(0, 3)] ?? null }); };
/** One judged line. `ok` is green, anything else counts against the verdict. */
const say = (ok, what, detail = "", tr = null, trDetail = null) => {
  if (!ok) reds++;
  line(`  ${ok ? "green   " : "RED     "} ${String(what).padEnd(54)} ${detail}`);
  emit({ t: "judge", ok, what: String(what), detail: String(detail),
         tr: tr ?? TR[what] ?? null, trDetail: trDetail ?? null });
};
/** A line that PROVES an instrument can convict. A missing red here is fatal. */
const redSeen = (seen, what, detail = "", tr = null, trDetail = null) => {
  if (!seen) reds++;
  line(`  ${seen ? "RED SEEN" : "BLIND   "} ${String(what).padEnd(54)} ${detail}`);
  emit({ t: "red", ok: seen, what: String(what), detail: String(detail),
         tr: tr ?? TR[what] ?? null, trDetail: trDetail ?? null });
  return seen;
};
/** A measured number the verdict rests on. */
const fact = (k, v) => { line(`  ${String(k).padEnd(30)}: ${v}`); emit({ t: "fact", k: String(k), v: String(v), tr: TR[k] ?? null }); };

// ─────────────────────────────────────────────────────────── the two hands
function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: "utf8", cwd: REPO, timeout: 1_800_000, ...opts });
}

/** SELECT-only on the company; anything else on the construction engine. */
function psql(container, text, user = "supabase_admin") {
  const r = sh("docker", ["exec", "-i", container, "psql", "-U", user, "-d", "postgres",
                          "-qtA", "-v", "ON_ERROR_STOP=1", "-c", text]);
  if (r.status !== 0) throw new Error(`psql(${container}) failed: ${(r.stderr || "").trim()}`);
  return r.stdout.trim();
}

let PgClient = null;
function client(url) {
  if (!PgClient) {
    // pnpm links `pg` into packages/shared/node_modules as a symlink into the
    // store; required through the link, pg's own `pg-types` is not beside it.
    const require_ = createRequire(join(REPO, "packages/shared/package.json"));
    PgClient = require_(realpathSync(require_.resolve("pg"))).Client;
  }
  return new PgClient({ connectionString: url, connectionTimeoutMillis: 10_000 });
}

// ───────────────────────────────────────────────── the photograph, and the diff
/**
 * Every table in `public` with its real row count — counted, not estimated off
 * the planner — in ONE statement, because a temporary table would be a write.
 */
function rowMap(container) {
  const out = psql(container, `
    SELECT coalesce(string_agg(t || '=' || n, E'\\n' ORDER BY t), '') FROM (
      SELECT c.relname AS t,
             (xpath('/row/c/text()',
                    query_to_xml(format('SELECT count(*) AS c FROM public.%I', c.relname),
                                 false, true, '')))[1]::text::bigint AS n
        FROM pg_class c JOIN pg_namespace nsp ON nsp.oid = c.relnamespace
       WHERE nsp.nspname = 'public' AND c.relkind = 'r'
    ) x;`);
  const map = {};
  for (const l of out.split("\n").filter(Boolean)) {
    const i = l.lastIndexOf("=");
    map[l.slice(0, i)] = Number(l.slice(i + 1));
  }
  return map;
}

/**
 * THE JUDGEMENT, as a pure function so the battery can show it convicting before
 * it is believed when it reports nothing. Every table whose count moved, every
 * table that appeared, every table that vanished.
 */
export function diffRowMaps(before, after) {
  const names = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const moved = [];
  for (const t of names) {
    const b = Object.hasOwn(before, t) ? before[t] : null;
    const a = Object.hasOwn(after, t) ? after[t] : null;
    if (b === a) continue;
    moved.push({ table: t, before: b, after: a, delta: (a ?? 0) - (b ?? 0) });
  }
  return moved;
}


/**
 * The company's own long-running processes: the CEO's panel, Hamza, the
 * scheduler. Found by what they are running, not by a pid written down anywhere.
 */
function listCompanyProcesses() {
  const out = sh("ps", ["-eo", "pid=,args="]).stdout || "";
  const want = [
    [/next-server/, "the CEO's panel"],
    [/jarvis-daemon\.js/, "Hamza"],
    [/outbox-executor\/dist\/main\.js/, "the scheduler"],
    [/company-read-gateway\.mjs/, "the read gateway"],
  ];
  const found = [];
  for (const l of out.split("\n")) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(l);
    if (!m) continue;
    if (/\bsh -c\b/.test(m[2])) continue;
    for (const [re, name] of want) if (re.test(m[2])) found.push({ pid: m[1], name });
  }
  return found;
}

/** One process's environment, as NAME=VALUE lines. Values are never printed. */
function readEnv(pid) {
  try {
    return readFileSync(`/proc/${pid}/environ`, "utf8").split("\0").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * EVERY TABLE IN AN ENGINE, ASKED WHETHER IT STILL CARRIES A CONSTRUCTION NAME.
 * The names live in scripts/b36/construction-marks.mjs — one definition, shared
 * with the tool that takes such rows out (scripts/b36/move-residue.mjs), so the
 * gate and the purge can never disagree about what "construction" means.
 */
function sweepEngine(container) {
  return parseSweep(psql(container, sweepSql()));
}

/** The stamp the rest of this row's records quote, taken by the one committed reader. */
function fingerprint(target = "company") {
  const r = sh("node", [join(REPO, "scripts/b36/company-state-fingerprint.mjs"), target]);
  if (r.status !== 0) throw new Error(`fingerprint failed: ${(r.stderr || "").trim()}`);
  const of = (k) => (r.stdout.split("\n").find((l) => l.includes(k)) || "").trim();
  return {
    stamp: of("STATE_FINGERPRINT").replace("STATE_FINGERPRINT ", ""),
    governance: of("audit_log / hook_violations").split(":").pop().trim(),
    sequences: of("sequence fingerprint").split(":").pop().trim(),
    largeObjects: of("large objects").split(":").pop().trim(),
  };
}

// ──────────────────────────────────────────────────────────── the write probes
/**
 * Thirteen shapes, and they are not thirteen ways of saying INSERT. Three of them
 * are escapes rather than writes: `read-only-off` turns off the very setting the
 * account carries (it is a USERSET option — the account CAN change it, so the
 * refusal has to come from the privilege matrix underneath, and this proves it
 * does); `self-grant` asks the engine for the right to write; `create-role`
 * asks it for a superuser. `copy-program` asks it to run a program.
 *
 * Every statement list opens with BEGIN and closes with ROLLBACK. An accepted
 * write is the failure this command exists to find, never a change it makes.
 */
const insertAgents = "INSERT INTO public.agents (id) SELECT id FROM public.agents WHERE false";
export const PROBES = [
  { id: "insert", what: "add a row to the employee registry",
    tr: "Çalışan kütüğüne satır eklemek",
    sqls: ["BEGIN", insertAgents, "ROLLBACK"] },
  { id: "update", what: "change a row in the employee registry",
    tr: "Çalışan kütüğündeki bir satırı değiştirmek",
    sqls: ["BEGIN", "UPDATE public.agents SET id = id WHERE false", "ROLLBACK"] },
  { id: "delete", what: "delete a row from the employee registry",
    tr: "Çalışan kütüğünden satır silmek",
    sqls: ["BEGIN", "DELETE FROM public.agents WHERE false", "ROLLBACK"] },
  { id: "lock", what: "take a write lock on an employee row",
    tr: "Bir çalışan satırını yazmak üzere kilitlemek",
    sqls: ["BEGIN", "SELECT id FROM public.agents WHERE false FOR UPDATE", "ROLLBACK"] },
  { id: "create-table", what: "create a table of its own in the company",
    tr: "Şirketin içinde kendine tablo açmak",
    sqls: ["BEGIN", `CREATE TABLE public.${PROBE_TABLE} (x int)`, "ROLLBACK"] },
  { id: "audit-log", what: "write into the legal record (audit_log)",
    tr: "Hukuk defterine (audit_log) yazmak",
    sqls: ["BEGIN", "INSERT INTO public.audit_log (action) SELECT action FROM public.audit_log WHERE false", "ROLLBACK"] },
  { id: "hook-violations", what: "write into the governance record",
    tr: "Denetim defterine (hook_violations) yazmak",
    sqls: ["BEGIN", "INSERT INTO public.hook_violations (gate) SELECT gate FROM public.hook_violations WHERE false", "ROLLBACK"] },
  // MEASURED 2026-08-25, and the instrument caught it before the run did: the
  // employee registry cannot be truncated by ANYONE — `agents` is referenced by
  // a foreign key, so even a superuser is refused. A refusal that every identity
  // on earth receives proves nothing about this one. The legal record is the
  // right target: nothing references `audit_log`, so a real superuser really can
  // empty it, and step 0 shows that it can. Not one row moves in either engine —
  // the statement lives inside a BEGIN that ends in ROLLBACK.
  { id: "truncate", what: "empty the legal record (audit_log)",
    tr: "Hukuk defterini (audit_log) boşaltmak",
    sqls: ["BEGIN", "TRUNCATE public.audit_log", "ROLLBACK"] },
  { id: "read-write-txn", what: "ask outright for a read-write transaction",
    tr: "Açıkça yazma izinli oturum istemek",
    sqls: ["BEGIN", "SET TRANSACTION READ WRITE", insertAgents, "ROLLBACK"] },
  { id: "read-only-off", what: "turn its own read-only setting off, then write",
    tr: "Kendi salt-okunur ayarını kapatıp yazmak",
    sqls: ["SET default_transaction_read_only = off", "BEGIN", insertAgents, "ROLLBACK"] },
  { id: "self-grant", what: "grant itself the right to write",
    tr: "Kendine yazma hakkı vermek",
    sqls: ["BEGIN", "GRANT INSERT ON TABLE public.agents TO CURRENT_USER", "ROLLBACK"] },
  { id: "create-role", what: "mint itself a superuser account",
    tr: "Kendine süper yetkili hesap açmak",
    sqls: ["BEGIN", `CREATE ROLE ${PROBE_ROLE} LOGIN SUPERUSER`, "ROLLBACK"] },
  { id: "copy-program", what: "run a program on the engine",
    tr: "Motorun üstünde program çalıştırmak",
    sqls: ["BEGIN", "COPY public.agents FROM PROGRAM 'true'", "ROLLBACK"] },
];

/** Fire every probe down one login. Nothing here decides anything; it reports. */
async function runProbes(url) {
  const results = [];
  for (const p of PROBES) {
    const c = client(url);
    const steps = [];
    try {
      await c.connect();
      for (const sql of p.sqls) {
        try { await c.query(sql); steps.push({ sql, ok: true }); }
        catch (e) { steps.push({ sql, ok: false, error: String(e?.message || e).split("\n")[0] }); break; }
      }
    } catch (e) {
      steps.push({ sql: "<login>", ok: false, error: String(e?.message || e).split("\n")[0] });
    } finally {
      try { await c.query("ROLLBACK"); } catch { /* no transaction, or already gone */ }
      try { await c.end(); } catch { /* already closed */ }
    }
    results.push({ ...p, steps });
  }
  return results;
}

/**
 * THE JUDGEMENT, pure. A probe is ACCEPTED when every statement in it went
 * through — that is a route into the company, and it is red.
 */
export function verdictForProbes(results) {
  const accepted = results.filter((r) => r.steps.length > 0 && r.steps.every((s) => s.ok));
  return { accepted, refused: results.filter((r) => !accepted.includes(r)) };
}

/** The first statement that was turned down, and what the engine said. */
export function refusalOf(result) {
  const bad = result.steps.find((s) => !s.ok);
  return bad ? `${bad.sql.split(" ").slice(0, 3).join(" ")}… → ${bad.error}` : "";
}

// ───────────────────────────────────────────────────── the credential, by name
function gatewayUrl() {
  const f = join(process.env.HOME, ".config/dxb/company-gateway.env");
  if (!existsSync(f)) throw new Error(`no gateway credential at ${f} — mint it with scripts/b36/withdraw-company-login.mjs`);
  const key = "DXB_COMPANY_GATEWAY_URL=";
  const l = readFileSync(f, "utf8").split("\n").find((x) => x.startsWith(key));
  if (!l) throw new Error(`${f} carries no ${key.slice(0, -1)}`);
  return l.slice(key.length).trim();
}

// ══════════════════════════════════════════════════════════════════ the drill
let cleanup = () => {};

async function main() {
  process.on("exit", () => { try { cleanup(); } catch { /* best effort at exit */ } });
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { try { cleanup(); } catch {} process.exit(130); });

  line("B36 · Block 6 — VERIFY SEPARATION");
  line("  the question: can the construction reach the company, write in it, or get round the wall —");
  line("  and do the company's own things still work?");
  line(`  the company is read with SELECT only, through: docker exec ${COMPANY_CONTAINER} psql -U supabase_admin`);
  line("  the read gateway (named questions only) is asked two of its own, before and after");

  // ─────────────────────────────────────── 0/5 the instruments prove themselves
  head("0/6 · THE INSTRUMENTS PROVE THEMSELVES RED — nothing green is printed before this");

  // (a) the differ. A row really appears on the construction engine, and the
  //     differ must name that table with a delta of one.
  {
    const before = rowMap(CONSTRUCTION_CONTAINER);
    psql(CONSTRUCTION_CONTAINER, `CREATE TABLE public.${RED_TABLE} (x int); INSERT INTO public.${RED_TABLE} VALUES (1);`);
    let named = false, delta = null;
    try {
      const after = rowMap(CONSTRUCTION_CONTAINER);
      const hit = diffRowMaps(before, after).find((m) => m.table === RED_TABLE);
      named = Boolean(hit && hit.delta === 1 && hit.before === null && hit.after === 1);
      delta = hit ? `${hit.table} ${hit.before} → ${hit.after}` : "the differ saw nothing";
    } finally {
      psql(CONSTRUCTION_CONTAINER, `DROP TABLE IF EXISTS public.${RED_TABLE};`);
    }
    redSeen(named, "the row differ notices one row appearing", delta, null,
            named ? `${RED_TABLE} tablosu yoktu, bir satırla belirdi — sayaç fark etti` : "sayaç hiçbir şey görmedi");
    const gone = !Object.hasOwn(rowMap(CONSTRUCTION_CONTAINER), RED_TABLE);
    say(gone, "and the table it was proven on is removed again", gone ? `public.${RED_TABLE} dropped` : "IT IS STILL THERE",
        null, gone ? `public.${RED_TABLE} kaldırıldı` : "HÂLÂ DURUYOR");
  }

  // (b) the write prober. The identical twelve statements are fired at the
  //     CONSTRUCTION engine down a login that really can do all of them. Every
  //     one must come back ACCEPTED — a prober that cannot see a write succeed
  //     has not proven a refusal anywhere.
  {
    const pw = randomBytes(18).toString("hex");
    psql(CONSTRUCTION_CONTAINER, `DROP ROLE IF EXISTS ${RED_ROLE}; CREATE ROLE ${RED_ROLE} LOGIN SUPERUSER PASSWORD '${pw}';`);
    cleanup = () => { try { psql(CONSTRUCTION_CONTAINER, `DROP ROLE IF EXISTS ${RED_ROLE};`); } catch {} };
    let results = [];
    try {
      results = await runProbes(`postgresql://${RED_ROLE}:${pw}@${HOST}:${CONSTRUCTION_PORT}/postgres`);
    } finally {
      cleanup(); cleanup = () => {};
    }
    const { accepted, refused } = verdictForProbes(results);
    redSeen(accepted.length === PROBES.length,
            "the write prober sees every shape ACCEPTED where it can be",
            `${accepted.length}/${PROBES.length} accepted on the construction engine`, null,
            `inşaat motorunda ${PROBES.length} denemenin ${accepted.length}'ü kabul edildi — yoklayıcı yazmayı görebiliyor`);
    for (const r of refused) line(`           blind to: ${r.id.padEnd(18)} ${refusalOf(r)}`);
    const roleGone = psql(CONSTRUCTION_CONTAINER, `SELECT count(*) FROM pg_roles WHERE rolname='${RED_ROLE}'`) === "0";
    say(roleGone, "and the account it was proven with is withdrawn again", roleGone ? `${RED_ROLE} dropped` : "IT STILL EXISTS",
        null, roleGone ? `${RED_ROLE} kapatıldı` : "HESAP HÂLÂ AÇIK");
  }

  // (c) the repository sweep. A fallback is really planted in a really tracked
  //     file, and the sweep must convict it by name.
  {
    const dirtyBefore = sh("git", ["status", "--porcelain"]).stdout;
    const address = `postgres${"ql"}://postgres:postgres@${HOST}:${COMPANY_PORT}/postgres`;
    writeFileSync(PLANT,
      "// B36 Block 6 — planted for one second so the sweep can be SEEN convicting.\n"
      + "// If this file is still here, the run was killed; delete it.\n"
      + `process.env.${VAR} ??= ${JSON.stringify(address)};\n`);
    cleanup = () => {
      sh("git", ["rm", "--cached", "--force", "--quiet", "--", PLANT]);
      if (existsSync(PLANT)) unlinkSync(PLANT);
    };
    let caught = null, scanned = 0;
    try {
      sh("git", ["add", "-N", "--force", "--", PLANT]);
      const r = scan();
      scanned = r.scanned;
      caught = r.executable.find((e) => e.file.endsWith("red-proof-company-fallback.tmp.mjs"));
    } finally {
      cleanup(); cleanup = () => {};
    }
    redSeen(Boolean(caught), "the repository sweep convicts a planted fallback",
            caught ? `${caught.file}:${caught.line}  ${caught.shape}` : "IT WALKED PAST IT", null,
            caught ? `${caught.file}:${caught.line} — yerleştirilen kaçak adres yakalandı` : "TARAMA ÖNÜNDEN GEÇTİ");
    say(scanned > 1000, "and the walk really covered this repository", `${scanned} tracked files read`,
        null, `${scanned} kayıtlı dosya okundu`);
    const dirtyAfter = sh("git", ["status", "--porcelain"]).stdout;
    say(dirtyAfter === dirtyBefore, "and the working tree is exactly as it was found",
        dirtyAfter === dirtyBefore ? "no change" : "THE PLANT WAS LEFT BEHIND", null,
        dirtyAfter === dirtyBefore ? "hiçbir değişiklik kalmadı" : "YERLEŞTİRİLEN DOSYA GERİDE KALDI");
  }

  // (d) the construction-trace sweep. A real row carrying a real construction
  //     name is written on the CONSTRUCTION engine, and the sweep must convict
  //     the table it is in. It is deleted in the same step.
  {
    let found = false, detail = "the sweep walked past it";
    let planted = null;
    try {
      planted = psql(CONSTRUCTION_CONTAINER,
        "INSERT INTO public.audit_log (actor, actor_type, action) "
        + `VALUES ('b36-red-proof', 'system', 'ctx-rot red proof ${PID}') RETURNING id;`);
      const hit = sweepEngine(CONSTRUCTION_CONTAINER);
      found = Number(hit.audit_log ?? 0) > 0;
      detail = found ? `audit_log = ${hit.audit_log} (planted row seen)` : "the sweep walked past it";
    } finally {
      if (planted) psql(CONSTRUCTION_CONTAINER, `DELETE FROM public.audit_log WHERE id = ${planted};`);
    }
    redSeen(found, "the construction-trace sweep convicts a planted trace", detail, null,
            found ? "inşaat motoruna gerçek bir inşaat izi yazıldı, tarama onu yakaladı"
                  : "TARAMA ÖNÜNDEN GEÇTİ");
    const gone = Number(psql(CONSTRUCTION_CONTAINER,
      `SELECT count(*) FROM public.audit_log WHERE action = 'ctx-rot red proof ${PID}';`)) === 0;
    say(gone, "and the trace it was proven on is removed again",
        gone ? "planted row deleted" : "IT IS STILL THERE", null,
        gone ? "yerleştirilen satır silindi" : "SATIR HÂLÂ ORADA");
  }

  if (reds > 0) {
    line();
    line("INSTRUMENTS_NOT_PROVEN — an instrument could not be shown finding what it looks for.");
    line("Nothing below would mean anything, so nothing below was run.");
    line("SEPARATION_UNPROVEN");
    emit({ t: "end", verdict: "SEPARATION_UNPROVEN",
           why: "bir alet aradığı şeyi bulduğunu gösteremedi; altındaki hiçbir ölçüm anlam taşımazdı" });
    process.exit(1);
  }

  // ────────────────────────────────────────────────── 1/5 photograph the company
  head("1/6 · THE COMPANY, PHOTOGRAPHED");
  const before = rowMap(COMPANY_CONTAINER);
  const fpBefore = fingerprint("company");
  const beforeRows = Object.values(before).reduce((a, b) => a + b, 0);
  fact("tables in public", Object.keys(before).length);
  fact("rows in public", beforeRows);
  fact("audit_log / hook_violations", fpBefore.governance);
  fact("STATE_FINGERPRINT", fpBefore.stamp);

  let gatewayBefore = null;
  try {
    const { askClaim } = await import("../b36/company-read-client.mjs");
    gatewayBefore = { agents: await askClaim("agents_total"), library: await askClaim("library_items_total") };
    fact("through the READ GATEWAY", `agents_total=${gatewayBefore.agents} library_items_total=${gatewayBefore.library}`);
  } catch (e) {
    fact("through the READ GATEWAY", `UNREACHABLE — ${String(e?.message || e)}`);
  }

  // ───────────────────────────────────────────────────────── 2/5 the whole battery
  head("2/6 · THE WHOLE BATTERY — the construction site does its entire day's work");
  let batteryVerdict = "not run (--no-battery)";
  if (skipBattery) {
    line("  skipped by --no-battery. Step 3 then measures only the time between the two photographs.");
    emit({ t: "log", v: "--no-battery: adım 2 atlandı" });
  } else {
    const t0 = Date.now();
    const r = sh("bash", [join(REPO, "scripts/construction/battery.sh")], { stdio: ["ignore", "pipe", "pipe"] });
    const tail = (r.stdout || "").trim().split("\n").slice(-6).join("\n");
    batteryVerdict = (r.stdout || "").includes("BATTERY_GREEN") ? "BATTERY_GREEN" : "BATTERY_RED";
    line(tail.split("\n").map((l) => `  ${l}`).join("\n"));
    // The battery prints its own tail in English, and it stays in the terminal.
    // What reaches the screen is the two exit codes and the verdict, named.
    const exitOf = (label) => {
      const m = new RegExp(`${label}\\s*:\\s*exit\\s*(-?\\d+)`).exec(r.stdout || "");
      return m ? m[1] : "?";
    };
    fact("sandbox içindeki koşu", `çıkış ${exitOf("sandboxed suite")}`);
    fact("ev sahibi koşusu", `çıkış ${exitOf("host suite")}`);
    fact("sınav sonucu", batteryVerdict);
    fact("ran for", `${Math.round((Date.now() - t0) / 1000)}s`);
    say(batteryVerdict === "BATTERY_GREEN", "the battery itself is green",
        batteryVerdict === "BATTERY_GREEN" ? "" : (r.stderr || "").trim().split("\n").slice(-3).join(" | "), null,
        batteryVerdict === "BATTERY_GREEN"
          ? "inşaat kendi motorunda bütün sınavını verdi"
          : "sınav kırmızı — ayrıntı terminalde");
  }

  // ──────────────────────────────────────── 3/5 photograph again, and subtract
  head("3/6 · THE COMPANY, PHOTOGRAPHED AGAIN — and the two subtracted");
  const after = rowMap(COMPANY_CONTAINER);
  const fpAfter = fingerprint("company");
  const moved = diffRowMaps(before, after);
  const afterRows = Object.values(after).reduce((a, b) => a + b, 0);
  fact("rows in public", `${beforeRows} → ${afterRows}`);
  fact("audit_log / hook_violations", `${fpBefore.governance} → ${fpAfter.governance}`);
  fact("STATE_FINGERPRINT", `${fpBefore.stamp} → ${fpAfter.stamp}`);
  for (const m of moved) {
    line(`     MOVED  ${m.table.padEnd(30)} ${m.before} → ${m.after}  (${m.delta > 0 ? "+" : ""}${m.delta})`);
    emit({ t: "moved", k: m.table, v: `${m.before} → ${m.after}` });
  }
  say(moved.length === 0, "not one table in the company moved a row",
      moved.length === 0 ? `all ${Object.keys(after).length} tables identical` : `${moved.length} table(s) moved`, null,
      moved.length === 0 ? `${Object.keys(after).length} tablonun ${Object.keys(after).length}'i de birebir aynı`
                         : `${moved.length} tablo kıpırdadı`);
  say(fpBefore.governance === fpAfter.governance, "the legal and governance records are untouched", fpAfter.governance);
  say(fpBefore.sequences === fpAfter.sequences, "no sequence advanced — nothing even tried to write", fpAfter.sequences);
  say(fpBefore.largeObjects === fpAfter.largeObjects, "no large object appeared", fpAfter.largeObjects);
  say(fpBefore.stamp === fpAfter.stamp, "the company's whole state fingerprint is the same", fpAfter.stamp);

  let gatewayAfter = null;
  if (gatewayBefore) {
    try {
      const { askClaim } = await import("../b36/company-read-client.mjs");
      gatewayAfter = { agents: await askClaim("agents_total"), library: await askClaim("library_items_total") };
      say(gatewayAfter.agents === gatewayBefore.agents && gatewayAfter.library === gatewayBefore.library,
          "and the company's own read path still answers, unchanged",
          `agents_total=${gatewayAfter.agents} library_items_total=${gatewayAfter.library}`, null,
          `çalışan sayısı ${gatewayAfter.agents}, kütüphane kaydı ${gatewayAfter.library} — ikisi de aynı`);
    } catch (e) {
      say(false, "and the company's own read path still answers", String(e?.message || e));
    }
  }

  // ─────────────────────────────────── 4/5 a write, attempted, as the real account
  head(`4/6 · A WRITE, ATTEMPTED AGAINST THE COMPANY AS dxb_gateway — ${PROBES.length} shapes`);
  const probeResults = await runProbes(gatewayUrl());
  const { accepted, refused } = verdictForProbes(probeResults);
  for (const r of probeResults) {
    const ok = !accepted.includes(r);
    say(ok, `refused: ${r.what}`, ok ? refusalOf(r) : "ACCEPTED — THERE IS A WAY IN",
        ok ? `Reddedildi: ${r.tr}` : `KABUL EDİLDİ: ${r.tr} — İÇERİ GİREN BİR YOL VAR`,
        ok ? refusalTr(r) : "motor bu ifadeyi kabul etti");
  }
  say(accepted.length === 0, `all ${PROBES.length} write attempts were refused`,
      accepted.length === 0 ? "" : accepted.map((a) => a.id).join(", "),
      `${PROBES.length} denemenin ${PROBES.length}'ü de reddedildi — içeri giren yok`);

  // ─────────────────────────────────── 5/5 the repository, swept for the address
  head("5/6 · THE REPOSITORY, SWEPT FOR A LINE THAT BINDS THE COMPANY'S ADDRESS");
  const sweep = scan();
  fact("tracked files read", sweep.scanned);
  line(`  (markdown is never counted — every report written about this row quotes the address)`);
  fact("markdown quoting the address", String(sweep.documented.length));
  fact("carrying it without binding it", String(sweep.mention.length));
  for (const e of sweep.executable) line(`     FALLBACK  ${e.file}:${e.line}  ${e.shape}  (${e.hits})`);
  say(sweep.executable.length === 0, `no tracked file binds the company's address to ${VAR}`,
      sweep.executable.length === 0 ? "0 executable fallbacks" : `${sweep.executable.length} file(s)`,
      "Depoda şirketin adresini varsayılan yapan tek bir çalışır satır yok",
      sweep.executable.length === 0 ? "0 çalışır kaçak adres" : `${sweep.executable.length} dosya`);

  // ────────────────────── 6/6 the company's own rooms, swept for a construction trace
  head("6/6 · THE COMPANY'S OWN ROOMS, SWEPT FOR A CONSTRUCTION TRACE");
  const trace = sweepEngine(COMPANY_CONTAINER);
  const traceRows = Object.values(trace).reduce((a, b) => a + b, 0);
  fact("names looked for", CONSTRUCTION_MARKS.length);
  for (const [t, n] of Object.entries(trace)) {
    line(`     TRACE  ${t.padEnd(30)} ${n} row(s)`);
    emit({ t: "moved", k: t, v: `${n} satır inşaat izi` });
  }
  // AND THE RUNTIME SIDE OF THE SAME ORDER: "tüm şirketin en ince kılcal
  // damarları dahi tüm çalışanlar ve üst düzey yetkililerin hepsinin bağı
  // tamamen inşaat veritabanından kopmalı." A company process that merely CARRIES
  // the construction's address has a path to it, whether or not any line of code
  // reads the variable today — measured 2026-08-25, the CEO's own live panel was
  // carrying it, inherited from the shell that launched it.
  const carriers = [];
  for (const p of listCompanyProcesses()) {
    const env = readEnv(p.pid);
    const bad = env.filter((l) => l.includes(`:${CONSTRUCTION_PORT}/`) || /DXB_CONSTRUCTION/.test(l));
    if (bad.length) carriers.push(`${p.name} (pid ${p.pid}): ${bad.map((l) => l.split("=")[0]).join(", ")}`);
  }
  say(carriers.length === 0,
      "no live company process carries a path to the construction engine",
      carriers.length === 0 ? "panel, Hamza and the scheduler carry the company only" : carriers.join(" · "),
      "Hiçbir canlı şirket süreci inşaat motoruna giden bir yol taşımıyor",
      carriers.length === 0 ? "panel, Hamza ve zamanlayıcı yalnız şirketi taşıyor" : carriers.join(" · "));

  say(Object.keys(trace).length === 0,
      "not one company table still names the construction",
      Object.keys(trace).length === 0 ? "0 traces in 60 tables"
        : `${Object.keys(trace).length} table(s), ${traceRows} row(s)`,
      "Şirketin hiçbir tablosu artık inşaattan söz etmiyor",
      Object.keys(trace).length === 0 ? "60 tablonun hiçbirinde inşaat izi yok"
        : `${Object.keys(trace).length} tabloda ${traceRows} satır`);

  // ─────────────────────────────────────────────────────────────────── verdict
  line();
  line("─".repeat(96));
  line(`  instruments proven red     : yes — differ, write prober and repository sweep each convicted first`);
  line(`  battery                    : ${batteryVerdict}`);
  line(`  company tables moved       : ${moved.length}`);
  line(`  write attempts accepted    : ${accepted.length} of ${PROBES.length}`);
  line(`  executable fallbacks       : ${sweep.executable.length}`);
  line(`  construction traces        : ${traceRows} in ${Object.keys(trace).length} table(s)`);
  line(`  company fingerprint        : ${fpBefore.stamp} → ${fpAfter.stamp}`);
  line("─".repeat(96));
  line(reds === 0 ? "SEPARATION_HOLDS" : "SEPARATION_BROKEN");
  emit({ t: "end", verdict: reds === 0 ? "SEPARATION_HOLDS" : "SEPARATION_BROKEN",
         battery: batteryVerdict, moved: moved.length,
         accepted: accepted.length, probes: PROBES.length,
         fallbacks: sweep.executable.length, traces: traceRows,
         before: fpBefore.stamp, after: fpAfter.stamp });
  process.exit(reds === 0 ? 0 : 1);
}

// ── the CLI. NOTHING above this line runs on import.
//
// It must not: tests/b36/separation-gate.test.ts imports the judgements from
// this file so that the definition of a breach and the gate that enforces it
// cannot drift apart — and that test runs inside the construction sandbox,
// where there is no company, no docker socket and no credential. A file that
// started drilling the holding the moment it was imported would take the whole
// battery with it.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((e) => {
    try { cleanup(); } catch { /* best effort */ }
    console.error(String(e?.stack || e).slice(0, 4000));
    console.error("SEPARATION_UNPROVEN — the drill could not complete, so it proves nothing.");
    process.exit(1);
  });
}
