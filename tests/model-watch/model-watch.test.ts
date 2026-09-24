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
/** far enough past every fixture date that nothing in them is current */
const LATER = "2027-06-01";
const LINE = (n: number) => `--- MODEL WATCH: ${n === 1 ? "1 serious item waits" : `${n} serious items wait`} for him — python3 scripts/model-watch/model-watch.py --status ---`;
const WITH_ID = (id: string) => (p: string) => p.replace("<td class=\"border-t\">Claude API ID</td>", `<td>Claude API ID</td><td><button type="button">${id}</button></td>`);
/** Claude Code versions as the changelog page writes them, dated 2027-06-02 */
const VERSIONS = (...versions: [string, ...string[]][]) => (p: string) => p.replace("<body>", "<body>" + versions.map(([v, ...entries]) =>
  `<button data-component-part="update-label">${v}</button><div data-component-part="update-description">June 2, 2027</div><ul>${entries.map((e) => `<li>${e}</li>`).join("")}</ul>`).join(""));

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), "model-watch-"));
  tmp.push(dir);
  const home = join(dir, "home");
  const state = join(dir, "state");
  const asked = join(dir, "judge-prompt.txt");
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(join(home, ".claude", "settings.json"), JSON.stringify({ model: "claude-opus-5-5[1m]", advisorModel: "claude-fable-5-1" }));
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
    expect(counts).toEqual({ models: 4, docs: 4, "release-notes": 3, "claude-code": 2, engineering: 2 });
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
    const now = Math.floor(Date.now() / 1000);
    const ago = (days: number) => [String(now - days * 86400), new Date((now - days * 86400) * 1000).toISOString().slice(0, 10)];
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
});
