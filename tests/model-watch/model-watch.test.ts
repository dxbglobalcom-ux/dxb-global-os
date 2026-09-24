// THE MODEL WATCH (row B55, 2026-09-24) — offline, from fixtures, in a sandbox.
//
// His order for a newer model (ledger id model-watch-review-together-2026-09-24) begins with one
// step: TELL him. The same day he widened it to usage guidance, ruled that what he is shown must be
// current, and then that it must not swell the session: only what seriously affects how our models
// work reaches him, as ONE line, and Sonnet judges which. These cases pin that — a first run is
// silent; a new model id (a dated snapshot of a family we use included) is one line without the
// judge; "serious" is one line and "not serious" is nothing; a judge that fails shows nothing and is
// asked again; old, legacy-only and fixes-only items never reach the judge — and the ways a watch
// goes quiet: a failed read, one dead source, three days without a good read.
//
// The refuter's pass of the same day added the rest: a retirement notice of a model we use is news
// (A1); every release-notes bullet is read, a late one too (A2); the judge reads a version whole (A3);
// one new model is one piece of news (B1); the launch of a model we already run is not (B2); a judge
// that keeps failing is named (B3); removed, deprecated and changed are not fixes (B5); an --ack
// clears only what was shown (B6); a verdict for an item never asked about counts for nothing (B7).
//
// Every case gets its own HOME (a pinned model in its settings) and state directory, every source is
// a fixture, and the judge is a stand-in command (DXB_MODEL_WATCH_JUDGE) that keeps the prompt it was
// given and answers from a fixture: no network, no real judge, no real watch, no real settings.
//
//   npx vitest run tests/model-watch/model-watch.test.ts
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const SCRIPT = join(root, "scripts", "model-watch", "model-watch.py");
const HOOK = join(root, ".claude", "hooks", "spec-bootstrap.sh");
const FIX = join(root, "tests", "model-watch", "fixtures");
const TITLE = "=== DXB — WHERE THE WORK STANDS ===";
const CORE = "Always-on core: .claude/CLAUDE.md (authority order, the boundaries, the doors).";
const PAGES: Record<string, string> = {
  models: "models-overview.html",
  docs: "sitemap.xml",
  "release-notes": "release-notes.html",
  "claude-code": "claude-code-changelog.html",
  engineering: "engineering.html",
};
const SERIOUS = join(FIX, "judge-serious.json");
const NOT_SERIOUS = join(FIX, "judge-not-serious.json");
/** ten verdicts, every one serious — more than any case here asks for */
const ALL_SERIOUS = join(FIX, "judge-all-serious.json");
/** far enough past every fixture date that nothing in them is current */
const LATER = "2027-06-01";
const LINE = (n: number) => `--- MODEL WATCH: ${n === 1 ? "1 serious item waits" : `${n} serious items wait`} for him — python3 scripts/model-watch/model-watch.py --status ---`;
const WITH_ID = (id: string) => (p: string) => p.replace("<td class=\"border-t\">Claude API ID</td>", `<td>Claude API ID</td><td><button type="button">${id}</button></td>`);
/** Claude Code versions as the changelog page writes them, dated 2027-06-02 */
const VERSIONS = (...versions: [string, ...string[]][]) => (p: string) => p.replace("<body>", "<body>" + versions.map(([v, ...entries]) =>
  `<button data-component-part="update-label">${v}</button><div data-component-part="update-description">June 2, 2027</div><ul>${entries.map((e) => `<li>${e}</li>`).join("")}</ul>`).join(""));
/** release-notes bullets under one dated heading, June 2, 2027, as the page writes them */
const NOTES = (...bullets: string[]) => (p: string) => p.replace("<h1>Claude Platform release notes</h1>",
  `<h1>Claude Platform release notes</h1>\n<h3 id="june-2-2027" class="group scroll-mt-lg">June 2, 2027</h3>\n<ul>${bullets.map((b) => `<li>${b}</li>`).join("\n")}</ul>`);
/** [epoch, YYYY-MM-DD] of `days` days before now, as sources.tsv writes a last good read */
const ago = (days: number) => {
  const t = Math.floor(Date.now() / 1000) - days * 86400;
  return [String(t), new Date(t * 1000).toISOString().slice(0, 10)];
};

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

function sandbox(settings: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "model-watch-"));
  tmp.push(dir);
  const home = join(dir, "home");
  const state = join(dir, "state");
  const asked = join(dir, "judge-prompt.txt");
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(join(home, ".claude", "settings.json"), JSON.stringify({ model: "claude-opus-5-5[1m]", advisorModel: "claude-fable-5-1", ...settings }));
  /** the judge's stand-in keeps its prompt and answers from `answer`; without one it fails (never the real claude) */
  const judge = (answer?: string) => (answer ? `sh -c 'cat > "$0"; cat "$1"' '${asked}' '${answer}'` : "false");
  const env = { ...process.env, HOME: home, DXB_MODEL_WATCH_STATE: state };
  let edits = 0;
  /** a fixture as it is, or changed by `edit` and written into the sandbox */
  const page = (name: string, edit?: (s: string) => string) => {
    if (!edit) return `file://${join(FIX, PAGES[name])}`;
    const out = join(dir, `${name}-${++edits}`);
    writeFileSync(out, edit(readFileSync(join(FIX, PAGES[name]), "utf8")));
    return `file://${out}`;
  };
  const run = (...args: string[]) => spawnSync("python3", [SCRIPT, ...args], { env: { ...env, DXB_MODEL_WATCH_JUDGE: judge() }, encoding: "utf8" });
  /** one check, every source a fixture unless `over` names another page */
  const watch = (today: string, over: Record<string, string> = {}, answer?: string) => {
    const r = spawnSync("python3", [SCRIPT, "--today", today, ...Object.keys(PAGES).flatMap((n) => ["--source", `${n}=${over[n] ?? page(n)}`])],
      { env: { ...env, DXB_MODEL_WATCH_JUDGE: judge(answer) }, encoding: "utf8" });
    expect(r.status, r.stderr).toBe(0);
    return r.stdout;
  };
  const hook = () => execFileSync("bash", [HOOK], { cwd: root, env: { ...env, CLAUDE_PROJECT_DIR: root }, encoding: "utf8" }).split("\n");
  const read = (f: string) => readFileSync(join(state, f), "utf8");
  const json = (f: string) => JSON.parse(read(f));
  const has = (f: string) => existsSync(join(state, f));
  const prompt = () => (existsSync(asked) ? readFileSync(asked, "utf8") : "");
  return { state, page, run, watch, hook, read, json, has, prompt };
}

describe("the model watch tells him one line, and only what is serious", () => {
  it("a first run records every source and tells nobody when nothing is current", () => {
    const s = sandbox();
    s.watch(LATER);
    expect(Object.keys(s.json("seen.json").models).sort()).toEqual(["claude-fable-5-1", "claude-haiku-4-5-20251001", "claude-opus-5-5", "claude-sonnet-5"]);
    const counts = Object.fromEntries(Object.entries(s.json("last-check.json").sources).map(([n, r]: [string, any]) => [n, r.ok && r.count]));
    expect(counts).toEqual({ models: 4, docs: 4, "release-notes": 4, "claude-code": 2, engineering: 2 });   // release notes: one per bullet
    expect(s.json("last-check.json").judge).toBeNull();                 // nothing went to the judge
    expect(s.has("NOTICE.txt")).toBe(false);
    expect(s.hook()[1]).toBe(CORE);                                     // not one line added under the title
  });

  it("a new model id — a dated snapshot of a family we use too — is one line in the opening, without the judge", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { models: s.page("models", WITH_ID("claude-opus-5-5-20261001")) });
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
    expect(Buffer.byteLength(LINE(1))).toBeLessThanOrEqual(200);
    expect(s.prompt()).toBe("");                                        // the judge was not asked
    expect(s.hook().slice(0, 3)).toEqual([TITLE, LINE(1), CORE]);
    const status = s.run("--status").stdout;
    expect(status).toContain("NEW MODEL ID claude-opus-5-5-20261001 (first seen 2027-06-02");
    expect(status).toContain('The pinned model is claude-opus-5-5[1m]. His order (2026-09-24): review the model together with him first');
    expect(status).toContain('moves to it only when he says "geç". Clear with: python3 scripts/model-watch/model-watch.py --ack claude-opus-5-5-20261001');
  });

  it("--ack clears the model id, and the same page does not raise it again", () => {
    const s = sandbox();
    s.watch(LATER);
    const newer = s.page("models", WITH_ID("claude-opus-6"));
    s.watch("2027-06-02", { models: newer });
    expect(s.run("--ack", "claude-opus-7").status).toBe(1);             // not waiting: says so, clears nothing
    expect(s.has("NOTICE.txt")).toBe(true);
    expect(s.run("--ack", "claude-opus-6").status).toBe(0);
    expect(s.has("NOTICE.txt")).toBe(false);
    s.watch("2027-06-03", { models: newer });
    expect(s.has("NOTICE.txt")).toBe(false);
    expect(s.hook()[1]).toBe(CORE);
  });

  it("a read that fails, or finds no id, keeps what was seen, records it, and exits 0", () => {
    const s = sandbox();
    s.watch(LATER);
    const seen = s.read("seen.json");
    const good = s.json("last-check.json").sources.models;
    for (const bad of ["file:///nonexistent/models-overview.html", s.page("docs")]) {   // no page; a page without the id table
      s.watch("2027-06-02", { models: bad });
      const r = s.json("last-check.json").sources.models;
      expect(r).toMatchObject({ ok: false, count: 0, last_ok: good.last_ok, last_ok_epoch: good.last_ok_epoch });
      expect(r.error).toBeTruthy();
      expect(s.read("seen.json")).toBe(seen);
    }
    expect(s.read("watch.log").match(/FAILED models:/g)).toHaveLength(2);
  });

  it("an item the judge calls serious is one line; the judge was given our setup and the item", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"])) }, SERIOUS);
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
    expect(s.hook().slice(0, 3)).toEqual([TITLE, LINE(1), CORE]);
    const asked = s.prompt();
    expect(asked).toContain("Our setup: main model (Claude Code) claude-opus-5-5[1m]; advisor model claude-fable-5-1; seats: Opus 5.5 builds");
    expect(asked).toContain("or a new dated snapshot id of a family we use) is always serious");
    expect(asked).toContain("A new Claude Code release is NOT serious by itself");
    expect(asked).toContain('"title": "2.1.283: Added maxEffortLevel to cap the effort level"');
    const status = s.run("--status").stdout;
    expect(status).toContain("- claude-code (2027-06-02): 2.1.283: Added maxEffortLevel to cap the effort level — file://");
    expect(status).toContain("Kullandığımız modellerin çaba ayarını değiştiren yeni bir ayar getiriyor.");
  });

  it("what the judge calls not serious is recorded, never shown, and not asked again", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(["2.1.283", "Added a colour theme"])) }, NOT_SERIOUS);
    expect(s.has("NOTICE.txt")).toBe(false);
    expect(s.json("seen.json").judged).toMatchObject([{ source: "claude-code", key: "2.1.283", reason_tr: expect.stringContaining("Küçük bir özellik") }]);
    s.watch("2027-06-03", { "claude-code": s.page("claude-code", VERSIONS(["2.1.283", "Added a colour theme"])) });   // a failing judge, were it asked
    expect(s.read("watch.log")).not.toContain("JUDGE FAILED");
    expect(s.hook()[1]).toBe(CORE);
  });

  it("a judge that fails shows nothing, keeps the item, and is asked again the next run", () => {
    const s = sandbox();
    s.watch(LATER);
    const code = s.page("claude-code", VERSIONS(["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"]));
    s.watch("2027-06-02", { "claude-code": code });                    // the stand-in fails
    expect(s.has("NOTICE.txt")).toBe(false);
    expect(s.hook()[1]).toBe(CORE);
    expect(s.json("seen.json").pending.guidance).toMatchObject([{ key: "2.1.283", serious: null }]);
    expect(s.read("watch.log")).toMatch(/JUDGE FAILED: .* 1 item\(s\) stay unjudged, asked again next run/);
    s.watch("2027-06-03", { "claude-code": code }, SERIOUS);
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
  });

  it("a Claude Code version of fixes only never reaches the judge; one that adds something does, titled by what it adds", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(
      ["2.1.284", "Fixed the status line flickering", "Added the <code>/advisor</code> command"],
      ["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"],
      ["2.1.282", "Fixed a crash on startup", "Improved memory use in long sessions"])) }, NOT_SERIOUS);
    expect(s.prompt()).toContain('"title": "2.1.284: Added the /advisor command"');
    expect(s.prompt()).toContain('"title": "2.1.283: Added maxEffortLevel to cap the effort level"');
    expect(s.prompt()).not.toContain("2.1.282");
    expect(s.read("watch.log")).toMatch(/SKIPPED claude-code: 2\.1\.282: Fixed a crash on startup \(bug fixes, reliability or performance only\)/);
  });

  it("a first run sends what is current to the judge: dated items within 30 days, never old or legacy-only ones", () => {
    const s = sandbox();
    s.watch("2026-09-24", {}, NOT_SERIOUS);
    const asked = s.prompt();
    expect(asked).toContain("release-notes.html#september-22-2026");
    expect(asked).toContain('"title": "2.1.281: Added Claude apps gateway support');
    expect(asked).not.toContain("august-11-2026");                      // 44 days old: recorded, not judged
    expect(asked).not.toContain("2.1.200");                             // July: recorded, not judged
    expect(asked).not.toMatch(/Opus 4\.8|september-10-2026/);           // names only a legacy model
    expect(s.read("watch.log")).toMatch(/SKIPPED release-notes: Claude Opus 4\.8 .*names only legacy models: opus 4\.8/);
    expect(s.has("NOTICE.txt")).toBe(false);                            // judged not serious; model ids never tell at a first run
  });

  it("one guidance source failing does not stop the others, and is recorded for that source", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "release-notes": "file:///nonexistent/release-notes.html",
      "claude-code": s.page("claude-code", VERSIONS(["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"])) }, SERIOUS);
    const sources = s.json("last-check.json").sources;
    expect(Object.keys(sources).filter((n) => !sources[n].ok)).toEqual(["release-notes"]);
    expect(sources["release-notes"].error).toContain("No such file");
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
  });

  it("a source without a good read for three days is one line in the opening", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "release-notes": "file:///nonexistent/release-notes.html" });
    writeFileSync(join(s.state, "sources.tsv"), s.read("sources.tsv").split("\n").map((line) => {
      const f = line.split("\t");
      if (f[0] === "models") [f[2], f[3]] = ago(5);
      if (f[0] === "release-notes") [f[2], f[3]] = ago(4);
      if (f[0] === "docs") [f[2], f[3]] = ago(2);                         // two days: not yet
      return f.join("\t");
    }).join("\n"));
    const line = `--- MODEL WATCH: no good read of models, release-notes since ${ago(5)[1]} — python3 scripts/model-watch/model-watch.py --status ---`;
    expect(s.hook().slice(0, 3)).toEqual([TITLE, line, CORE]);
    expect(Buffer.byteLength(line)).toBeLessThanOrEqual(200);
  });

  it("A1: a model's retirement is not news for him — the judge is told so and it never reaches the opening; guidance that deprecates a setting still reaches the judge", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "release-notes": s.page("release-notes", NOTES(
      "The <code>thinking.budget_tokens</code> parameter is deprecated on Claude Opus 5.5; set <code>effort</code> instead.",
      "We've deprecated Claude Sonnet 5 (<code>claude-sonnet-5</code>); it will be retired on September 1, 2027.")) }, SERIOUS);
    const asked = s.prompt();
    expect(asked).toContain("The retirement or deprecation of a model — a notice that a model is deprecated, retired or will be — is NOT serious.");
    expect(asked).not.toContain("the retirement or deprecation of a model we use;");
    expect(asked).toContain('"title": "The thinking.budget_tokens parameter is deprecated on Claude Opus 5.5; set effort instead."');
    expect(asked).toContain("We've deprecated Claude Sonnet 5 (claude-sonnet-5)");   // no word decides before the judge
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);                   // the judge, as told, keeps the guidance only
    expect(s.run("--status").stdout).toMatch(/waiting for him: 1\n {2}- release-notes \(2027-06-02\): The thinking\.budget_tokens parameter is deprecated/);
    expect(s.json("seen.json").judged).toMatchObject([{ title: expect.stringContaining("We've deprecated Claude Sonnet 5") }]);
  });

  it("A2: every bullet under a date reaches the judge, and one added later under the same date is read, the others not again", () => {
    const s = sandbox();
    s.watch(LATER);
    const effort = "On Claude Opus 5.5, the <code>effort</code> parameter now defaults to <code>high</code>.";
    const batch = "Message Batches now accept 200,000 requests per batch.";
    s.watch("2027-06-02", { "release-notes": s.page("release-notes", NOTES(effort, batch)) }, NOT_SERIOUS);
    expect(s.prompt()).toContain('"title": "On Claude Opus 5.5, the effort parameter now defaults to high."');
    expect(s.prompt()).toContain('"title": "Message Batches now accept 200,000 requests per batch."');
    s.watch("2027-06-03", { "release-notes": s.page("release-notes", NOTES("Prompt cache reads on Claude Opus 5.5 now cost $0.10 per MTok.", effort, batch)) }, NOT_SERIOUS);
    expect(s.prompt()).toContain('"title": "Prompt cache reads on Claude Opus 5.5 now cost $0.10 per MTok."');
    expect(s.prompt()).not.toMatch(/effort parameter|Message Batches/);
  });

  it("A3: the judge reads every usable entry of a Claude Code version, however long the version", () => {
    const s = sandbox();
    s.watch(LATER);
    const filler = Array.from({ length: 8 }, (_, i) => `Added small thing number ${i + 1} to the ${"status line ".repeat(5)}`);
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(
      ["2.1.290", ...filler, "Changed <code>CLAUDE_CODE_SUBAGENT_MODEL</code> to apply to every subagent"])) }, NOT_SERIOUS);
    expect(filler.join(" · ").length).toBeGreaterThan(400);             // past the old 400-character excerpt
    expect(s.prompt()).toContain("Changed CLAUDE_CODE_SUBAGENT_MODEL to apply to every subagent");
  });

  it("B1: a new model, its release note and its changelog entry are one piece of news, cleared as one", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", {
      models: s.page("models", WITH_ID("claude-opus-5-6")),
      "release-notes": s.page("release-notes", NOTES("We've launched Claude Opus 5.6 (<code>claude-opus-5-6</code>), our most capable model.")),
      "claude-code": s.page("claude-code", VERSIONS(["2.1.300", "Added Claude Opus 5.6 (claude-opus-5-6), now the default Opus model"])),
    }, ALL_SERIOUS);
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
    const status = s.run("--status").stdout;
    expect(status).toContain("waiting for him: 1\n");
    expect(status).toMatch(/NEW MODEL ID claude-opus-5-6 .* it clears the 2 item\(s\) below, told with it\n {6}- release-notes \(2027-06-02\): We've launched Claude Opus 5\.6/);
    expect(s.run("--ack", "claude-opus-5-6").stdout).toContain("cleared claude-opus-5-6 and the 2 item(s) --status showed with it");
    expect(s.has("NOTICE.txt")).toBe(false);
  });

  it("B2: the launch of a model we already run — the advisor's alias \"fable\" included — never reaches the judge; one we do not run does", () => {
    const s = sandbox({ advisorModel: "fable" });                      // as ~/.claude/settings.json holds it on 2026-09-24
    s.watch(LATER);
    s.watch("2027-06-02", {
      "release-notes": s.page("release-notes", NOTES(
        "We've launched Claude Opus 5.5 (<code>claude-opus-5-5</code>), a model for long-running agentic coding.",
        "We've launched Claude Opus 5.6 (<code>claude-opus-5-6</code>), our most capable model.")),
      "claude-code": s.page("claude-code", VERSIONS(
        ["2.1.300", "Added Claude Fable 5.1 (claude-fable-5-1), now the default Fable model"],
        ["2.1.299", "Added Claude Opus 5.5 (claude-opus-5-5), now the default Opus model", "Added <code>maxEffortLevel</code> to cap the effort level"])),
    }, ALL_SERIOUS);
    const asked = s.prompt();
    expect(asked).toContain("The model ids we already run: claude-fable-5-1, claude-opus-5-5, claude-sonnet-5.");
    expect(asked).toContain("The launch of a model we ALREADY run (its id is in the list of ids we run, above) is NOT news");
    expect(asked).toContain('"title": "We\'ve launched Claude Opus 5.6 (claude-opus-5-6), our most capable model."');
    expect(asked).toContain('"title": "2.1.299: Added maxEffortLevel to cap the effort level"');
    expect(asked).not.toMatch(/launched Claude Opus 5\.5|Added Claude (Opus 5\.5|Fable 5\.1)/);
    expect(s.read("watch.log")).toMatch(/SKIPPED claude-code: 2\.1\.300: .*\(the launch of a model we already run: claude-fable-5-1\)/);
    expect(s.read("NOTICE.txt")).toBe(`${LINE(2)}\n`);                  // everything judged serious: Opus 5.6 and 2.1.299 wait
  });

  it("B3: a judge that leaves items unjudged for three days is one line in the opening, like a source", () => {
    const s = sandbox();
    s.watch(LATER);                                                      // nothing to judge: the judge is clear
    const row = () => s.read("sources.tsv").split("\n").find((l) => l.startsWith("judge\t"));
    expect(row()).toMatch(/^judge\tthe Sonnet judge\t\d+\t\d{4}-\d{2}-\d{2}\tnothing waits unjudged$/);
    const [epoch, day] = ago(4);
    writeFileSync(join(s.state, "last-check.json"), JSON.stringify({ ...s.json("last-check.json"), judge_clear: { last_ok: `${day}T09:00:00+00:00`, last_ok_epoch: Number(epoch) } }));
    const code = s.page("claude-code", VERSIONS(["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"]));
    s.watch("2027-06-02", { "claude-code": code });                     // the stand-in fails: the item waits unjudged
    expect(row()).toContain(`judge\tthe Sonnet judge\t${epoch}\t${day}\t1 item(s) wait unjudged: exit 1`);
    expect(s.hook().slice(0, 3)).toEqual([TITLE, `--- MODEL WATCH: no good read of judge since ${day} — python3 scripts/model-watch/model-watch.py --status ---`, CORE]);
    s.watch("2027-06-03", { "claude-code": code }, SERIOUS);             // it answers: its line goes, the item is told
    expect(s.hook().slice(0, 3)).toEqual([TITLE, LINE(1), CORE]);
    writeFileSync(join(s.state, "sources.tsv"), s.read("sources.tsv").replace(/\t\d+\t\d{4}-\d{2}-\d{2}\t/g, "\t0\tnever\t"));
    expect(Buffer.byteLength(s.hook()[2])).toBeLessThanOrEqual(200);    // every source and the judge at once: still one short line
    expect(s.hook()[2]).toContain("no good read of models, docs, release-notes, claude-code, engineering, judge since never");
  });

  it("B5: a version that removes, deprecates or changes something reaches the judge", () => {
    const s = sandbox();
    s.watch(LATER);
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(
      ["2.1.303", "Changed subagents to inherit the main session's effort level"],
      ["2.1.302", "Deprecated the advisor tool; it will be removed in 2.2"],
      ["2.1.301", "Removed the max effort level for Opus models; xhigh is now the highest"])) }, NOT_SERIOUS);
    for (const t of ["2.1.303: Changed subagents", "2.1.302: Deprecated the advisor tool", "2.1.301: Removed the max effort level"]) {
      expect(s.prompt()).toContain(`"title": "${t}`);
    }
    expect(s.read("watch.log")).not.toContain("SKIPPED");
  });

  it("B6: --ack-guidance clears only what --status showed; what arrived after it stays", () => {
    const s = sandbox();
    s.watch(LATER);
    expect(s.run("--ack-guidance").status).toBe(1);                      // --status has not run: nothing is cleared
    const one = ["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"] as [string, string];
    s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(one)) }, SERIOUS);
    expect(s.run("--status").stdout).toContain("waiting for him: 1\n");
    s.watch("2027-06-03", { "claude-code": s.page("claude-code", VERSIONS(["2.1.284", "Added the <code>/advisor</code> command"], one)) }, SERIOUS);
    expect(s.read("NOTICE.txt")).toBe(`${LINE(2)}\n`);
    expect(s.run("--ack-guidance").stdout).toContain("cleared 1 serious guidance item(s) that --status showed");
    expect(s.read("NOTICE.txt")).toBe(`${LINE(1)}\n`);
    expect(s.json("seen.json").pending.guidance).toMatchObject([{ key: "2.1.284", serious: true }]);
  });

  it("B7: verdicts for items the judge was not asked about count for nothing", () => {
    const s = sandbox();
    s.watch(LATER);
    const out = s.watch("2027-06-02", { "claude-code": s.page("claude-code", VERSIONS(
      ["2.1.284", "Added the <code>/advisor</code> command"], ["2.1.283", "Added <code>maxEffortLevel</code> to cap the effort level"])) }, ALL_SERIOUS);
    expect(out).toContain("judge: ok — 2 item(s), 2 serious");            // ten verdicts came back, for two items
    expect(s.read("watch.log")).toMatch(/JUDGE ok: 2 item\(s\), 2 serious/);
  });
});
