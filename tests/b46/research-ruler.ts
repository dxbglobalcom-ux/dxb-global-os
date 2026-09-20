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
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

  /**
   * LAYER 2 — HIS COMPLAINT IS NOT A SEARCH TERM. His ruling of 2026-09-20, in his own words:
   * *"skill beni boru yaptı"* — the door took his paragraph and pushed it down a pipe into 37
   * search boxes, and the boxes answered with nothing. The repair was a LAYER: the session
   * decomposes the complaint into tagged sub-questions (`scripts/plan.py`, SKILL.md §0), and
   * two walls make that non-optional. These constants are what the walls look like in the
   * files, so a later repair cannot quietly take one down.
   */
  FLEET_FILE: "fleet/fleet.sh",
  PLAN_FILE: "scripts/plan.py",
  /** the fleet refuses to start without a plan */
  PLAN_WALL: /python3 "\$PY_PLAN" --check "\$PLAN"/,
  /** …and a plan with nothing to hunt is refused too */
  NOTHING_OUTSIDE: /disari cikan tek bir alt-soru yok/,
  /** the two lines that let anything happen: the ground opens, then a hunter is launched */
  GROUND_FIRE: /sweep\.sh" "\$soru"/,
  HUNTER_LAUNCH: /claude -p "\$\(cat "\$OUT\/prompt-\$role\.txt"\)"/,
  /** the sweep refuses a paragraph, on the engine's own judgement rather than a second copy */
  QUERY_GATE: /shortq\.py" --gate "\$QUERY"/,
  /** every fired channel writes down what it was actually sent */
  QUERIES_LOG: />> "\$OUT\/\.queries"/,
  /** a hunter is told to name the sub-question each finding answers */
  NAMES_ITS_QUESTION: /NAMES ITS SUB-QUESTION BY ID/,
  /** the plans the gate is broken against, inside the engine so a COPY carries them */
  FIXTURES: "schemas/plan-fixtures",
  /** the plan's own box query must REACH the box — the fleet hands it over, the sweep honours it */
  FLEET_PASSES_KISA: /--kisa "\$kisa"/,
  SWEEP_TAKES_KISA: /--kisa\) KISA="\$2"/,
  SWEEP_USES_KISA: /^\s*KQ="\$KISA"/m,
  /** the plan is READ, never written — `--fix` rewrote his file on every single hunt */
  PLAN_WRITES: /\.write_text\(|safe_dump\(|--fix/,
  /** the merge drops a verdict that names no sub-question, and says how many it dropped */
  MERGE_DROPS: /dusurulen: \{len\(dropped\)\} hukum/,
  MERGE_LANES: "schemas/plan-fixtures/merge-lanes",
  /** the stand-in chain and the walk to a site's own search page write the ledger too */
  FALLBACK_LOG: /printf '%s\\t%s\\n' "\$dead-via-\$sub"/,
  LASTRESORT_LOG: /printf '%s\\t%s\\n' "\$dead-direct/,
  /** and the walk to a site's own SEARCH BOX carries the short form, never the sentence */
  LASTRESORT_BOX: /search\?q=\$\{UKQ\}/,
  TRUNCATE_LEDGER: /^: > "\$OUT\/\.queries"$/m,
  /** a channel line the guard MUST refuse — a writing verb, injected into a copy and fired */
  GUARD_BAIT: [/^reddit\|core\|opencli reddit search /m, "reddit|core|opencli reddit post "] as const,
  /**
   * HIS ORDER OF 2026-09-20, WHICH MUST NOT QUIETLY FALL OUT OF THE DOOR'S OWN TEXT. The door
   * is the hands, never the head: the session answers him with its own judgement and opens this
   * for a tagged sub-question only. The sentence lives in TWO places — the frontmatter
   * description, which decides when the door opens at all, and the head of §0 — and the marker
   * ties both to his registered words (`ceo-approvals.json`).
   */
  HANDS_NOT_HEAD: /HANDS, NEVER THE HEAD/i,
  CEO_MARK: "CEO-OK: door-is-hands-not-head-2026-09-20",
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
  // Layer 2 — the plan between his complaint and the weapons (2026-09-20)
  "plan-before-fleet",
  "no-paragraph-to-a-box",
  "one-tag-per-question",
  "his-question-never-leaves",
  "machine-question-has-a-command",
  "short-query-has-a-word",
  "first-word-counts",
  "queries-are-logged",
  "finding-names-its-question",
  "shortq-is-not-the-planner",
  "plan-query-reaches-the-box",
  "plan-is-not-rewritten",
  "weapon-is-a-decision",
  "door-is-hands-not-head",
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

  // ── LAYER 2 — the plan, and the two walls that make it non-optional ─────────────────
  // Every rule below was a REAL hole on 2026-09-20: his complaint went to 37 search boxes
  // verbatim, two of his three sub-questions had no business leaving this machine at all,
  // and the engine could not say afterwards what it had sent.
  const fleetPath = join(skillDir, RULER.FLEET_FILE);
  const planPath = join(skillDir, RULER.PLAN_FILE);
  const fleetLines = existsSync(fleetPath) ? read(fleetPath).split("\n") : [];
  const at = (lines: string[], re: RegExp) => lines.findIndex((l) => re.test(l));

  // R12 — NO PLAN, NO FLEET: the wall stands above the ground AND above the hunters.
  if (!existsSync(planPath)) {
    add("plan-before-fleet", rel(planPath), "the plan reader is gone — nothing decomposes his complaint");
  }
  if (fleetLines.length === 0) {
    add("plan-before-fleet", rel(fleetPath), "the fleet could not be read");
  } else {
    const wall = at(fleetLines, RULER.PLAN_WALL);
    const ground = at(fleetLines, RULER.GROUND_FIRE);
    const hunter = at(fleetLines, RULER.HUNTER_LAUNCH);
    if (wall === -1) add("plan-before-fleet", rel(fleetPath), "the fleet no longer demands a plan — a paragraph can fan out again");
    if (ground !== -1 && wall !== -1 && wall > ground) {
      add("plan-before-fleet", `${rel(fleetPath)}:${wall + 1}`, `the ground is already open at line ${ground + 1}`);
    }
    if (hunter !== -1 && wall !== -1 && wall > hunter) {
      add("plan-before-fleet", `${rel(fleetPath)}:${wall + 1}`, `a hunter is already launched at line ${hunter + 1}`);
    }
    // R15 — a plan with no DISARIDA row does not leave the machine.
    if (at(fleetLines, RULER.NOTHING_OUTSIDE) === -1) {
      add("his-question-never-leaves", rel(fleetPath),
        "the fleet no longer refuses a plan whose questions are all MAKINE / ONUN_KARARI");
    }
    // R20 — the planner is the session, never the keyword script.
    if (fleetLines.some((l) => /shortq\.py/.test(l) && !/^\s*#/.test(l))) {
      add("shortq-is-not-the-planner", rel(fleetPath),
        "the fleet calls shortq.py — the decomposition is the session's judgement, not a keyword line");
    }
    // R19 — a finding names the sub-question it answers.
    if (at(fleetLines, RULER.NAMES_ITS_QUESTION) === -1) {
      add("finding-names-its-question", rel(fleetPath),
        "the hunters are no longer told to name their S<n> — a finding that answers nobody comes back");
    }
  }

  // R13 — A PARAGRAPH NEVER REACHES A SEARCH BOX: the gate stands above the fan-out.
  const gateLine = lines.findIndex((l) => RULER.QUERY_GATE.test(l));
  if (gateLine === -1) {
    add("no-paragraph-to-a-box", rel(join(skillDir, RULER.MAP_FILE)),
      "the sweep no longer refuses a paragraph — his 650-character complaint would fan out again");
  } else if (fanOutLine !== -1 && gateLine > fanOutLine) {
    add("no-paragraph-to-a-box", `${rel(join(skillDir, RULER.MAP_FILE))}:${gateLine + 1}`,
      `the gate looks at line ${gateLine + 1}, the channels are already fired at line ${fanOutLine + 1}`);
  }

  // R18 — what was actually sent is written down, above the fan-out.
  const logLine = lines.findIndex((l) => RULER.QUERIES_LOG.test(l) && !/^\s*#/.test(l));
  if (logLine === -1) {
    add("queries-are-logged", rel(join(skillDir, RULER.MAP_FILE)),
      "no run writes .queries any more — 'did his paragraph go out?' would be answered by a sentence");
  } else if (fanOutLine !== -1 && logLine > fanOutLine) {
    add("queries-are-logged", `${rel(join(skillDir, RULER.MAP_FILE))}:${logLine + 1}`,
      `the ledger is written at line ${logLine + 1}, after the channel is fired at line ${fanOutLine + 1}`);
  }

  // R14/R16/R17 — the gate's own judgement, run against the plans it must refuse. The fixtures
  // travel INSIDE the engine, so a copy of the engine is measured by its own copies.
  const runPy = (args: string[]): number => {
    try {
      execFileSync("python3", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
      return 0;
    } catch (e) {
      return Number((e as { status?: number }).status ?? 1);
    }
  };
  /**
   * A WALL IS MEASURED BY BEING RUN, NOT BY BEING READ. An independent auditor broke all three
   * wall rules on 2026-09-20 without any of them going red: `if false; then` left the sentence
   * the regexes were looking for, the ledger line was deleted and left in a comment, and a
   * 152-character paragraph went to twelve channels while the ruler printed ALL-GREEN. So the
   * walls are now FIRED here. The run gets a stub PATH — `opencli`, `curl`, `node`, `npx` all
   * exit 1 at once — so that a broken wall cannot reach the outside world from inside a ruler
   * that runs on every commit; what is measured is the exit code and the folder, not a page.
   */
  const stubBin = (): string => {
    const dir = execFileSync("mktemp", ["-d"], { encoding: "utf8" }).trim();
    for (const tool of ["opencli", "curl", "node", "npx", "wget"]) {
      writeFileSync(join(dir, tool), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    }
    return dir;
  };
  const fire = (cmd: string[], bin: string): { code: number; out: string } => {
    try {
      const out = execFileSync("bash", cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
        timeout: 90_000 });
      return { code: 0, out };
    } catch (e) {
      const err = e as { status?: number; stdout?: string; stderr?: string };
      return { code: err.status ?? 1, out: String(err.stdout ?? "") + String(err.stderr ?? "") };
    }
  };
  const runPyQuiet = (args: string[]): void => {
    try {
      execFileSync("python3", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    } catch {
      /* the exit code is not what this rule measures — the bytes on disk are */
    }
  };
  const fixture = (name: string) => join(skillDir, RULER.FIXTURES, name);
  const REFUSED: [RuleName, string, string][] = [
    ["one-tag-per-question", "two-tags.md", "a sub-question carrying two tags is accepted — a tag is a decision, not a label"],
    ["machine-question-has-a-command", "no-command.md", "a MAKINE question with no command is accepted — it would be searched instead of measured"],
    ["short-query-has-a-word", "no-word.md", "the box query \"200 %50 5.1\" is accepted — a line with no word in it is not a search"],
  ];
  for (const [rule, file, detail] of REFUSED) {
    if (!existsSync(fixture(file))) {
      add(rule, rel(fixture(file)), "the fixture that proves this rule is gone");
      continue;
    }
    if (runPy([planPath, "--check", fixture(file)]) !== 3) add(rule, rel(fixture(file)), detail);
  }
  // …and the sound plan must still pass, or the gate is refusing everything and proving nothing.
  if (existsSync(fixture("sound.md")) && runPy([planPath, "--check", fixture("sound.md")]) !== 0) {
    add("one-tag-per-question", rel(fixture("sound.md")), "a SOUND plan is refused — a gate that refuses everything answers nothing");
  }

  // R17b — the first word of a question is very often the name it is about.
  const shortqPath = join(skillDir, "scripts", "shortq.py");
  if (existsSync(shortqPath)) {
    try {
      const out = execFileSync("python3", [shortqPath, "Hetzner Storage Box mu Backblaze B2 mi daha ucuz"],
        { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } }).trim();
      if (!out.includes("Hetzner")) {
        add("first-word-counts", rel(shortqPath), `the first word is dropped: "${out}" — the name the question is about`);
      }
    } catch (e) {
      add("first-word-counts", rel(shortqPath), `could not be run: ${String(e).slice(0, 90)}`);
    }
  } else {
    add("first-word-counts", rel(shortqPath), "the short-query producer is gone");
  }

  // R22 — THE PLAN'S OWN BOX QUERY REACHES THE BOX. Measured by the checker 2026-09-20: the
  // session decided what a search box should be asked, wrote it into the plan, and the sweep
  // threw it away and re-derived one from the sentence — Layer 2's judgement reached no channel
  // at all. The plan's `kisa` now travels: the fleet hands it over, the sweep uses it as it is.
  if (fleetLines.length && !fleetLines.some((l) => RULER.FLEET_PASSES_KISA.test(l))) {
    add("plan-query-reaches-the-box", rel(fleetPath),
      "the fleet no longer hands the plan's `kisa` to the sweep — the session's own box query is thrown away");
  }
  if (!RULER.SWEEP_TAKES_KISA.test(sweepText)) {
    add("plan-query-reaches-the-box", rel(join(skillDir, RULER.MAP_FILE)),
      "the sweep no longer accepts --kisa — it would re-derive a box query the plan already decided");
  }
  if (!RULER.SWEEP_USES_KISA.test(sweepText)) {
    add("plan-query-reaches-the-box", rel(join(skillDir, RULER.MAP_FILE)),
      "the sweep accepts --kisa and does not use it");
  }

  // R23 — THE PLAN IS READ, NEVER WRITTEN. The first version filled a missing `kisa` and wrote
  // the file back with a YAML dumper: one run destroyed the fence, the comments, the body and
  // the `dert: |` block — and the fleet called it on EVERY hunt. Two ways to be sure: the
  // reader holds no writer at all, and the file is byte-identical after being checked.
  if (existsSync(planPath)) {
    // THE PROSE IS NOT THE CODE. The file EXPLAINS the defect it was repaired for — "one
    // `--check --fix` destroyed the fence, the comments and the body" — and a rule that reads
    // that sentence as a writer would go red on its own history. Only the code is measured:
    // the module docstring is cut off first, and comment lines are skipped.
    const planSrc = read(planPath);
    const q1 = planSrc.indexOf('"""');
    const q2 = q1 === -1 ? -1 : planSrc.indexOf('"""', q1 + 3);
    const codeFrom = q2 === -1 ? 0 : q2 + 3;
    const offset = planSrc.slice(0, codeFrom).split("\n").length - 1;
    planSrc.slice(codeFrom).split("\n").forEach((line, i) => {
      if (RULER.PLAN_WRITES.test(line) && !/^\s*#/.test(line)) {
        add("plan-is-not-rewritten", `${rel(planPath)}:${offset + i + 1}`,
          `the plan reader can write: ${line.trim().slice(0, 80)}`);
      }
    });
    const sound = join(skillDir, RULER.FIXTURES, "sound.md");
    if (existsSync(sound)) {
      const before = read(sound);
      runPyQuiet([planPath, "--check", sound]);
      if (read(sound) !== before) {
        add("plan-is-not-rewritten", rel(sound), "checking a plan CHANGED it — his file is not the engine's scratch paper");
      }
    }
  }

  // R24 — a plan that names no weapon is not a plan. Firing all seven at everything is the
  // absence of a decision, which is what Layer 2 exists to restore.
  const noWeapon = join(skillDir, RULER.FIXTURES, "no-weapon.md");
  if (!existsSync(noWeapon)) {
    add("weapon-is-a-decision", rel(noWeapon), "the fixture that proves this rule is gone");
  } else if (runPy([planPath, "--check", noWeapon]) !== 3) {
    add("weapon-is-a-decision", rel(noWeapon), "a DISARIDA row with an empty `silah` is accepted");
  }

  // R19b — …and the S<n> requirement is a MECHANISM, proved by running the merge over two lanes:
  // one that names its sub-question and one that does not.
  const lanes = join(skillDir, RULER.MERGE_LANES);
  const mergePy = join(skillDir, "fleet", "merge.py");
  if (!RULER.MERGE_DROPS.test(existsSync(mergePy) ? read(mergePy) : "")) {
    add("finding-names-its-question", rel(mergePy),
      "the merge no longer drops a verdict that names no S<n> — the rule would be prose again");
  } else if (existsSync(lanes)) {
    try {
      const tmp = execFileSync("mktemp", ["-d"], { encoding: "utf8" }).trim();
      execFileSync("bash", ["-c", `cp ${JSON.stringify(lanes)}/*.jsonl ${JSON.stringify(tmp)}/`]);
      const out = execFileSync("python3", [mergePy, tmp], { encoding: "utf8",
        env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
      execFileSync("rm", ["-rf", tmp]);
      if (!/dusurulen: 1 hukum/.test(out)) {
        add("finding-names-its-question", rel(mergePy), "a verdict naming no S<n> was NOT dropped by the merge");
      }
      if (/belirgin fark yok/.test(out)) {
        add("finding-names-its-question", rel(mergePy), "the dropped verdict is still printed to him");
      }
    } catch (e) {
      add("finding-names-its-question", rel(mergePy), `the merge could not be run: ${String(e).slice(0, 90)}`);
    }
  }

  // ── THE WALLS, FIRED ─────────────────────────────────────────────────────────────────
  {
    const bin = stubBin();
    const scratch = execFileSync("mktemp", ["-d"], { encoding: "utf8" }).trim();
    const PARAGRAPH =
      "codex'in 200 dolarlik paketinde %50 astra siniri yok ama fable 5.1'de var ve bu asiri " +
      "can sikici. Bu dogru bir karar mi? Ne yapmaliyim? Karar ver.";
    // 1. a paragraph must not reach one channel
    const sweepOut = join(scratch, "para");
    const r1 = fire([join(skillDir, RULER.MAP_FILE), PARAGRAPH, sweepOut,
      "--tier", "core", "--no-browser", "--no-read", "--timeout", "3"], bin);
    if (r1.code !== 3) {
      add("no-paragraph-to-a-box", rel(join(skillDir, RULER.MAP_FILE)),
        `a 4-sentence paragraph left the sweep with code ${r1.code}, not 3 — the wall does not fire`);
    }
    if (existsSync(sweepOut)) {
      add("no-paragraph-to-a-box", rel(join(skillDir, RULER.MAP_FILE)),
        "the paragraph opened a run folder — channels were reached");
    }
    // 1b. THE PLAN'S OWN BOX QUERY, MEASURED IN THE LEDGER OF A REAL RUN. An auditor parked the
    // live branch on `if false` and left the line the old rule was reading: ALL-GREEN, while the
    // box got a query the plan never wrote. `--dry` builds every channel's line and writes the
    // ledger without firing anything, so this costs milliseconds and still measures behaviour.
    const dry = join(scratch, "dry");
    const KISA = "Claude Max 20x limits";
    const SORU = "Claude Max 20x kullanim limiti Pro'nun kac kati?";
    const rd = fire([join(skillDir, RULER.MAP_FILE), SORU, dry, "--tier", "max",
      "--no-browser", "--dry", "--kisa", KISA], bin);
    const ledgerPath = join(dry, ".queries");
    if (rd.code !== 0 || !existsSync(ledgerPath)) {
      add("plan-query-reaches-the-box", rel(join(skillDir, RULER.MAP_FILE)),
        `a dry run could not write a ledger (code ${rd.code}) — what the channels are sent cannot be measured`);
    } else {
      const rows = read(ledgerPath).split("\n").filter(Boolean).map((r) => r.split("\t"));
      const boxes = rows.filter(([n]) => ["hackernews", "quora"].includes(n));
      if (boxes.length === 0) {
        add("plan-query-reaches-the-box", rel(ledgerPath), "no search-box channel appears in the ledger at all");
      }
      for (const [name, sent] of boxes) {
        if (sent !== KISA) {
          add("plan-query-reaches-the-box", `${rel(join(skillDir, RULER.MAP_FILE))} · ${name}`,
            `the box was sent "${sent}" — the plan decided "${KISA}"`);
        }
      }
      if (!rows.some(([n, sent]) => n === "exa" && sent === SORU)) {
        add("plan-query-reaches-the-box", rel(ledgerPath),
          "the sentence engines no longer get the whole sub-question — only boxes take the short form");
      }
      if (rows.length === 0 || !rows.every((r) => r.length >= 2 && r[1])) {
        add("queries-are-logged", rel(ledgerPath), "a ledger row does not say what was sent");
      }
      // …and a second run into the same folder must not double it (the ledger is THIS run's)
      fire([join(skillDir, RULER.MAP_FILE), SORU, dry, "--tier", "max",
        "--no-browser", "--dry", "--kisa", KISA], bin);
      const again = read(ledgerPath).split("\n").filter(Boolean).length;
      if (again !== rows.length) {
        add("queries-are-logged", rel(ledgerPath),
          `a second run left ${again} rows where the first left ${rows.length} — the ledger is not truncated`);
      }
    }

    // 1c. THE GUARD THAT PROTECTS HIS SIGNATURE IS FIRED, NOT READ. It refuses any channel line
    // carrying a writing or sign-in verb — post, comment, like, follow, message, vote — because
    // this engine reads the world and never speaks in it (CLAUDE.md §2: what faces outward stops
    // at the CEO). An auditor measured on 2026-09-20 that `guard-before-fanout` only checked
    // where the line SITS: with the guard parked on a dead branch and `opencli reddit post` put
    // into a live channel, the ruler stayed green and the writing verb reached the fan-out list.
    // So a COPY of the engine is baited with that exact line and the copy is run: it must refuse.
    const bait = join(scratch, "bait-engine");
    execFileSync("cp", ["-a", skillDir, bait]);
    execFileSync("rm", ["-rf", join(bait, "runs"), join(bait, "scripts", "__pycache__")]);
    const baitSweep = join(bait, RULER.MAP_FILE);
    const [from, to] = RULER.GUARD_BAIT;
    const baitText = read(baitSweep);
    if (!from.test(baitText)) {
      add("guard-before-fanout", rel(join(skillDir, RULER.MAP_FILE)),
        "the channel line this rule baits is gone — the guard can no longer be fired");
    } else {
      writeFileSync(baitSweep, baitText.replace(from, to), "utf8");
      const rg = fire([baitSweep, "Claude Max 20x limits", join(scratch, "bait-out"),
        "--tier", "core", "--no-browser", "--dry"], bin);
      if (rg.code !== 3) {
        add("guard-before-fanout", rel(join(skillDir, RULER.MAP_FILE)),
          `a channel calling "opencli reddit post" was accepted (code ${rg.code}) — a writing verb reached the fan-out`);
      }
      // The ledger FILE is opened when the run folder is made, one floor above the guard, so its
      // existence proves nothing. A ROW does: it means a channel line was accepted and sent.
      const baitLedger = join(scratch, "bait-out", ".queries");
      const baitRows = existsSync(baitLedger) ? read(baitLedger).split("\n").filter(Boolean) : [];
      if (baitRows.length > 0) {
        add("guard-before-fanout", rel(join(skillDir, RULER.MAP_FILE)),
          `the baited run put ${baitRows.length} channel(s) on the wire — the guard let a writing verb past`);
      }
    }

    // 2. the fleet refuses anything that is not a plan…
    const notAPlan = join(scratch, "dert.txt");
    writeFileSync(notAPlan, PARAGRAPH + "\n");
    const r2 = fire([fleetPath, notAPlan, join(scratch, "f1")], bin);
    if (r2.code !== 3) {
      add("plan-before-fleet", rel(fleetPath), `a paragraph left the fleet with code ${r2.code}, not 3`);
    }
    // 2b. …AND THE FIRST WALL IS THE ONE MEASURED. An auditor showed the paragraph case was
    // being refused one line lower (`--outside … || exit 3`), so the plan wall could be switched
    // off entirely and nothing went red. `dup-id.md` separates them: `--check` refuses it (two
    // rows called S2), `--outside` would happily print both. Only the wall stops this one.
    const dupId = join(skillDir, RULER.FIXTURES, "dup-id.md");
    if (existsSync(dupId)) {
      const out2b = join(scratch, "f1b");
      const r2b = fire([fleetPath, dupId, out2b], bin);
      if (r2b.code !== 3) {
        add("plan-before-fleet", rel(fleetPath),
          `a plan the reader REFUSES left the fleet with code ${r2b.code}`);
      }
      // AND THE DISCRIMINATOR IS THE FOLDER. The second check (`--outside … || exit 3`) also
      // answers 3, so the exit code alone cannot tell the two apart — an auditor showed the wall
      // could be switched off with the rule still green. The wall stands ABOVE `mkdir -p "$OUT"`:
      // when it fires, nothing is created at all; when it is gone, the run folder and an empty
      // outside.tsv are already on disk before the second check speaks.
      if (existsSync(out2b)) {
        add("plan-before-fleet", rel(fleetPath),
          "a refused plan created the run folder — the wall is not what stopped it, something below it was");
      }
    }

    // 3. …and a plan whose questions are all his never leaves the machine
    const onlyHis = join(skillDir, RULER.FIXTURES, "only-his.md");
    if (existsSync(onlyHis)) {
      const r3 = fire([fleetPath, onlyHis, join(scratch, "f2")], bin);
      if (r3.code !== 3) {
        add("his-question-never-leaves", rel(fleetPath),
          `a plan with no DISARIDA row left the fleet with code ${r3.code}, not 3 — his own questions went out`);
      }
    }
    // THE LEDGER IS NOT FIRED HERE, AND THAT IS DELIBERATE. Proving it by a run means letting a
    // sweep fan out — the only fire in this block that does — and it took the ruler from under a
    // second to six and a half, on a metre that runs on EVERY commit. The comment trick that
    // walked through the old rule (delete the line, leave the string in a comment) is caught by
    // the source rule above, which now ignores comment lines; the live proof belongs to
    // `accept.sh`, which reads the run's own .queries and prints its row count.
    execFileSync("rm", ["-rf", bin, scratch]);
  }

  // THE PATHS A DRY RUN CANNOT REACH — a channel must FAIL before the stand-in chain and the
  // walk to a site's own search page run at all, and a ruler may not wait for that. They are
  // named here line by line, because an auditor deleted both of their ledger rows and switched
  // the last resort back to the full sentence with every rule still green.
  if (!RULER.FALLBACK_LOG.test(sweepText)) {
    add("queries-are-logged", rel(join(skillDir, RULER.MAP_FILE)),
      "the stand-in chain sends text outside and writes no ledger row");
  }
  if (!RULER.LASTRESORT_LOG.test(sweepText)) {
    add("queries-are-logged", rel(join(skillDir, RULER.MAP_FILE)),
      "the walk to a site's own search page sends text outside and writes no ledger row");
  }
  if (!RULER.TRUNCATE_LEDGER.test(sweepText)) {
    add("queries-are-logged", rel(join(skillDir, RULER.MAP_FILE)),
      "the ledger is no longer truncated at the start of a run — yesterday's rows would count as today's");
  }
  if (!RULER.LASTRESORT_BOX.test(sweepText)) {
    add("no-paragraph-to-a-box", rel(join(skillDir, RULER.MAP_FILE)),
      "the last resort types the WHOLE question into a site's own search box — only boxes get the short form");
  }

  // R25 — HIS ORDER STAYS IN THE DOOR'S OWN TEXT. The old trigger sentence ("Use whenever the
  // CEO asks to research…") is what a session read as "hand the door his paragraph", and the
  // pipe he named was born there. Both places are measured: the sentence that decides when the
  // door opens, and the ruling at the head of §0 with the marker that ties it to his words.
  const doorDoc = join(skillDir, "SKILL.md");
  if (!existsSync(doorDoc)) {
    add("door-is-hands-not-head", rel(doorDoc), "the door's own text is gone");
  } else {
    const text = read(doorDoc);
    const fmEnd = text.indexOf("\n---", 3);
    const front = fmEnd === -1 ? "" : text.slice(0, fmEnd);
    const body = fmEnd === -1 ? text : text.slice(fmEnd);
    if (!RULER.HANDS_NOT_HEAD.test(front)) {
      add("door-is-hands-not-head", `${rel(doorDoc)} (frontmatter)`,
        "the trigger sentence no longer says the door is the HANDS, never the head — the pipe he named starts here");
    }
    if (!RULER.HANDS_NOT_HEAD.test(body)) {
      add("door-is-hands-not-head", `${rel(doorDoc)} §0`, "his ruling has fallen out of the door's own body");
    }
    if (!body.includes(RULER.CEO_MARK)) {
      add("door-is-hands-not-head", `${rel(doorDoc)} §0`,
        `the marker "${RULER.CEO_MARK}" is gone — the text no longer points at his registered words`);
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
