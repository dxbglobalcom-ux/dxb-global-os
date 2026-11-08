#!/usr/bin/env node
// /kisayol — the agency's recipe cupboard (B43, CEO 2026-11-08). One tool for the building sessions:
//   lint     every recipe obeys the house rules (fields, names, size, references, slots, lettering,
//            audio, cast, the Islamic list, agent-directed text, accepted only with his approval id)
//   index    INDEX.md (≤ 4 KB) + index/<shelf>-<n>.md pages (≤ 40 rows, ≤ 6 KB) + RELEASE.txt (hash)
//   build    base[+modifier…] --slot k=v → one assembled prompt; refuses what may not stack
//   ara      the raw store's bounded search (quarry/search.py), ≤ 20 rows
//   verdict  appends his verdict to verdicts.tsv; never rewrites a row
//   render   build + the Codex image tool, headless, on the ChatGPT subscription (measured 2026-11-08:
//            80 s, the reference product kept) → one native PNG; stills only (video: the media lane)
// The cupboard itself is packages/gateway/plugins/kisayol/skills/kisayol (read by sessions through
// ~/.claude/skills/kisayol and by the studio's seats through their plugin grant). No packages used.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync, appendFileSync, statSync, mkdtempSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..", "..");
export const SKILL_DIR = join(REPO, "packages/gateway/plugins/kisayol/skills/kisayol");
const APPROVALS = join(REPO, "scripts/governance/ceo-approvals.json");
const VERDICTS = join(HERE, "verdicts.tsv");

const MAX_FILE = 4096, MAX_INDEX = 4096, MAX_PAGE = 6144, PAGE_ROWS = 40;
const REQUIRED = ["name", "aliases", "title_tr", "title_en", "when_tr", "when_en", "shelf", "role", "medium",
  "inputs", "slots", "composes_with", "conflicts", "cast", "forms", "status", "samples", "provenance", "version"];
const ENUMS = {
  role: ["base", "light", "lens", "grade", "composition", "camera", "effect", "background", "material"],
  medium: ["image", "video", "both"],
  cast: ["none", "house", "client-request"],
  status: ["candidate", "sampled", "accepted", "dormant"],
};
const INPUTS = ["product-photo", "cast-photo", "scene-ref", "none"];
// The engines built today (B43, 2026-11-08): only these may be ok/untested; any other is unavailable
// until it is built and wired (the platform hub). Video forms run at 8 steps.
const BUILT_ENGINES = ["codex-image", "media-still", "h3", "h3-from-still"];
const FORM_VALUES = ["ok", "untested", "unavailable"];
const STATUS_RANK = { accepted: 0, sampled: 1, candidate: 2, dormant: 3 };

// ---------- frontmatter: one key per line; values are scalars, [a, b] lists or {k: v} maps ----------
function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}
function splitTop(s) { // split on commas outside quotes
  const out = []; let cur = "", q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === ",") { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
function parseValue(v) {
  v = v.trim();
  if (v.startsWith("[") && v.endsWith("]")) return splitTop(v.slice(1, -1)).map(unquote);
  if (v.startsWith("{") && v.endsWith("}")) {
    const m = {};
    for (const part of splitTop(v.slice(1, -1))) {
      const i = part.indexOf(":");
      if (i < 0) throw new Error(`map entry without a colon: ${part}`);
      m[unquote(part.slice(0, i))] = unquote(part.slice(i + 1));
    }
    return m;
  }
  return unquote(v);
}
export function parseRecipe(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("no frontmatter block");
  const fm = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    if (i < 0) throw new Error(`frontmatter line without a key: ${line}`);
    const k = line.slice(0, i).trim();
    if (k in fm) throw new Error(`key repeated: ${k}`);
    fm[k] = parseValue(line.slice(i + 1));
  }
  const body = m[2];
  const pm = body.match(/##\s*Prompt\s*\n([\s\S]*?)(?=\n##\s|$)/);
  return { fm, body, prompt: pm ? pm[1].trim() : "" };
}

// ---------- the content rules ----------
const NEG = /\b(no|not|never|without|avoid|free of|zero|nor|none|neither)\b/i;
function negated(text, idx) {
  const before = text.slice(Math.max(0, idx - 40), idx);
  const clause = before.split(/[.;:!?]/).pop();
  return NEG.test(clause);
}
function hits(text, re) { // non-negated matches
  const out = [];
  for (const m of text.matchAll(re)) if (!negated(text, m.index)) out.push(m[0]);
  return out;
}
const ALWAYS_LETTERING = /\b(text|caption|sign|banner) (that|which) (says|reads)\b|\breads ["“']|\bsays ["“']|\bwith the (words|slogan|headline|tagline)\b/i;
const LETTERING = /\b(text|caption|headline|slogan|tagline|lettering|typography|letters|words|title|logos?)\b/gi;
const AUDIO = /\b(music|musical|soundtrack|song|songs|beat|beats|melody|jingle|voice-?over|narration|audio|sound effects?|sfx|ambient sound)\b/gi;
const ISLAMIC = /\b(alcohol(?!-free)|wine|beer|cocktails?|whisk(?:e)?y|vodka|champagne|liquor|bar counter|casino|gambling|betting|bets?|slot machines?|poker|roulette|lingerie|bikinis?|swimsuits?|underwear|nude|naked|sexy|seductive|sensual|flirt\w*|cleavage|kiss\w*|dating)\b/gi;
const PEOPLE = /\b(people|person|persons|passers-by|passersby|pedestrians?|crowds?|man|men|woman|women|girls?|boys?|child|children|kids?|models?|customers?|shoppers?|families|family|couples?|hands?|someone)\b/gi;
const WOMEN = /\b(woman|women|girls?|ladies|lady)\b/gi;
const CHILD = /\b(child|children|kids?|boys?|baby|babies|toddlers?)\b/gi;
const CAST_PHRASE = /\b(adult men|elderly women|our own cast|house cast|no people|no person)\b/i;
const AGENT = /ignore (all|any|previous|prior)|system prompt|you are (an? )?(ai|assistant|language model)|https?:\/\/|www\.|<script|```/i;

export function lintRecipe(file, text, ctx) {
  const errs = [];
  const name0 = file.replace(/\.md$/, "");
  const e = (msg) => errs.push(`${name0}: ${msg}`);
  if (Buffer.byteLength(text) > MAX_FILE) e(`file is ${Buffer.byteLength(text)} bytes, over ${MAX_FILE}`);
  let r;
  try { r = parseRecipe(text); } catch (err) { e(`frontmatter: ${err.message}`); return errs; }
  const { fm, prompt } = r;
  for (const k of REQUIRED) if (!(k in fm)) e(`missing field ${k}`);
  if (fm.name !== undefined) {
    if (!/^[a-z0-9]{3,24}$/.test(fm.name)) e(`name "${fm.name}" must match [a-z0-9]{3,24}`);
    if (fm.name !== name0) e(`name "${fm.name}" differs from the file name`);
  }
  for (const [k, vals] of Object.entries(ENUMS)) if (fm[k] !== undefined && !vals.includes(fm[k])) e(`${k} "${fm[k]}" not in ${vals.join("|")}`);
  for (const k of ["aliases", "inputs", "composes_with", "conflicts", "samples"]) if (fm[k] !== undefined && !Array.isArray(fm[k])) e(`${k} must be a [list]`);
  for (const k of ["slots", "forms"]) if (fm[k] !== undefined && (typeof fm[k] !== "object" || Array.isArray(fm[k]))) e(`${k} must be a {map}`);
  if (Array.isArray(fm.aliases)) for (const a of fm.aliases) if (!/^[a-z0-9çğıöşü-]{2,30}$/.test(a)) e(`alias "${a}" is not a plain lowercase word`);
  if (Array.isArray(fm.inputs)) for (const i of fm.inputs) if (!INPUTS.includes(i)) e(`input "${i}" not in ${INPUTS.join("|")}`);
  if (fm.forms && typeof fm.forms === "object") {
    if (!Object.keys(fm.forms).length) e("forms is empty");
    for (const [f, v] of Object.entries(fm.forms)) {
      if (!/^[a-z0-9-]+$/.test(f)) e(`form "${f}" is not a plain engine name`);
      if (!FORM_VALUES.includes(v)) e(`form ${f}: "${v}" not in ${FORM_VALUES.join("|")}`);
      else if (v !== "unavailable" && !BUILT_ENGINES.includes(f)) e(`form ${f}: not built today — only ${BUILT_ENGINES.join(", ")} may be ${v}; mark it unavailable`);
    }
  }
  if (!/^\d+$/.test(String(fm.version ?? ""))) e("version must be an integer");
  if (fm.provenance !== undefined && !String(fm.provenance).trim()) e("provenance is empty");
  // slots: declared ↔ used
  const slots = fm.slots && typeof fm.slots === "object" ? fm.slots : {};
  for (const [s, opts] of Object.entries(slots)) {
    if (!/^[a-z_]+$/.test(s)) e(`slot "${s}" is not a plain name`);
    if (!String(opts).split("|").every((o) => o.trim())) e(`slot ${s} has an empty option`);
  }
  const used = new Set([...prompt.matchAll(/\{([a-z_]+)\}/g)].map((m) => m[1]));
  for (const u of used) if (!(u in slots)) e(`prompt uses {${u}}, which is not a declared slot`);
  if (fm.role === "base") for (const s of Object.keys(slots)) if (!used.has(s)) e(`slot ${s} is declared but never used`);
  if (fm.fills !== undefined && (typeof fm.fills !== "object" || Array.isArray(fm.fills))) e("fills must be a {map}");
  // accepted only with his registered approval
  if (fm.status === "accepted") {
    if (!fm.accepted_by) e("status accepted needs accepted_by (his ceo-approvals.json id)");
    else if (!ctx.approvals.has(fm.accepted_by)) e(`accepted_by "${fm.accepted_by}" is not in ceo-approvals.json`);
  }
  // the prompt's content
  if (!prompt) e("no ## Prompt section");
  const p = prompt.replace(/\{[a-z_]+\}/g, "X");
  if (ALWAYS_LETTERING.test(p)) e("asks the engine to write lettering (rule f: the mark comes from the real file, in post)");
  const lt = hits(p, LETTERING);
  if (lt.length) e(`lettering asked of the engine: ${[...new Set(lt)].join(", ")} (negate it, or lay it in post)`);
  const au = [...p.matchAll(AUDIO)].map((m) => m[0]);
  if (au.length) e(`audio instruction (${[...new Set(au)].join(", ")}): recipes carry none; music in client work waits for his ruling`);
  const is = hits(p, ISLAMIC);
  if (is.length) e(`Islamic boundary: ${[...new Set(is)].join(", ")}`);
  const ppl = hits(p, PEOPLE);
  if (ppl.length && !CAST_PHRASE.test(p)) e(`people (${[...new Set(ppl)].join(", ")}) without the house cast phrasing (adult men / elderly women / our own cast)`);
  if (fm.cast !== "client-request") {
    const w = [];
    for (const m of p.matchAll(WOMEN)) if (!negated(p, m.index) && !/elderly\s+$/i.test(p.slice(Math.max(0, m.index - 9), m.index))) w.push(m[0]);
    if (w.length) e(`women other than elderly women need cast: client-request (rule g): ${[...new Set(w)].join(", ")}`);
  }
  const ch = hits(p, CHILD);
  if (ch.length) e(`children are outside the house cast: ${[...new Set(ch)].join(", ")}`);
  if (AGENT.test(r.body)) e("agent-directed text, a link or code in the recipe");
  return errs;
}

function loadApprovals(path) {
  try { return new Set(Object.keys(JSON.parse(readFileSync(path, "utf8")))); } catch { return new Set(); }
}
function recipeFiles(dir) {
  const s = join(dir, "s");
  return existsSync(s) ? readdirSync(s).filter((f) => f.endsWith(".md")).sort() : [];
}
export function loadAll(dir) {
  const out = new Map();
  for (const f of recipeFiles(dir)) {
    try { out.set(f.replace(/\.md$/, ""), parseRecipe(readFileSync(join(dir, "s", f), "utf8"))); } catch { /* lint reports it */ }
  }
  return out;
}

export function lintDir(dir, { approvalsPath = APPROVALS } = {}) {
  const ctx = { approvals: loadApprovals(approvalsPath) };
  const errors = [];
  const files = recipeFiles(dir);
  for (const f of files) errors.push(...lintRecipe(f, readFileSync(join(dir, "s", f), "utf8"), ctx));
  // cross-file: names and aliases unique; references exist
  const all = loadAll(dir);
  const owner = new Map();
  for (const [n, { fm }] of all) {
    for (const w of [fm.name, ...(Array.isArray(fm.aliases) ? fm.aliases : [])]) {
      if (owner.has(w) && owner.get(w) !== n) errors.push(`${n}: "${w}" is already taken by ${owner.get(w)}`);
      else owner.set(w, n);
    }
  }
  for (const [n, { fm }] of all) {
    for (const k of ["composes_with", "conflicts"]) for (const ref of Array.isArray(fm[k]) ? fm[k] : []) {
      if (!all.has(ref)) errors.push(`${n}: ${k} names "${ref}", which is not in the cupboard`);
    }
  }
  return { count: files.length, errors };
}

// ---------- index ----------
function cell(s, max) {
  s = String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
export function indexDir(dir) {
  const all = loadAll(dir);
  const shelves = new Map();
  for (const [n, r] of all) {
    const sh = r.fm.shelf || "unshelved";
    if (!shelves.has(sh)) shelves.set(sh, []);
    shelves.get(sh).push({ n, ...r.fm });
  }
  const idx = join(dir, "index");
  rmSync(idx, { recursive: true, force: true });
  mkdirSync(idx, { recursive: true });
  const head = "| name | role | medium | inputs | status | when |\n|---|---|---|---|---|---|\n";
  const summary = [];
  for (const [sh, rows] of [...shelves].sort(([a], [b]) => a.localeCompare(b))) {
    rows.sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || a.n.localeCompare(b.n));
    const pages = [];
    let cur = [];
    const pageText = (rs) => `# ${sh}\n\n${head}${rs.join("\n")}\n`;
    for (const r of rows) {
      const line = `| \`${r.n}\` | ${r.role} | ${r.medium} | ${cell((r.inputs || []).join(" "), 30)} | ${r.status} | ${cell(r.when_tr, 70)} |`;
      if (cur.length >= PAGE_ROWS || Buffer.byteLength(pageText([...cur, line])) > MAX_PAGE) { pages.push(cur); cur = []; }
      cur.push(line);
    }
    if (cur.length) pages.push(cur);
    pages.forEach((rs, i) => writeFileSync(join(idx, `${sh}-${i + 1}.md`), pageText(rs)));
    const count = (st) => rows.filter((r) => r.status === st).length;
    summary.push(`| ${sh} | ${rows.length} | ${count("accepted")} | ${count("sampled")} | ${count("candidate")} | ${pages.map((_, i) => `index/${sh}-${i + 1}.md`).join(" ")} |`);
  }
  let index = "# Kisayol — the cupboard\n\nRead one or two shelf pages, then the recipe files they name (`s/<name>.md`).\n\n" +
    "| shelf | recipes | accepted | sampled | candidate | pages |\n|---|---|---|---|---|---|\n" + summary.join("\n") + "\n";
  if (Buffer.byteLength(index) > MAX_INDEX) {
    index = "# Kisayol — the cupboard\n\n| shelf | recipes | pages |\n|---|---|---|\n" +
      summary.map((l) => { const c = l.split("|").map((x) => x.trim()); return `| ${c[1]} | ${c[2]} | index/${c[1]}-1.md… |`; }).join("\n") + "\n";
  }
  if (Buffer.byteLength(index) > MAX_INDEX) throw new Error(`INDEX.md would be ${Buffer.byteLength(index)} bytes, over ${MAX_INDEX}: too many shelves`);
  writeFileSync(join(dir, "INDEX.md"), index);
  const h = createHash("sha256");
  for (const f of recipeFiles(dir)) { h.update(f); h.update(readFileSync(join(dir, "s", f))); }
  const hash = h.digest("hex");
  writeFileSync(join(dir, "RELEASE.txt"), `recipes ${all.size}\nsha256 ${hash}\n`);
  return { recipes: all.size, shelves: shelves.size, hash };
}

// ---------- build ----------
const CONSTRAINTS = "Constraints: the product exactly as in the attached photo — shape, proportions, colours, materials and its own label; add no text, letters or logos anywhere (the client's mark is laid in post from the real file); any people only adult men or elderly women from our own cast, faces not readable unless the job supplies a cast photo.";
export function buildRecipe(dir, spec, slotArgs = {}) {
  const all = loadAll(dir);
  const [baseName, ...mods] = spec.split("+").map((s) => s.trim()).filter(Boolean);
  const base = all.get(baseName);
  if (!base) throw new Error(`no recipe "${baseName}"`);
  if (base.fm.role !== "base") throw new Error(`"${baseName}" is a ${base.fm.role}, not a base`);
  const slots = base.fm.slots || {};
  const chosen = {};
  const allowed = (s) => String(slots[s]).split("|").map((x) => x.trim());
  // "*" = a free slot, filled from the brief (his word 2026-11-08: the client's market decides —
  // its people, setting and occasion); a free slot with no other option is required.
  const fits = (s, v) => (allowed(s).includes("*") ? String(v).trim() !== "" : allowed(s).includes(v));
  for (const [k, v] of Object.entries(slotArgs)) {
    if (!(k in slots)) throw new Error(`slot "${k}" is not declared by ${baseName}`);
    if (!fits(k, v)) throw new Error(`slot ${k}: "${v}" not in ${allowed(k).join("|")}`);
    chosen[k] = v;
  }
  const parts = [];
  const roles = new Set();
  for (const m of mods) {
    const mod = all.get(m);
    if (!mod) throw new Error(`no recipe "${m}"`);
    if (mod.fm.role === "base") throw new Error(`"${m}" is a base; one base per recipe`);
    if (roles.has(mod.fm.role)) throw new Error(`${m}: one ${mod.fm.role} per recipe — two would contradict each other`);
    roles.add(mod.fm.role);
    const c1 = (base.fm.conflicts || []).includes(m) || (mod.fm.conflicts || []).includes(baseName);
    if (c1) throw new Error(`${baseName} and ${m} conflict; they never stack`);
    const ok = (base.fm.composes_with || []).includes(m) || (mod.fm.composes_with || []).includes(baseName);
    if (!ok) throw new Error(`${m} is not listed to stack with ${baseName}`);
    for (const other of mods) if (other !== m && (mod.fm.conflicts || []).includes(other)) throw new Error(`${m} and ${other} conflict`);
    for (const [k, v] of Object.entries(mod.fm.fills || {})) {
      if (!(k in slots)) throw new Error(`${m} fills "${k}", which ${baseName} does not declare`);
      if (!fits(k, v)) throw new Error(`${m} fills ${k}="${v}", not allowed by ${baseName} (${allowed(k).join("|")})`);
      if (chosen[k] && chosen[k] !== v) throw new Error(`${m} wants ${k}="${v}" but ${k}="${chosen[k]}" is already set`);
      chosen[k] = v;
    }
    parts.push(mod.prompt);
  }
  for (const s of Object.keys(slots)) {
    if (chosen[s]) continue;
    const dflt = allowed(s).find((o) => o !== "*");
    if (dflt === undefined) throw new Error(`slot ${s} must be filled from the brief (--slot ${s}=…)`);
    chosen[s] = dflt;
  }
  const filled = base.prompt.replace(/\{([a-z_]+)\}/g, (_, s) => chosen[s]);
  return [CONSTRAINTS, filled, ...parts].join("\n\n");
}

// ---------- verdict ----------
const VHEAD = "date\tjob\trecipe\tvariant\tverdict\tform\tsample\twords";
export function appendVerdict(file, f) {
  if (!["1", "2", "3"].includes(String(f.variant))) throw new Error("variant must be 1, 2 or 3");
  if (!["yes", "no"].includes(f.verdict)) throw new Error("verdict must be yes or no");
  for (const k of ["job", "recipe", "form", "sample"]) if (!f[k]) throw new Error(`--${k} is required`);
  const clean = (s) => String(s ?? "").replace(/[\t\r\n]+/g, " ").trim();
  if (!existsSync(file) || statSync(file).size === 0) writeFileSync(file, VHEAD + "\n");
  const row = [new Date().toISOString(), f.job, f.recipe, f.variant, f.verdict, f.form, f.sample, f.words].map(clean).join("\t");
  appendFileSync(file, row + "\n");
  return row;
}

// ---------- render ----------
const CODEX = join(homedir(), ".local/bin/codex");
/** The codex exec argv for one still: the built prompt, the product photo as reference when given,
 *  and the instruction to save the generated image as <name>.png inside workdir. */
export function codexArgs(prompt, { ref, workdir, name }) {
  const ask = `Use your image generation tool to make exactly this image${ref ? " from the attached product photo" : ""}. ` +
    `Then save a copy of the generated image as ${name}.png in the current directory. Do nothing else.\n\n${prompt}`;
  const args = ["exec", "--skip-git-repo-check", "-C", workdir, "-s", "workspace-write"];
  // -i takes several paths: "--" ends the list, or it swallows the prompt (measured 2026-11-08)
  if (ref) args.push("-i", ref);
  args.push("--", ask);
  return args;
}
export function renderStill(dir, spec, slotArgs, { ref, out, timeoutMs = 300_000 }) {
  if (!out) throw new Error("render needs --out <file.png>");
  if (ref && !existsSync(ref)) throw new Error(`no reference photo at ${ref}`);
  const prompt = buildRecipe(dir, spec, slotArgs);
  const root = "/tmp/claude-1000/kisayol-render";
  mkdirSync(root, { recursive: true });
  const workdir = mkdtempSync(join(root, "r-"));
  const name = "kisayol-out";
  const r = spawnSync(CODEX, codexArgs(prompt, { ref: ref && resolve(ref), workdir, name }),
    { encoding: "utf8", timeout: timeoutMs, stdio: ["ignore", "pipe", "pipe"] });
  const made = join(workdir, `${name}.png`);
  if (!existsSync(made)) throw new Error(`codex made no image (exit ${r.status}${r.error ? ", " + r.error.message : ""}); its work dir: ${workdir}`);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  copyFileSync(made, resolve(out));
  return resolve(out);
}

// ---------- CLI ----------
function flags(argv) {
  const pos = [], fl = {}, slot = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slot") { const [k, ...v] = (argv[++i] || "").split("="); slot[k] = v.join("="); }
    else if (a.startsWith("--")) fl[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  return { pos, fl, slot };
}
function main(argv) {
  const [cmd, ...rest] = argv;
  const { pos, fl, slot } = flags(rest);
  const dir = fl.dir ? resolve(fl.dir) : SKILL_DIR;
  switch (cmd) {
    case "lint": {
      const r = lintDir(dir);
      for (const e of r.errors) console.log(e);
      console.log(`${r.count} recipes, ${r.errors.length} errors`);
      return r.errors.length ? 1 : 0;
    }
    case "index": {
      const r = indexDir(dir);
      console.log(`indexed ${r.recipes} recipes on ${r.shelves} shelves; sha256 ${r.hash}`);
      return 0;
    }
    case "build": {
      if (!pos[0]) { console.error("usage: build <base>[+<modifier>…] [--slot k=v …]"); return 2; }
      console.log(buildRecipe(dir, pos[0], slot));
      return 0;
    }
    case "ara": {
      const script = join(HERE, "quarry", "search.py");
      if (!existsSync(script)) { console.error("the raw store is not built yet (tools/studio-prompts/kisayol/quarry/)"); return 2; }
      const limit = Math.min(Number(fl.limit || 20), 20);
      const args = ["-I", script, pos.join(" "), "--limit", String(limit)];
      if (fl.lane) args.push("--lane", fl.lane);
      const r = spawnSync("python3", args, { encoding: "utf8" });
      process.stdout.write(r.stdout || ""); process.stderr.write(r.stderr || "");
      return r.status ?? 1;
    }
    case "render": {
      if (!pos[0]) { console.error("usage: render <base>[+mod…] [--slot k=v …] [--ref photo] --out file.png"); return 2; }
      console.log(renderStill(dir, pos[0], slot, { ref: fl.ref, out: fl.out }));
      return 0;
    }
    case "verdict": {
      console.log(appendVerdict(fl.file ? resolve(fl.file) : VERDICTS, fl));
      return 0;
    }
    default:
      console.error("usage: kisayol.mjs lint | index | build <base>[+mod…] [--slot k=v] | ara \"<query>\" [--lane L] [--limit N] | verdict --job J --recipe R --variant 1|2|3 --verdict yes|no --form F --sample PATH --words \"…\"");
      return 2;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exit(main(process.argv.slice(2))); } catch (err) { console.error(`kisayol: ${err.message}`); process.exit(1); }
}
