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
  // AN ADJECTIVE BETWEEN THE NUMBER AND THE NOUN HID A WRONG NUMBER FOR A WHOLE DAY.
  // Measured 2026-09-21 by an adversarial reader: SKILL.md's frontmatter `description:`
  // - the one sentence every session is handed before it does anything - said "37 keyless
  // channels" while the map held 39, and this pattern could not see it because of the word
  // "keyless". One optional word is allowed between the two now. The `files|dosya` guard
  // still stands: "36 channel files" is a measurement of a run, not a claim about the map.
  COUNT_CLAIM: /\b(\d{1,3})[ -](?:[A-Za-z]+[ -])?(?:channels?|kanal)\b(?!\s*(?:files|dosya|dosyasi|dosyası))/g,
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
   * A PARAGRAPH IS NOT A SEARCH TERM. Measured 2026-09-20: a several-sentence complaint was
   * handed to this door and pushed into 37 search boxes unchanged — quora answered NOT_FOUND
   * and hackernews 400. The repair is a wall at both floors: the session types SHORT queries,
   * and the fleet and the sweep each refuse anything longer before a channel is reached. These
   * constants are what those walls look like in the files, so a later repair cannot quietly
   * take one down.
   */
  FLEET_FILE: "fleet/fleet.sh",
  /** the fleet judges every `--q` before it opens a ground or launches a hunter */
  FLEET_GATE: /shortq\.py" --gate "\$q"/,
  /** the two lines that let anything happen: the ground opens, then a hunter is launched */
  GROUND_FIRE: /sweep\.sh" "\$q"/,
  HUNTER_LAUNCH: /claude -p "\$\(cat "\$OUT\/prompt-\$role\.txt"\)"/,
  /** the sweep refuses a paragraph, on the engine's own judgement rather than a second copy */
  QUERY_GATE: /shortq\.py" --gate "\$QUERY"/,
  /** every fired channel writes down what it was actually sent */
  QUERIES_LOG: />> "\$OUT\/\.queries"/,
  /** the stand-in chain and the walk to a site's own search page write the ledger too */
  FALLBACK_LOG: /printf '%s\\t%s\\n' "\$dead-via-\$sub"/,
  LASTRESORT_LOG: /printf '%s\\t%s\\n' "\$dead-direct/,
  /** and the walk to a site's own SEARCH BOX carries the short form, never the sentence */
  LASTRESORT_BOX: /search\?q=\$\{UKQ\}/,
  TRUNCATE_LEDGER: /^: > "\$OUT\/\.queries"$/m,
  /** a channel line the guard MUST refuse — a writing verb, injected into a copy and fired */
  GUARD_BAIT: [/^reddit\|core\|opencli reddit search /m, "reddit|core|opencli reddit post "] as const,
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
  // the wall between a paragraph and a search box (2026-09-20)
  "queries-before-fleet",
  "no-paragraph-to-a-box",
  "short-query-has-a-word",
  "first-word-counts",
  "queries-are-logged",
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

  // ── THE WALL BETWEEN A PARAGRAPH AND A SEARCH BOX ──────────────────────────────────
  // Both rules below were a REAL hole on 2026-09-20: a several-sentence complaint went to 37
  // search boxes verbatim, and afterwards the engine could not say what it had sent.
  const fleetPath = join(skillDir, RULER.FLEET_FILE);
  const fleetLines = existsSync(fleetPath) ? read(fleetPath).split("\n") : [];
  const at = (lines: string[], re: RegExp) => lines.findIndex((l) => re.test(l));

  // R12 — NO QUERY, NO FLEET: every `--q` is judged above the ground AND above the hunters.
  if (fleetLines.length === 0) {
    add("queries-before-fleet", rel(fleetPath), "the fleet could not be read");
  } else {
    const wall = fleetLines.findIndex((l) => RULER.FLEET_GATE.test(l) && !/^\s*#/.test(l));
    const ground = at(fleetLines, RULER.GROUND_FIRE);
    const hunter = at(fleetLines, RULER.HUNTER_LAUNCH);
    if (wall === -1) {
      add("queries-before-fleet", rel(fleetPath),
        "the fleet no longer judges its queries — a paragraph can fan out again");
    }
    if (ground !== -1 && wall !== -1 && wall > ground) {
      add("queries-before-fleet", `${rel(fleetPath)}:${wall + 1}`, `the ground is already open at line ${ground + 1}`);
    }
    if (hunter !== -1 && wall !== -1 && wall > hunter) {
      add("queries-before-fleet", `${rel(fleetPath)}:${wall + 1}`, `a hunter is already launched at line ${hunter + 1}`);
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
    // `claude` is stubbed too: the fleet is fired here, and a wall that a future repair takes
    // down must not be able to launch a paid hunter from inside a ruler that runs on every commit.
    for (const tool of ["opencli", "curl", "node", "npx", "wget", "claude"]) {
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
  // R17 — A LINE WITH NO WORD IN IT IS NOT A SEARCH. The gate is RUN against the text an
  // auditor typed on 2026-09-20 — "200 %50 5.1", every token a number — and it must refuse it;
  // a box that is sent numbers alone answers with the internet's whole noise.
  const shortqPath = join(skillDir, "scripts", "shortq.py");
  if (existsSync(shortqPath)) {
    let code = 0;
    try {
      execFileSync("python3", [shortqPath, "--gate", "200 %50 5.1"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    } catch (e) {
      code = Number((e as { status?: number }).status ?? 1);
    }
    if (code !== 3) {
      add("short-query-has-a-word", rel(shortqPath),
        `the query "200 %50 5.1" left the gate with code ${code}, not 3 — a line with no word in it is not a search`);
    }
  } else {
    add("short-query-has-a-word", rel(shortqPath), "the short-query producer is gone");
  }

  // R17b — the first word of a question is very often the name it is about.
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
    // 1b. WHAT THE CHANNELS WERE SENT, MEASURED IN THE LEDGER OF A REAL RUN. An auditor parked
    // the live branch on `if false` and left the line the old rule was reading: ALL-GREEN, while
    // the engine could not say what had gone out. `--dry` builds every channel's line and writes
    // the ledger without firing anything, so this costs milliseconds and still measures behaviour.
    const dry = join(scratch, "dry");
    const SORU = "Claude Max 20x kullanim limiti Pro'nun kac kati?";
    const rd = fire([join(skillDir, RULER.MAP_FILE), SORU, dry, "--tier", "max",
      "--no-browser", "--dry"], bin);
    const ledgerPath = join(dry, ".queries");
    if (rd.code !== 0 || !existsSync(ledgerPath)) {
      add("queries-are-logged", rel(join(skillDir, RULER.MAP_FILE)),
        `a dry run could not write a ledger (code ${rd.code}) — what the channels are sent cannot be measured`);
    } else {
      const rows = read(ledgerPath).split("\n").filter(Boolean).map((r) => r.split("\t"));
      if (rows.length === 0 || !rows.every((r) => r.length >= 2 && r[1])) {
        add("queries-are-logged", rel(ledgerPath), "a ledger row does not say what was sent");
      }
      // …and a second run into the same folder must not double it (the ledger is THIS run's)
      fire([join(skillDir, RULER.MAP_FILE), SORU, dry, "--tier", "max", "--no-browser", "--dry"], bin);
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

    // 2. THE FLEET REFUSES A PARAGRAPH AND REFUSES TO RUN WITH NO QUERY AT ALL. Measured by
    // being fired, not by being read: an auditor took three walls down on 2026-09-20 while every
    // sentence the regexes looked for stayed in the file, and nothing went red.
    const rNoQ = fire([fleetPath, join(scratch, "f0")], bin);
    if (rNoQ.code !== 3 || !/sorgu yok, filo yok/.test(rNoQ.out)) {
      add("queries-before-fleet", rel(fleetPath),
        `a fleet with no --q left with code ${rNoQ.code} — a run with nothing to ask is not a run`);
    }
    const r2 = fire([fleetPath, join(scratch, "f1"), "--q", PARAGRAPH], bin);
    if (r2.code !== 3 || !/paragraf/.test(r2.out)) {
      add("queries-before-fleet", rel(fleetPath), `a paragraph left the fleet with code ${r2.code}, not 3`);
    }
    // AND THE DISCRIMINATOR IS THE FOLDER: the wall stands ABOVE `mkdir -p "$OUT"`, so when it
    // fires nothing is created at all; a refused query that still opened a run folder means
    // something BELOW the wall stopped it, and the wall itself could be gone.
    if (existsSync(join(scratch, "f1"))) {
      add("queries-before-fleet", rel(fleetPath),
        "a refused query created the run folder — the wall is not what stopped it, something below it was");
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
