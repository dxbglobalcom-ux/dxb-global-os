// THE RESEARCH-ENGINE RULER — one metre for the builder and the checker.
//
// WHY THIS FILE EXISTS, and it is not a hypothetical. Three independent audits of
// `.claude/skills/dxb-research/` on 2026-09-17 reached the same root cause: in this engine the
// proof of "done" was a sentence written into a commit message. A sentence is written once and
// dies; the next repair cannot RE-RUN it, so it never learns that it broke it. Two breakages were
// measured that day and neither was noticed by anybody:
//
//   * 16:17 — the site-error list was consolidated onto one owner and lost the marker
//     "Access Denied" on the way, so a page that says "access denied" became sound CONTENT;
//   * 13:37 — the rule for what counts as a wall was written into the reading chain and never
//     carried to the SWEEP, which decides the same thing one floor below.
//
// The CEO's ruling of 2026-09-15 (ceo-approvals.json, `ruler-table-holding-wide-2026-09-15`) is
// the law this file obeys, not a new one: "every commit runs its class's ruler automatically — no
// ruler green, no commit … a class with no ruler gets its ruler first." The research engine was a
// class with no ruler. This is its ruler.
//
// WHAT IT IS AND IS NOT. This file measures what can be read WITHOUT running the engine: the
// numbers the prose claims against the number the code holds, the cover map, the config file's
// parseability, the ONE-OWNER rule for the judge, the order of the login guard, and that every
// script compiles. Behaviour — what the engine DECIDES when a real page arrives — is not guessed
// here; it is executed in tests/b46/*.test.ts.
//
// Run it:
//   bash scripts/research-ruler.sh              — the ruler's table
//   bash scripts/research-ruler.sh --verdicts   — plus one RULER-VERDICT line per rule
//   npx vitest run tests/b46/research-ruler.test.ts
//
// Exit: 0 when every rule passes, 1 on any failure.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const HERE = dirname(resolve(import.meta.filename));
export const REPO = resolve(HERE, "..", "..");

/** THE CONSTANTS — every threshold and every declared fact of this ruler lives here. */
export const RULER = {
  /** the engine this ruler measures */
  SKILL: ".claude/skills/dxb-research",
  /** the records that also carry claims about the engine */
  RECORDS: [".planning/STATE.md", "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"] as const,
  /** the file that OWNS the channel count: its map is the only source of that number */
  MAP_FILE: "scripts/sweep.sh",
  /** the map is the heredoc between these two markers */
  MAP_OPEN: /^CHANNELS=\$\(cat <<'MAP'$/m,
  MAP_CLOSE: /^MAP$/m,
  /** a map row: name|tier|command */
  MAP_ROW: /^([a-z0-9][a-z0-9._-]*)\|(core|wide|max|browser)\|(.+)$/,
  /**
   * A CHANNEL-COUNT CLAIM: a number standing next to the word "channel"/"kanal". "102 channel
   * FILES" is a different quantity and is not a claim about how many channels exist.
   */
  COUNT_CLAIM: /\b(\d{1,3})[ -](?:channels?|kanal)\b(?!\s*(?:files|dosya|dosyasi|dosyası))/g,
  /**
   * HISTORY IS NOT A CLAIM. A line that records what was measured on a past day keeps its old
   * number and says so with this token. Nothing else is exempt — the reflex to "leave the old
   * number, it is history" without labelling it is how six files came to disagree.
   */
  HISTORY_TOKEN: "RULER-HISTORY",
  /** in the records, only the lines that belong to the research row carry engine claims */
  RECORD_SCOPE: /B46/,
  /**
   * THE MARKERS THE JUDGE MUST KNOW. Each one was learned from a page this engine actually met.
   * "access denied" is on this list because it was silently dropped on 2026-09-17 and a refused
   * page became sound content; a ruler exists so that cannot happen twice.
   */
  REQUIRED_SITE_ERROR: [
    "access denied",
    "something went wrong",
    "are you a robot",
    "enable javascript",
    "unusual traffic",
    "you reached the monthly",
    "free mcp rate limit",
  ] as const,
  /** the sweep may hold NO second copy of that list — one owner, or it fails loudly */
  SECOND_JUDGE: /^\s*\[\s*-z\s+"\$SITE_ERROR_RE"\s*\]\s*&&\s*SITE_ERROR_RE=.*\|/m,
  /** the guard that refuses a sign-in command, and the line that fires the channels */
  LOGIN_GUARD: /grep -qE '\(\^\|\[\|\[:space:\]\]\)opencli/,
  FAN_OUT: /^\s*DXB_Q="\$QUERY"/m,
  /** scripts that must compile */
  PY_GLOB: /\.py$/,
  SH_GLOB: /\.sh$/,
  /**
   * A PATH NAMED IN THE PROSE CONTRACT, WHICH MUST THEREFORE EXIST — in both shapes the door
   * actually writes: `fleet/merge.py`, and the shell form `"$R/crowd.sh"` / `"$F/fleet.sh"`
   * that the runnable examples use. The first version of this rule knew only the first shape,
   * matched almost nothing, and passed green while proving nothing — caught by its own bite
   * case, which is what a bite case is for.
   */
  CONTRACT_PATH: /\$(?:REPO|R|F|SKILL)\/[A-Za-z0-9._\/-]+|\b(?:scripts|fleet|config|hooks|policies|schemas|references)\/[A-Za-z0-9._-]+\.(?:py|sh|md|yaml|json|tsv)\b/g,
  /**
   * `$R` is the scripts folder and `$F` the fleet folder, as the contract's own examples set
   * them. `$REPO` is the repository root: the ruler and the battery live there, outside the
   * engine, and a path resolved against the wrong root reports a file that exists as missing.
   */
  CONTRACT_VARS: { "$R": "scripts", "$F": "fleet", "$SKILL": "", "$REPO": "__REPO__" } as Record<string, string>,
  /**
   * THE READING CHAIN'S DOOR COUNT, owned by `fetch.CHAIN` and written in six places in prose.
   * A door was added on 2026-09-17 (the signed-in browser) and every one of those sentences
   * still said eleven — the same drift that had let the channel count reach five different
   * numbers. A number written by hand in six places is a number that will be wrong.
   */
  DOOR_CLAIM: /\b(\d{1,2}|eleven|twelve|on bir|oniki|on iki)[ -](?:kapil[iı]|doors?|kap[iı])\b/gi,
  DOOR_WORDS: { eleven: 11, twelve: 12, "on bir": 11, oniki: 12, "on iki": 12 } as Record<string, number>,
  /** a top-level python assignment, for the duplicate-definition rule */
  PY_ASSIGN: /^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/,
} as const;

export const RULES = [
  "channel-count",
  "every-channel-covered",
  "no-ghost-cover",
  "registry-parses",
  "one-judge",
  "judge-markers",
  "guard-before-fanout",
  "scripts-compile",
  "no-duplicate-definition",
  "contract-paths-exist",
  "door-count",
] as const;
export type RuleName = (typeof RULES)[number];

export interface Failure {
  where: string;
  detail: string;
}
export interface RulerReport {
  channels: number;
  tiers: Record<string, number>;
  failures: Record<RuleName, Failure[]>;
  pass: boolean;
}
export interface RulerInput {
  /** absolute path of the engine folder to measure (a copy, in the ruler's own test) */
  skillDir: string;
  /** absolute paths of the record files to measure, or [] to measure none */
  records: string[];
}

// ── reading the engine ───────────────────────────────────────────────────────

const read = (p: string): string => readFileSync(p, "utf8");
const rel = (p: string): string => relative(REPO, p) || p;

/** THE CHANNEL COUNT IS COUNTED, NEVER QUOTED — the map is its only owner. */
export function readMap(skillDir: string): { name: string; tier: string; cmd: string }[] {
  const text = read(join(skillDir, RULER.MAP_FILE));
  const open = RULER.MAP_OPEN.exec(text);
  const close = RULER.MAP_CLOSE.exec(text.slice((open?.index ?? 0) + (open?.[0].length ?? 0)));
  if (!open || !close) return [];
  const body = text.slice(open.index + open[0].length, open.index + open[0].length + close.index);
  const rows: { name: string; tier: string; cmd: string }[] = [];
  for (const line of body.split("\n")) {
    const m = RULER.MAP_ROW.exec(line.trim());
    if (m) rows.push({ name: m[1], tier: m[2], cmd: m[3] });
  }
  return rows;
}

/** The declared stand-ins, read through the engine's own loader so the ruler sees what it sees. */
function readCovers(skillDir: string): Record<string, string[]> {
  const out = execFileSync(
    "python3",
    [
      "-c",
      [
        "import sys, json, pathlib",
        "sys.path.insert(0, sys.argv[1])",
        "import rlib",
        "d = rlib.load_yaml(pathlib.Path(sys.argv[2])) or {}",
        "ch = d.get('channels') or {}",
        "print(json.dumps({k: (v or {}).get('fallback') or [] for k, v in ch.items()}))",
      ].join("\n"),
      join(skillDir, "scripts"),
      join(skillDir, "config", "registry.yaml"),
    ],
    { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } },
  );
  return JSON.parse(out.trim());
}

/**
 * THE JUDGE'S WHOLE VOCABULARY, read from the one module that owns it: the site's own error
 * sentences, the wall wordings, and the doors' quota notices. The rule below asks whether a
 * marker this engine has MET is still known to it anywhere — the first version of this ruler
 * asked only `SITE_ERROR` and would have called the engine blind to "access denied" while the
 * wall list knew it perfectly well.
 */
function readSiteError(skillDir: string): string {
  return execFileSync(
    "python3",
    [
      "-c",
      "import sys; sys.path.insert(0, sys.argv[1]); import rlib; " +
        "print(rlib.SITE_ERROR + '|' + rlib._WALL.pattern + '|' + getattr(rlib, 'QUOTA_ERROR', ''))",
      join(skillDir, "scripts"),
    ],
    { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } },
  ).trim();
}

function scriptFiles(skillDir: string): string[] {
  const out = execFileSync("find", [skillDir, "-type", "f", "(", "-name", "*.py", "-o", "-name", "*.sh", ")",
    "-not", "-path", "*__pycache__*"], { encoding: "utf8" });
  return out.split("\n").filter(Boolean).sort();
}

// ── the rules ────────────────────────────────────────────────────────────────

export function runRuler(input?: Partial<RulerInput>): RulerReport {
  const skillDir = input?.skillDir ?? join(REPO, RULER.SKILL);
  const records = input?.records ?? RULER.RECORDS.map((r) => join(REPO, r));
  const failures = Object.fromEntries(RULES.map((r) => [r, [] as Failure[]])) as Record<RuleName, Failure[]>;
  const add = (rule: RuleName, where: string, detail: string) => failures[rule].push({ where, detail });

  const map = readMap(skillDir);
  const channels = map.length;
  const tiers: Record<string, number> = {};
  for (const r of map) tiers[r.tier] = (tiers[r.tier] ?? 0) + 1;
  if (channels === 0) add("channel-count", rel(join(skillDir, RULER.MAP_FILE)), "the channel map could not be read at all");

  // R1 — every number the prose puts next to "channel" equals the number the map holds.
  const claimFiles = [
    join(skillDir, "SKILL.md"),
    join(skillDir, "fleet", "ARSENAL.md"),
    join(skillDir, "fleet", "fleet.sh"),
    join(skillDir, RULER.MAP_FILE),
  ].filter(existsSync);
  for (const f of claimFiles) {
    read(f).split("\n").forEach((line, i) => {
      if (line.includes(RULER.HISTORY_TOKEN)) return;
      for (const m of line.matchAll(RULER.COUNT_CLAIM)) {
        if (Number(m[1]) !== channels) {
          add("channel-count", `${rel(f)}:${i + 1}`, `says "${m[0].trim()}" · the map holds ${channels}`);
        }
      }
    });
  }
  for (const f of records) {
    if (!existsSync(f)) continue;
    read(f).split("\n").forEach((line, i) => {
      if (!RULER.RECORD_SCOPE.test(line) || line.includes(RULER.HISTORY_TOKEN)) return;
      for (const m of line.matchAll(RULER.COUNT_CLAIM)) {
        if (Number(m[1]) !== channels) {
          add("channel-count", `${rel(f)}:${i + 1}`, `says "${m[0].trim()}" · the map holds ${channels}`);
        }
      }
    });
  }

  // R2/R3 — the cover map: nothing uncovered, nothing pointing at a channel that does not exist.
  let covers: Record<string, string[]> = {};
  try {
    covers = readCovers(skillDir);
  } catch (e) {
    add("every-channel-covered", rel(join(skillDir, "config/registry.yaml")), `could not be loaded: ${String(e).slice(0, 120)}`);
  }
  const names = new Set(map.map((r) => r.name));
  for (const r of map) {
    const list = covers[r.name] ?? [];
    if (list.length === 0) add("every-channel-covered", `registry.yaml · ${r.name}`, "no stand-in declared — when it falls, nothing is tried");
  }
  for (const [ch, list] of Object.entries(covers)) {
    if (!names.has(ch)) continue; // a registry entry for something the sweep does not fire is not a ghost
    for (const sub of list) {
      if (!names.has(sub)) add("no-ghost-cover", `registry.yaml · ${ch}`, `stand-in "${sub}" is not a channel in the map`);
    }
  }

  // R4 — the config must parse with a STANDARD parser, not only with the hand-written fallback.
  try {
    execFileSync("python3", ["-c", "import sys, yaml; yaml.safe_load(open(sys.argv[1], encoding='utf-8'))",
      join(skillDir, "config", "registry.yaml")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const msg = String((e as { stderr?: string }).stderr ?? e).trim().split("\n").slice(-2).join(" ");
    add("registry-parses", rel(join(skillDir, "config/registry.yaml")), `PyYAML refuses it: ${msg.slice(0, 140)}`);
  }

  // R5 — ONE JUDGE. The sweep may not carry its own copy of the site-error list: a second copy
  // drifts, and on 2026-09-17 it drifted by two words within four hours.
  const sweepText = read(join(skillDir, RULER.MAP_FILE));
  const second = RULER.SECOND_JUDGE.exec(sweepText);
  if (second) {
    const lineNo = sweepText.slice(0, second.index).split("\n").length;
    add("one-judge", `${rel(join(skillDir, RULER.MAP_FILE))}:${lineNo}`,
      "the sweep keeps a SECOND site-error list of its own — it must use rlib's, or fail loudly");
  }

  // R6 — the judge knows every marker this engine has met.
  let siteError = "";
  try {
    siteError = readSiteError(skillDir).toLowerCase();
  } catch (e) {
    add("judge-markers", rel(join(skillDir, "scripts/rlib.py")), `SITE_ERROR could not be read: ${String(e).slice(0, 100)}`);
  }
  if (siteError) {
    for (const marker of RULER.REQUIRED_SITE_ERROR) {
      if (!siteError.includes(marker)) {
        add("judge-markers", "rlib (SITE_ERROR · _WALL · QUOTA_ERROR)",
          `the marker "${marker}" is missing — a page that says it would pass as content`);
      }
    }
  }

  // R7 — the guard looks BEFORE the channels are fired, not after.
  const lines = sweepText.split("\n");
  const guardLine = lines.findIndex((l) => RULER.LOGIN_GUARD.test(l));
  const fanOutLine = lines.findIndex((l) => RULER.FAN_OUT.test(l));
  if (guardLine === -1) add("guard-before-fanout", rel(join(skillDir, RULER.MAP_FILE)), "the sign-in guard is gone");
  else if (fanOutLine === -1) add("guard-before-fanout", rel(join(skillDir, RULER.MAP_FILE)), "the fan-out line could not be found");
  else if (guardLine > fanOutLine) {
    add("guard-before-fanout", `${rel(join(skillDir, RULER.MAP_FILE))}:${guardLine + 1}`,
      `the guard looks at line ${guardLine + 1}, the channels are already fired at line ${fanOutLine + 1}`);
  }

  // R8 — everything compiles. A ruler that runs on a file the interpreter rejects proves nothing.
  const files = scriptFiles(skillDir);
  const py = files.filter((f) => RULER.PY_GLOB.test(f));
  const sh = files.filter((f) => RULER.SH_GLOB.test(f));
  for (const f of py) {
    try {
      // compile() parses without writing a .pyc anywhere — py_compile with cfile=/dev/null
      // refuses the character device, and __pycache__ residue is exactly what this engine
      // must stop leaving behind.
      execFileSync("python3", ["-c", "import sys; compile(open(sys.argv[1], encoding='utf-8').read(), sys.argv[1], 'exec')", f],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      add("scripts-compile", rel(f), String((e as { stderr?: string }).stderr ?? e).trim().split("\n").slice(-1)[0].slice(0, 140));
    }
  }
  for (const f of sh) {
    try {
      execFileSync("bash", ["-n", f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      add("scripts-compile", rel(f), String((e as { stderr?: string }).stderr ?? e).trim().split("\n").slice(-1)[0].slice(0, 140));
    }
  }

  // R9 — the same name defined twice with the same body: one of them is dead, and dead code lies.
  for (const f of py) {
    const seen = new Map<string, number>();
    read(f).split("\n").forEach((line, i) => {
      const m = RULER.PY_ASSIGN.exec(line);
      if (!m) return;
      const key = `${m[1]}=${m[2].trim()}`;
      if (seen.has(key)) {
        add("no-duplicate-definition", `${rel(f)}:${i + 1}`, `${m[1]} is defined identically at line ${seen.get(key)}`);
      } else seen.set(key, i + 1);
    });
  }

  // R10 — every file the prose contract names exists. A contract that points at nothing is a lie.
  for (const doc of [join(skillDir, "SKILL.md"), join(skillDir, "fleet", "ARSENAL.md")].filter(existsSync)) {
    const text = read(doc);
    const claimed = new Set<string>();
    for (const m of text.matchAll(RULER.CONTRACT_PATH)) claimed.add(m[0]);
    for (const p of claimed) {
      const m = /^\$(REPO|R|F|SKILL)\/(.+)$/.exec(p);
      const base = m && m[1] === "REPO" ? REPO : skillDir;
      const real = m ? (m[1] === "REPO" ? m[2] : join(RULER.CONTRACT_VARS["$" + m[1]], m[2])) : p;
      if (!existsSync(join(base, real))) {
        add("contract-paths-exist", rel(doc), `names "${p}", which does not exist`);
      }
    }
  }

  // R11 — the reading chain's door count, owned by fetch.CHAIN.
  let doors = 0;
  try {
    doors = Number(
      execFileSync("python3", ["-c",
        "import sys; sys.path.insert(0, sys.argv[1]); import fetch; print(len(fetch.CHAIN))",
        join(skillDir, "scripts")],
        { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } }).trim());
  } catch (e) {
    add("door-count", rel(join(skillDir, "scripts/fetch.py")), `the chain could not be counted: ${String(e).slice(0, 90)}`);
  }
  if (doors > 0) {
    const docs = [join(skillDir, "SKILL.md"), join(skillDir, "fleet", "ARSENAL.md"),
      join(skillDir, "references", "channels.md"), join(skillDir, RULER.MAP_FILE)].filter(existsSync);
    for (const f of docs) {
      read(f).split("\n").forEach((line, i) => {
        if (line.includes(RULER.HISTORY_TOKEN)) return;
        for (const m of line.matchAll(RULER.DOOR_CLAIM)) {
          const said = RULER.DOOR_WORDS[m[1].toLowerCase()] ?? Number(m[1]);
          if (Number.isFinite(said) && said !== doors) {
            add("door-count", `${rel(f)}:${i + 1}`, `says "${m[0].trim()}" · the chain has ${doors}`);
          }
        }
      });
    }
  }

  return { channels, tiers, failures, pass: RULES.every((r) => failures[r].length === 0) };
}

// ── the table ────────────────────────────────────────────────────────────────

export function formatReport(report: RulerReport): string {
  const out: string[] = [];
  out.push("RESEARCH-ENGINE RULER — one metre for the builder and the checker");
  out.push("");
  out.push(`   channels in the map: ${report.channels}   (${Object.entries(report.tiers)
    .sort()
    .map(([t, n]) => `${t} ${n}`)
    .join(" · ")})`);
  out.push("");
  out.push(`${"rule".padEnd(26)}${"failures".padStart(10)}   verdict`);
  out.push("-".repeat(50));
  for (const r of RULES) {
    const n = report.failures[r].length;
    out.push(`${r.padEnd(26)}${String(n).padStart(10)}   ${n === 0 ? "PASS" : "FAIL"}`);
  }
  out.push("");
  for (const r of RULES) {
    for (const f of report.failures[r]) out.push(`   ${r} · ${f.where} — ${f.detail}`);
  }
  out.push("");
  const passing = RULES.filter((r) => report.failures[r].length === 0).length;
  const total = RULES.reduce((n, r) => n + report.failures[r].length, 0);
  out.push(`RULER: ${passing}/${RULES.length} rules PASS · ${total} failures`);
  return out.join("\n");
}

// ── the shell door (scripts/research-ruler.sh runs this file directly) ───────

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const report = runRuler();
  console.log(formatReport(report));
  if (argv.includes("--verdicts")) {
    for (const r of RULES) console.log(`RULER-VERDICT\t${r}\t${report.failures[r].length === 0 ? "PASS" : "FAIL"}`);
  }
  process.exit(report.pass ? 0 : 1);
}
