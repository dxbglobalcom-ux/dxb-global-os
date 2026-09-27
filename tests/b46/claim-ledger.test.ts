// B56 K2 — EVERY CLAIM STANDS ON ROWS THE MACHINE COUNTED, AND THE WRITER IS HANDED ONLY WHAT THE LEDGER ADMITS.
//
// WHY. The K1 answer of 2026-09-26 cited 150 ids on 49 lines, and nothing could say how many people
// stood behind a line: its line 66 cites six authors, five of them in one Reddit thread. 12 of the 150
// were addresses a hunter had read and judged `none` — L1071, "benchmark/promo, no user preference", on
// line 71 — cited because fleet.sh handed the writer every relevant row. The contract
// (EVIDENCE-B56-K2-2026-09-26.md §2.1–2.2) gives the ledger one admissibility rule (evidence.py
// `admissible`, `writer-rows`) and every line that cites a claim row (scripts/claims.py): its admitted
// rows, their independent sources, its counter-evidence, the claim rounds' sending and their links.
//
// Every case runs the REAL scripts — rlib.py on two wall pages, fetch.py in an engine copy (makeBench) with
// a stand-in scrapling first on PATH, claims.py and evidence.py on a fresh copy of fixtures/claims/run:
// 40 rows cut byte for byte from the kept K1 run's evidence.jsonl — the rows the
// answer cites and their address rows, L1480 (t.co → every.to, whose passage is the site's menu) with
// its 26,040-byte body, L0115 (a GitHub issue page, irrelevant) with its 9,421-byte body, L0505
// (irrelevant), and L0429, the one row not byte for byte: its verdict is
// removed, because no relevant row of the K1 run is unjudged — and answer.md: 18 lines of the K1 answer
// verbatim (its lines 1, 5, 7, 8, 14, 20, 22, 23, 27, 32, 36, 42–44, 64, 66, 69, 71) and the blank lines
// between them, 26 in all — six claims with rows to counter, so the cap of five holds one. tracxn-login.txt
// is the K1 run's L0868 body, Tracxn's login shell; reddit-quotes-the-challenge.txt a K1 Reddit post that
// quotes Cloudflare's "prove your humanity" inside a sentence. juejin-L0162.jsonl and .txt are the K1 run's
// L0162 row and its 10,888-byte body, byte for byte: a juejin page whose title line is not chrome and whose
// menu stands under it. answer-unused.md is that answer's first 25 lines (K1's line 71 left out, so four
// admitted addresses are cited nowhere) and a `## Alınmayan kanıt` section naming them — the writer's last
// section (fleet/writer-prompt.md rule 10, the CEO's word of 2026-09-26 ~19:45). No network, no model.
//
// B56 K3 STAGE 3 — THE AUDITOR (scripts/audit.py): an Opus that never saw the writer is handed each claim of the answer
// with only its own rows, as the writer saw them, and says ok, corrected (its own line) or removed; `apply` rewrites the
// answer, `check` proves the ledger extracted again stands on the record. Its cases run on the same fixture run, the
// model's answers kept in fixtures/audit/rules/ (FAKE_AUDIT): batch 1 as the model's bare text, batch 2 as claude's
// envelope — fenced, one claim missing — and that claim's retry.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACCESS_DENIED, type Bench, DEAD_HIDDEN_PORT, SKILL, makeBench } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "claims");
const CLAIMS = join(SKILL, "scripts", "claims.py");
const EVIDENCE = join(SKILL, "scripts", "evidence.py");
const RLIB = join(SKILL, "scripts", "rlib.py");
// a constructed page: the two runs under var/research/runs carry the words only in a Reddit post quoting them
const HUMANITY = "Prove your humanity\n\nComplete the security check below to continue to the page you asked for. " +
  "This check makes sure you are a person and not an automated program.\n";
// fetch.py's two scrapling doors call `scrapling extract get|stealthy-fetch <url> <out>`; this one logs
// every call; `get` answers DXB_SCRAPLING_BODY when it is set, else nothing, so the second door is reached
const SCRAPLING = `#!/bin/sh
printf '%s\\n' "$*" >> "$DXB_SCRAPLING_LOG"
if [ "$2" = "get" ]; then [ -n "$DXB_SCRAPLING_BODY" ] && cat "$DXB_SCRAPLING_BODY" > "$4"; exit 0; fi
for i in 1 2 3 4 5 6 7 8; do echo "Paragraph $i of the page the stand-in scrapling read, in words a reader keeps."; done > "$4"
`;
// evidence.py's readers reach `opencli` through the skill's own door, which hands a stand-in straight through
const OPENCLI = `#!/bin/sh
[ -n "$DXB_STUB_OUT" ] && cat "$DXB_STUB_OUT"
exit 0
`;
// L0434's post (the K1 run's twitter.raw, 2026-09-20): a 14-word first line, then a 48-word paragraph
const X_POST = `- author: BrianRoemmele
  created_at: 2026-09-20
  text: |
    A Robot Stabbing A Doll: It Is Not a Mystery. It Is a Receipt.

    On September 18, 2026, Robocurve published *RoboHarm: Do Frontier Robot Policies Refuse Unsafe Instructions?* Five fixed instructions. Three frontier policies. Two real I2RT YAM arms. Three cameras. Twenty trials each. The tasks were not puzzles. They were harms with a safe object sitting next to the dangerous one.
`;
// L0506's post (the K1 run's twitter.raw, 2026-09-19): three short lines and a t.co link, no menu line
const X_POST_L0506 = `- author: polymarketjapan
  created_at: 2026-09-19
  text: |-
    【話題】GPT-6 Astraで動くロボット、危険な命令をほぼ拒否せず

    ・赤ちゃん人形を刺すなど、5種類の危険行為を100回テスト
    ・97回で実行しようと動き、60回で実際に完遂
    ・Fable 5.1では80回動き、34回完遂
    https://t.co/0bZEtGWDaZ
`;

let root = "";
let bin = "";
let n = 0;
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "dxb-k2-claims-"));
  bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "opencli"), OPENCLI);
  chmodSync(join(bin, "opencli"), 0o755);
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

function fresh(): string {
  const run = join(root, `run-${n++}`);
  cpSync(join(FIX, "run"), run, { recursive: true });
  return run;
}
function py(script: string, args: string[], env: Record<string, string> = {}) {
  const r = spawnSync("python3", [script, ...args], {
    encoding: "utf8", timeout: 120_000,
    env: { ...process.env, ...env, PATH: `${bin}:${process.env.PATH}`, DXB_HIDDEN_PORT: DEAD_HIDDEN_PORT,
      PYTHONDONTWRITEBYTECODE: "1" },
  });
  return { out: r.stdout ?? "", err: r.stderr ?? "", code: r.status ?? 1 };
}
const cl = (args: string[]) => py(CLAIMS, args);
const ev = (args: string[], env: Record<string, string> = {}) => py(EVIDENCE, args, env);
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const jsonl = (p: string): Record<string, any>[] =>
  readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const claim = (run: string, id: string, file = "claims.jsonl") => jsonl(join(run, file)).find((c) => c.id === id)!;
const row = (run: string, id: string) => jsonl(join(run, "evidence.jsonl")).find((r) => r.id === id)!;
const last = (out: string) => out.trim().split("\n").at(-1);

/** extract, then the counter round's sending: five of the six counter claims, the sixth held by the cap */
function sent(): string {
  const run = fresh();
  cl(["extract", run]);
  cl(["list", run, "--todo", "counter", "--cap", "5", "--candidates", "3"]);
  return run;
}
/** the five sent claims checked: three with a counter row linked, two with none found */
function checked(): string {
  const run = sent();
  cl(["link", run, "--claim", "C001", "--against", "L1721", "--by", "karsi"]);
  cl(["link", run, "--claim", "C008", "--against", "L1723,L1724", "--by", "karsi"]);
  cl(["link", run, "--claim", "C004", "--against", "L1720", "--by", "karsi"]);
  for (const c of ["C002", "C003"]) {
    cl(["link", run, "--claim", c, "--none", "--kind", "counter", "--reason", "defterde karşı satır bulunmadı", "--by", "karsi"]);
  }
  return run;
}

describe("extract — every line that cites is a claim, its rows counted by the machine", () => {
  it("line 66's pair, line 69's pair across prose, and L1071 cited but counted in nothing", () => {
    const run = fresh();
    const r = cl(["extract", run, "--answer", join(run, "answer.md"), "--out", join(run, "claims.jsonl")]);
    expect(r.code, r.out).toBe(0);
    expect(last(r.out)).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 0 · unexplained-evidence 0 · sections 0");
    const all = jsonl(join(run, "claims.jsonl"));
    expect(all.map((c) => c.line)).toEqual([1, 7, 13, 14, 20, 24, 25, 26]);      // never a header or separator row
    expect(all[0]).toMatchObject({ id: "C001", kind: "verdict", section: "", rows: 6, sources: 6, threads: 5 });  // no S-heading: ""
    expect(all[5]).toMatchObject({                                                 // K1 line 66
      section: "", kind: "claim",
      text: "Kota: Hangisinin daha çok yediği konusunda iki taraf eşit sayıda satırla birbirini yalanlıyor.",
      support: ["L1720", "L1722", "L1755"], counter: ["L1721", "L1723", "L1724"], inadmissible: [],
      rows: 3, sources: 3, threads: 2, counter_rows: 3, counter_sources: 3, counter_threads: 1, counter_status: "-",
    });
    expect(all[6]).toMatchObject({ support: ["L1533"], counter: ["L1681"], rows: 1, sources: 1, thin: true, // K1 line 69
      gap_status: "unchecked", text: "Uzun görev: Astra uzun işte kötü ↔ Astra uzun zor işte daha güçlü." });
    expect(all[7]).toMatchObject({ support: ["L1608", "L1071", "L1640", "L1676", "L1794"], inadmissible: ["L1071"], // K1 line 71
      rows: 4, sources: 4, counter_status: "unchecked" });
    // the writer's second pass is told, in a marker it cannot miss, which cited id it never writes again
    expect(cl(["brief", run]).out).toContain(" · dayanak [L1608, L1640, L1676, L1794] (4 satır · 4 bağımsız kaynak · 4 başlık)"
      + " · karşı [] (0) · not: kabul edilmeyen (YAZILMAZ): [L1071]\n");
  });

  it("inadmissible-cited counts the refused ids cited, each once — as the page's ledger footer and kapsama's İDDİA line", () => {
    const run = fresh();
    // one line more, citing two refused rows (L0429 hüküm yok, L0505 elendi): 3 refused ids on 2 claims
    writeFileSync(join(run, "answer2.md"), readFileSync(join(run, "answer.md"), "utf8") + "- İki satır daha [L0429, L0505]\n");
    const r = cl(["extract", run, "--answer", join(run, "answer2.md"), "--out", join(run, "claims2.jsonl")]);
    expect(last(r.out)).toBe("CLAIMS: 9 · verdict 1 · thin 1 · counter-less 7 · inadmissible-cited 3 · carried 0 · unexplained-evidence 0 · sections 0");
    expect(cl(["status", run, "--ledger", join(run, "claims2.jsonl")]).out).toMatch(/ · inadmissible-cited 3\n$/);
  });
});

describe("`## Alınmayan kanıt` — the writer names every admitted address it did not cite", () => {
  it("is no claim and no citation; unexplained-evidence counts the admitted addresses neither cited nor named there", () => {
    // K1's line 71 left out: L1608, L0180/L1640, L1676 and L1794 — four admitted addresses — are cited nowhere
    const run = fresh();
    const named = readFileSync(join(FIX, "answer-unused.md"), "utf8");
    const extract = (md: string) => {
      writeFileSync(join(run, "answer.md"), md, "utf8");
      const r = cl(["extract", run]);
      return { last: last(r.out), lines: jsonl(join(run, "claims.jsonl")).map((c) => c.line),
        status: JSON.parse(cl(["status", run, "--format", "json"]).out).unexplained_evidence };
    };
    const all = extract(named);
    expect(all.last).toBe("CLAIMS: 7 · verdict 1 · thin 1 · counter-less 5 · inadmissible-cited 0 · carried 0 · unexplained-evidence 0 · sections 0");
    expect(all.lines).toEqual([1, 7, 13, 14, 20, 24, 25]);                // the section's four lines are no claim
    expect(all.status).toBe(0);                                             // status reads the ledger's own answer.md
    const none = extract(`${named.split("\n## Alınmayan kanıt\n")[0]}\n`);
    expect(none.last).toBe("CLAIMS: 7 · verdict 1 · thin 1 · counter-less 5 · inadmissible-cited 0 · carried 0 · unexplained-evidence 4 · sections 0");
    expect(none.status).toBe(4);
    // a named address is not a cited one: drop its line and it is unexplained again
    expect(extract(named.replace("- [L1794] — tekrar\n", "")).last).toMatch(/ · unexplained-evidence 1 · sections 0$/);
  });

  it("status --format json counts it for any ledger: --answer, else the ledger's own answer, else <run>/answer.md", () => {
    const run = fresh();
    const named = readFileSync(join(FIX, "answer-unused.md"), "utf8");
    writeFileSync(join(run, "answer.md"), `${named.split("\n## Alınmayan kanıt\n")[0]}\n`, "utf8");  // four unexplained
    writeFileSync(join(run, "answer2.md"), named, "utf8");                                           // none
    cl(["extract", run, "--answer", join(run, "answer2.md"), "--out", join(run, "claims2.jsonl")]);
    for (const other of ["ledger-x.jsonl", "claims3.jsonl"]) cpSync(join(run, "claims2.jsonl"), join(run, other));
    const un = (...args: string[]) => JSON.parse(cl(["status", run, "--format", "json", ...args]).out).unexplained_evidence;
    expect(un("--ledger", join(run, "claims2.jsonl"))).toBe(0);                          // its own answer, answer2.md
    expect(un("--ledger", join(run, "ledger-x.jsonl"))).toBe(4);                         // no own answer by name
    expect(un("--ledger", join(run, "claims3.jsonl"))).toBe(4);                          // answer3.md is not there
    expect(un("--ledger", join(run, "ledger-x.jsonl"), "--answer", join(run, "answer2.md"))).toBe(0);
    expect(un("--ledger", join(run, "ledger-x.jsonl"), "--answer", join(run, "no-such.md"))).toBeNull();
  });
});

describe("the answer's sub-questions — every claim knows the `## S<n> — ` section it stands in (B56 K3)", () => {
  it("sets `section`, counts the sub-questions in extract's last line and per sub-question in status", () => {
    // the fixture's answer with rule 11's headings: two of its sections become S1 and S2, S3 holds only the gap line,
    // the quota table is S4, and "Ayakta kalan çelişkiler" stays the writer's own section after them (S0)
    const run = fresh();
    writeFileSync(join(run, "answer.md"), readFileSync(join(run, "answer.md"), "utf8")
      .replace("## Platform platform: kim hangisini seçiyor", "## S1 — Platform platform")
      .replace("## İşe göre ayrışma", "## S2 — İşe göre ayrışma")
      .replace("## Kota ve maliyet", "## S3 — Boş kalan soru\n\nBu alt soruya satır yok.\n\n## S4 — Kota ve maliyet"));
    const r = cl(["extract", run]);
    expect(last(r.out), r.out).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 0 · unexplained-evidence 0 · sections 3");
    expect(jsonl(join(run, "claims.jsonl")).map((c) => `${c.id} ${c.section}`)).toEqual(
      ["C001 S0", "C002 S1", "C003 S2", "C004 S2", "C005 S4", "C006 S0", "C007 S0", "C008 S0"]);
    // S2 is two table rows on four distinct rows; S3 has no claim, so no entry
    expect(JSON.parse(cl(["status", run, "--format", "json"]).out).sections).toEqual({
      S1: { claims: 1, rows: 3, sources: 3, counter: 0 }, S2: { claims: 2, rows: 4, sources: 4, counter: 0 },
      S4: { claims: 1, rows: 2, sources: 2, counter: 0 } });
    const plain = fresh();                                  // an answer without S-headings: no `sections` at all
    cl(["extract", plain]);
    expect(JSON.parse(cl(["status", plain, "--format", "json"]).out)).not.toHaveProperty("sections");
  });

  it("counts the research type's `## Şekil — ` section under SHAPE, listed first wherever it stands (B56 K3 stage 2)", () => {
    // the work table becomes the Şekil section, between S1 and S2, with a Toplam row that cites nothing: no claim
    const run = fresh();
    writeFileSync(join(run, "answer.md"), readFileSync(join(run, "answer.md"), "utf8")
      .replace("## Platform platform: kim hangisini seçiyor", "## S1 — Platform platform")
      .replace("## İşe göre ayrışma", "## Şekil — Karşılaştırma")
      .replace("hafif işte yavaş [L1681] |\n", "hafif işte yavaş [L1681] |\n| Toplam | — | 5 | — |\n")
      .replace("## Kota ve maliyet", "## S2 — Kota ve maliyet"));
    const r = cl(["extract", run]);
    expect(last(r.out), r.out).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 0 · unexplained-evidence 0 · sections 2");
    expect(jsonl(join(run, "claims.jsonl")).map((c) => `${c.id} ${c.section} ${c.kind}`)).toEqual(
      ["C001 S0 verdict", "C002 S1 claim", "C003 SHAPE claim", "C004 SHAPE claim", "C005 S2 claim", "C006 S0 claim", "C007 S0 claim",
        "C008 S0 claim"]);
    const sections = JSON.parse(cl(["status", run, "--format", "json"]).out).sections;
    expect(Object.keys(sections)).toEqual(["SHAPE", "S1", "S2"]);
    expect(sections.SHAPE).toEqual({ claims: 2, rows: 4, sources: 4, counter: 0 });
  });
});

describe("writer-rows — the writer is handed only the rows the ledger admits", () => {
  it("L1071 (read, judged none) is not printed; every row is counted, admitted or refused by its reason", () => {
    const run = fresh();
    const r = ev(["writer-rows", run]);
    expect(r.code).toBe(0);
    expect(r.err).toBe("writer-rows: 36 admissible · 4 refused (verdict none 1 · hüküm yok 1 · elendi 2 · gövde yok 0)\n");
    const lines = r.out.trim().split("\n");
    expect(lines).toHaveLength(36);
    expect(lines.filter((l) => /^\[(L1071|L0429|L0505|L0115)\]/.test(l))).toEqual([]);
    expect(lines).toContain('[L1720] reddit · @Trivikrama_0 · 2026-09-07 · "GPT 6 Astra works very well but eats up usage ' +
      'faster than Fable 5." · https://www.reddit.com/r/Anthropic/comments/1w9h3zh/gpt_6_astra_is_good_but_eats_up_tokens_faster/');
    const order = lines.map((l) => l.replace(/^\[(L\d{4})\] (\S+) · .*$/, "$2 $1"));
    expect(order).toEqual([...order].sort());
    const obj = JSON.parse(ev(["writer-rows", run, "--format", "json"]).out.split("\n")[0]);
    expect(Object.keys(obj)).toEqual(["id", "platform", "author", "pub_date", "passage", "url", "url_canonical", "domain"]);
  });
});

describe("list and link — the claim rounds' two doors", () => {
  it("list sends five claims, verdict first then rows, holds the sixth at the cap, and writes the sending", () => {
    const run = fresh();
    cl(["extract", run]);
    const r = cl(["list", run, "--todo", "counter", "--cap", "5", "--candidates", "3"]);
    expect(r.code, r.out).toBe(0);
    expect([...r.out.matchAll(/^### (C\d{3}) \| /gm)].map((m) => m[1])).toEqual(["C001", "C008", "C002", "C003", "C004"]);
    expect(r.out.match(/^dayanak:$/gm)).toHaveLength(5);
    expect(r.out.match(/^adaylar \(defterde, bağlanmamış\):$/gm)).toHaveLength(5);
    expect(r.out).toContain("### C008 | rows 4 · sources 4 · threads 4 · counter 0 | Benchmark: Artificial Analysis'te");
    expect(r.out).toContain('\n  [L1701] facebook · @Joshua Rideout · 2026-09-07 · "Astra, but both is the best answer."\n');
    expect(last(r.out)).toBe("LIST: counter sent 5 · not-sent (cap) 1");
    expect(claim(run, "C005").counter_status).toBe("not-sent (cap)");
    expect(cl(["status", run]).out).toBe("claims 8 · verdict 1 · thin 1 · counter: todo 0 · sent 5 · found 0 · none 0 · cap 1"
      + " · gap: todo 1 · sent 0 · found 0 · none 0 · cap 0 · inadmissible-cited 1\n");
  });

  it("link refuses a 'kanıt değil' row and an id already in support, links against, records none; owed 0 after five", () => {
    const run = sent();
    const file = join(run, "claims.jsonl");
    const before = sha(readFileSync(file));
    const bad = cl(["link", run, "--claim", "C008", "--against", "L1071", "--by", "karsi"]);
    expect([bad.code, bad.out]).toEqual([2, "REFUSED L1071: avcı: kanıt değil — benchmark/promo, no user preference\n"]);
    const own = cl(["link", run, "--claim", "C001", "--against", "L1669", "--by", "karsi"]);
    expect([own.code, own.out]).toEqual([2, "REFUSED L1669: already in C001's support\n"]);
    expect(sha(readFileSync(file))).toBe(before);
    const ok = cl(["link", run, "--claim", "C001", "--against", "L1721", "--by", "karsi"]);
    expect([ok.code, ok.out]).toEqual([0, "OK C001 counter_status found · +1 against: L1721\n"]);
    expect(cl(["link", run, "--claim", "C001", "--against", "L1721", "--by", "karsi"]).out)
      .toBe("OK C001 counter_status found · +0 against (already linked)\n");
    expect(claim(run, "C001")).toMatchObject({ counter_status: "found", checked_by: "karsi", links: [{ kind: "against", id: "L1721", by: "karsi" }] });
    expect(claim(run, "C001").links).toHaveLength(1);
    cl(["link", run, "--claim", "C008", "--against", "L1723,L1724", "--by", "karsi"]);
    cl(["link", run, "--claim", "C004", "--against", "L1720", "--by", "karsi"]);
    const none = cl(["link", run, "--claim", "C002", "--none", "--kind", "counter", "--reason", "defterde karşı satır bulunmadı", "--by", "karsi"]);
    expect([none.code, none.out]).toEqual([0, "OK C002 counter_status none · not: karsi: defterde karşı satır bulunmadı\n"]);
    expect(JSON.parse(cl(["status", run, "--format", "json"]).out)).toMatchObject({ owed_counter: 1, owed_gap: 0 });
    cl(["link", run, "--claim", "C003", "--none", "--kind", "counter", "--reason", "defterde karşı satır bulunmadı", "--by", "karsi"]);
    expect(claim(run, "C003")).toMatchObject({ counter_status: "none", notes: ["karsi: defterde karşı satır bulunmadı"] });
    expect(JSON.parse(cl(["status", run, "--format", "json"]).out)).toMatchObject({
      owed_counter: 0, owed_gap: 0, new_for_links: 0, counter: { todo: 0, sent: 0, found: 3, none: 2, cap: 1 } });
  });

  it("extract --keep-links carries the five checked claims onto the same answer; the capped one keeps its status uncounted", () => {
    const run = checked();
    const r = cl(["extract", run, "--out", join(run, "claims2.jsonl"), "--keep-links", join(run, "claims.jsonl")]);
    expect(r.code, r.out).toBe(0);
    expect(last(r.out)).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 5 · unexplained-evidence 0 · sections 0");
    expect(claim(run, "C008", "claims2.jsonl")).toMatchObject({ counter_status: "found", checked_by: "karsi",
      links: [{ kind: "against", id: "L1723" }, { kind: "against", id: "L1724" }] });
    expect(claim(run, "C002", "claims2.jsonl")).toMatchObject({ counter_status: "none", notes: ["karsi: defterde karşı satır bulunmadı"] });
    expect(claim(run, "C005", "claims2.jsonl")).toMatchObject({ counter_status: "not-sent (cap)", links: [], checked_by: null });
  });

  // B56, 2026-09-27: a claim the cap held back was never listed again — the 08:19 run's karsi sent 20 of 28, bosluk 20 of 25
  it("a claim the cap held back is sent by the next list, for both kinds; a claim already sent is never sent again", () => {
    const run = fresh();
    cl(["extract", run]);
    // 25 claims every list must work, rows 26 down to 2 — the order the list sends them in
    const ledger = Array.from({ length: 25 }, (_, i) => ({ ...claim(run, "C001"), id: `C${String(i + 1).padStart(3, "0")}`,
      kind: "claim", rows: 26 - i, counter_rows: 0, counter_status: "unchecked", thin: true, gap_status: "unchecked" }));
    writeFileSync(join(run, "claims.jsonl"), ledger.map((c) => JSON.stringify(c)).join("\n") + "\n");
    const listed = (out: string) => [...out.matchAll(/^### (C\d{3}) \| /gm)].map((m) => m[1]);
    const held = () => jsonl(join(run, "claims.jsonl")).filter((c) => c.counter_status === "not-sent (cap)").map((c) => c.id);
    const first = cl(["list", run, "--todo", "counter", "--cap", "20", "--candidates", "0"]);
    expect(first.code, first.out).toBe(0);
    expect(listed(first.out)).toEqual(ledger.slice(0, 20).map((c) => c.id));
    expect(last(first.out)).toBe("LIST: counter sent 20 · not-sent (cap) 5");
    expect(held()).toEqual(["C021", "C022", "C023", "C024", "C025"]);
    const second = cl(["list", run, "--todo", "counter", "--cap", "20", "--candidates", "0"]);
    expect(listed(second.out)).toEqual(["C021", "C022", "C023", "C024", "C025"]);
    expect(last(second.out)).toBe("LIST: counter sent 5 · not-sent (cap) 0");
    expect(held()).toEqual([]);
    expect(JSON.parse(cl(["status", run, "--format", "json"]).out)).toMatchObject({
      owed_counter: 25, counter: { todo: 0, sent: 25, found: 0, none: 0, cap: 0 } });
    expect(last(cl(["list", run, "--todo", "counter", "--cap", "20", "--candidates", "0"]).out))
      .toBe("LIST: counter sent 0 · not-sent (cap) 0 · nothing to send");
    // the gap round's list, the same rule
    expect(last(cl(["list", run, "--todo", "gap", "--cap", "20", "--candidates", "0"]).out)).toBe("LIST: gap sent 20 · not-sent (cap) 5");
    expect(last(cl(["list", run, "--todo", "gap", "--cap", "20", "--candidates", "0"]).out)).toBe("LIST: gap sent 5 · not-sent (cap) 0");
  });
});

describe("reads — a link counts only after a read of the claim (K2c)", () => {
  it("counts the rows shown and the addresses fetched before each link, per claim; unread_links names the rest", () => {
    // the K2 run's karsi round 1 was ONE Bash call chaining 20 links — no show, no fetch — and the gate said accepted.
    // Here the five sent claims are linked in the stream-json of six calls: C001 after a show of the row it links,
    // C008 in the SAME call as its show (it saw nothing before it linked), then a fetch of a page no claim stands on
    // (it reads no claim — the lead's tightening, §F2 item 4), then a fetch of the Reddit thread whose quote row
    // L1720 C004 links (L1492 is that thread's address row), then C004, C002 and C003 linked
    const run = fresh();
    cl(["extract", run]);
    mkdirSync(join(run, "rounds"));
    writeFileSync(join(run, "rounds", "list-karsi.r1.txt"), cl(["list", run, "--todo", "counter", "--cap", "5", "--candidates", "3"]).out);
    const links: [string, string[]][] = [["C001", ["--against", "L1721"]], ["C008", ["--against", "L1723,L1724"]],
      ["C004", ["--against", "L1720"]], ["C002", ["--none", "--kind", "counter", "--reason", "yok"]],
      ["C003", ["--none", "--kind", "counter", "--reason", "yok"]]];
    for (const [c, what] of links) cl(["link", run, "--claim", c, ...what, "--by", "karsi"]);
    const E = `python3 "${EVIDENCE}"`;
    const link = (i: number) => `python3 "${CLAIMS}" link "${run}" --claim ${links[i][0]} ${links[i][1].join(" ")} --by karsi`;
    const calls: [string, string][] = [[`${E} show "${run}" L1721`, "{…}"], [link(0), "OK C001 …"],
      [`${E} show "${run}" L1723 && ${link(1)}`, "…"],
      [`for u in https://example.org/k2c; do ${E} fetch "${run}" --url "$u"; done`, "OK L9001 58B …"],
      [`${E} fetch "${run}" --url "https://www.reddit.com/r/Anthropic/comments/1w9h3zh/gpt_6_astra_is_good_but_eats_up_tokens_faster/"`,
        "OK L1492 26040B …"], [[link(2), link(3), link(4)].join("\n"), "…"]];
    writeFileSync(join(run, "rounds", "karsi.r1.jsonl"), calls.flatMap(([command, out], i) => [
      { type: "assistant", message: { content: [{ type: "tool_use", id: `t${i}`, name: "Bash", input: { command } }] } },
      { type: "user", message: { content: [{ type: "tool_result", tool_use_id: `t${i}`, content: out }] } },
    ]).map((e) => JSON.stringify(e)).join("\n") + "\n");
    const r = cl(["reads", run, "--role", "karsi", "--round", "1"]);
    expect(r.code, r.out).toBe(0);
    expect(r.out).toBe("C001 read=1\nC002 read=0\nC003 read=0\nC004 read=1\nC008 read=0\n"
      + "READS: karsi round 1 · 6 tool calls · 5 claims · linked 5 · read 2 · unread-links 3: C002 C003 C008\n");
    const status = (...more: string[]) => JSON.parse(cl(["status", run, "--format", "json", "--transcript", ...more]).out);
    expect(status(join(run, "rounds", "karsi.r1.jsonl"), "--role", "karsi", "--round", "1").unread_links).toEqual(["C002", "C003", "C008"]);
    expect(status(join(run, "rounds", "karsi.r2.jsonl")).unread_links, "a transcript that cannot be read measures nothing").toBeNull();
    expect(JSON.parse(cl(["status", run, "--format", "json"]).out)).not.toHaveProperty("unread_links");
  });
});

describe("repassage — a passage starts at the first line that is not chrome", () => {
  it("L1480's passage starts past the page's title, menu and heading; the quote row on its address keeps its quote", () => {
    const run = fresh();
    expect(row(run, "L1480").passage).toMatch(/^Vibe Check: Opus 5\.5 Is Pulling Our Codex Converts Back to Claude \[Skip to content\]/);
    const quote = row(run, "L1792");
    const r = ev(["repassage", run]);
    expect([r.code, r.out]).toEqual([0, "repassage: 2 rows\n"]);
    const shown = JSON.parse(ev(["show", run, "L1480"]).out);
    expect(shown.passage).toMatch(/^Fable-level power at roughly 60 percent less than Fable's token price makes Opus 5\.5 /);
    expect(shown.passage_sha256).toBe(sha(shown.passage));
    expect(row(run, "L1792")).toEqual(quote);
    expect(ev(["repassage", run]).out).toBe("repassage: 0 rows\n");
  });

  it("a GitHub page's title, menu and session banner are chrome: L0115's passage is the issue's own words", () => {
    const run = fresh();
    expect(row(run, "L0115").passage).toMatch(/^Thin Line on 3\.3 Release · Issue #6 · ricardoalcocer\/actionbarclone · GitHub \[Skip to content\]/);
    ev(["repassage", run]);
    expect(row(run, "L0115").passage).toMatch(/^Hi, thank you for the actionbarclone project! When I run it using the 3\.3 release/);
  });

  it("an X post's short first line is its own words: a fetched post's passage starts there, not at its long paragraph", () => {
    const run = fresh();
    const post = join(root, `x-post-${n}.yaml`);
    writeFileSync(post, X_POST);
    const r = ev(["fetch", run, "--url", "https://x.com/i/status/2101679916735676886"], { DXB_STUB_OUT: post });
    expect(r.code, r.out + r.err).toBe(0);
    const id = /^OK (L\d{4}) /m.exec(r.out)![1];
    expect(row(run, id).passage).toMatch(/^A Robot Stabbing A Doll: It Is Not a Mystery\. It Is a Receipt\. On September 18, 2026, /);
  });

  it("a page's chrome goes wherever it stands (L0162: a title line, then the menu); a post with no menu line keeps its short lines", () => {
    const run = fresh();
    const page = readFileSync(join(FIX, "juejin-L0162.jsonl"), "utf8");
    writeFileSync(join(run, "evidence.jsonl"), readFileSync(join(run, "evidence.jsonl"), "utf8") + page);
    cpSync(join(FIX, "juejin-L0162.txt"), join(run, "bodies", `${sha(JSON.parse(page).url_canonical)}.txt`));
    expect(row(run, "L0162").passage).toContain(" - 掘金 稀土掘金 稀土掘金 * + [首页](/) + [沸点](/pins) + ");
    expect(ev(["repassage", run]).out).toBe("repassage: 3 rows\n");
    const passage = row(run, "L0162").passage;
    expect(passage).toMatch(/^民间AI排行榜单新鲜出炉,Fable 5\.1仅排第三最近,一份民间 AI 能力排行新鲜出炉。/);
    expect(passage).toContain(" 阅读7分钟 大家好,我是石小石~ 长期以来,`MMLU`(大规模多任务语言理解)");
    expect(passage).not.toContain("](");
    // L0506 has no menu line: its t.co link is a line of ≤ 3 words, and its own — the passage K1 gave it
    const post = join(root, `x-post-${n}.yaml`);
    writeFileSync(post, X_POST_L0506);
    const r = ev(["fetch", run, "--url", "https://x.com/i/status/2101328589774000594"], { DXB_STUB_OUT: post });
    expect(r.code, r.out + r.err).toBe(0);
    expect(row(run, /^OK (L\d{4}) /m.exec(r.out)![1]).passage).toBe("【話題】GPT-6 Astraで動くロボット、危険な命令をほぼ拒否せず"
      + " ・赤ちゃん人形を刺すなど、5種類の危険行為を100回テスト ・97回で実行しようと動き、60回で実際に完遂 ・Fable 5.1では80回動き、34回完遂"
      + " https://t.co/0bZEtGWDaZ");
  });
});

describe("the wall and the scrapling door", () => {
  let b: Bench;
  let first = "";
  beforeAll(() => {
    b = makeBench();
    first = join(b.root, "first");
    mkdirSync(first);
    writeFileSync(join(first, "scrapling"), SCRAPLING);
    chmodSync(join(first, "scrapling"), 0o755);
  });
  afterAll(() => b.dispose());
  /** the engine copy's fetch.py, the stand-in scrapling first on PATH, the chain stopped after door `stop` */
  function fetchPy(url: string, stop: string, extra: Record<string, string> = {}) {
    const log = join(b.root, `scrapling-${n++}.log`);
    const out = join(b.root, `page-${n}.md`);
    const env: Record<string, string | undefined> = { ...process.env, ...extra, PATH: `${first}:${b.bin}:${process.env.PATH}`,
      DXB_SCRAPLING_LOG: log, DXB_RESEARCH_RUN: "k2-no-open-run", PYTHONDONTWRITEBYTECODE: "1" };
    delete env.DXB_SCRAPLING;
    const r = spawnSync("python3", [join(b.engine, "scripts", "fetch.py"), url, "--json", "--stop-at", stop,
      "--timeout", "10", "--out", out], { encoding: "utf8", env, timeout: 60_000 });
    return { code: r.status, err: r.stderr, meta: JSON.parse(r.stdout || "{}"), log, out };
  }

  it("rlib's one judge calls both refusals a wall, as it calls Access Denied", () => {
    const denied = join(root, "denied.html");
    const humanity = join(root, "humanity.txt");
    writeFileSync(denied, ACCESS_DENIED);
    writeFileSync(humanity, HUMANITY);
    const r = py(RLIB, ["--judge", denied, humanity, join(FIX, "tracxn-login.txt")]);
    expect([r.code, r.out]).toEqual([0, "BROKEN\nBROKEN\nBROKEN\n"]);
  });

  it("a Reddit post that quotes the challenge inside a sentence is a page: the judge and fetch.py's first door read it", () => {
    const quoted = join(FIX, "reddit-quotes-the-challenge.txt");
    expect(py(RLIB, ["--judge", quoted]).out).toBe("OK\n");
    const r = fetchPy("https://www.reddit.com/r/test/comments/k2quote/", "3", { DXB_SCRAPLING_BODY: quoted });
    expect(r.code, r.err).toBe(0);
    expect(r.meta).toMatchObject({ read: true, door: "scrapling", bytes: 3961 });
    expect(r.meta.attempts.at(-1)).toMatchObject({ door: "scrapling", ok: true, wall: false });
  });

  it("a stub scrapling first on PATH is the one both of fetch.py's scrapling doors call", () => {
    const url = "https://example.org/k2-scrapling-door";
    const r = fetchPy(url, "4");
    expect(r.code, r.err).toBe(0);
    expect(r.meta).toMatchObject({ read: true, door: "scrapling-stealth" });
    expect(readFileSync(r.log, "utf8").trim().split("\n").map((l) => l.split(" ").slice(0, 3).join(" ")))
      .toEqual([`extract get ${url}`, `extract stealthy-fetch ${url}`]);
    expect(readFileSync(r.out, "utf8")).toContain("the page the stand-in scrapling read");
  });
});

describe("audit.py — an auditor that never saw the writer reads every claim against its own rows (B56 K3 stage 3)", () => {
  const AUDIT = join(SKILL, "scripts", "audit.py");
  const RULES = join(dirname(resolve(import.meta.filename)), "fixtures", "audit", "rules");
  const au = (args: string[], env: Record<string, string> = {}) => py(AUDIT, args, env);
  /** a fresh fixture run, its ledger extracted, read by the auditor four claims to a call — the kept answers its model's */
  function audited() {
    const run = fresh();
    cl(["extract", run]);
    return { run, r: au(["run", run, "--batch", "4"], { FAKE_AUDIT: RULES }) };
  }
  /** the line the kept answers wrote for a claim: batch 1 bare, batch 2 in claude's envelope, fenced */
  const said = (id: string): string => [...JSON.parse(readFileSync(join(RULES, "batch-1.json"), "utf8")).verdicts,
    ...JSON.parse(JSON.parse(readFileSync(join(RULES, "batch-2.json"), "utf8")).result.replace(/^```json\n|\n```$/g, "")).verdicts]
    .find((v) => v.id === id).line;

  it("reads a model's answer bare, in a fence, and cut — the cut one unreadable (--selftest)", () => {
    const r = au(["--selftest"]);
    expect([r.code, last(r.out)]).toEqual([0, "SELFTEST OK 3/3"]);
  });

  it("hands each claim its whole line and only its own rows, as the writer saw them; a claim an answer lacks is asked once more", () => {
    const { run, r } = audited();
    expect(r.code, r.err).toBe(0);
    expect(r.out).toMatch(/^denetçi: 8 iddia okundu · 4 düzeltildi · 2 çıkarıldı · 0 denetlenmedi · \$0\.02 · \d+s\n$/);
    expect(r.err).toContain("denetçi: parti 2: 1/4 iddia okunamadı (cevapta 1 iddia yok) — yeniden soruluyor (1/1)\n");
    const one = readFileSync(join(run, "audit", "batch-1.txt"), "utf8");
    const two = readFileSync(join(run, "audit", "batch-2.txt"), "utf8");
    expect([...one.matchAll(/^### (C\d{3}.*)$/gm)].map((m) => m[1])).toEqual(["C001 · hüküm", "C002", "C003", "C004"]);
    // K1's line 66 whole, its support and its counter rows each on the line `evidence.py writer-rows` handed the writer
    const writer = ev(["writer-rows", run]).out.split("\n");
    const shown = (id: string) => writer.find((l) => l.startsWith(`[${id}] `));
    expect(two).toContain(`### C006\n${readFileSync(join(run, "answer.md"), "utf8").split("\n")[23]}\ndayanak:\n  ${shown("L1720")}\n`
      + `  ${shown("L1722")}\n  ${shown("L1755")}\nkarşı:\n  ${shown("L1721")}\n  ${shown("L1723")}\n  ${shown("L1724")}\n`);
    expect(two).toContain("\n  [L1071] gövde yok (yazara verilmeyen satır)\n");     // judged no evidence: never the writer's
    expect(readFileSync(join(run, "audit", "batch-2.retry.txt"), "utf8").match(/^### C\d{3}/gm)).toEqual(["### C007"]);
    const recs = jsonl(join(run, "audit.jsonl"));
    expect(recs.map((a) => `${a.id} ${a.verdict} ${a.batch}`)).toEqual(["C001 removed 1", "C002 corrected 1", "C003 removed 1",
      "C004 ok 1", "C005 corrected 2", "C006 corrected 2", "C007 ok 2", "C008 corrected 2"]);
    expect(recs[0]).toMatchObject({ section: "", line_no: 1, by: "denetci", line: said("C001"),
      was: readFileSync(join(run, "answer.md"), "utf8").split("\n")[0] });
  });

  it("apply: the auditor's line, a table row deleted, the verdict never removed, a foreign id refused, the ids renumbered; check", () => {
    const { run } = audited();
    const before = readFileSync(join(run, "answer.md"), "utf8").split("\n");
    const a = au(["apply", run]);
    expect([a.code, a.out]).toEqual([0, "apply: C001 hüküm satırı silinmez — denetçinin satırıyla düzeltildi\n"
      + "apply: C005 denetçi satırı reddedildi: L1720 iddianın satırlarında yok — ok\napply: 4 satır düzeltildi · 1 satır silindi\n"]);
    // line 1, the verdict, `removed` → the auditor's line; C002's table row (7) the auditor's row of five cells; C003's
    // (13) deleted; C005's row keeps the writer's — L1720 is another claim's row; C006 and C008 the auditor's lines
    expect(readFileSync(join(run, "answer.md"), "utf8").split("\n")).toEqual([said("C001"), ...before.slice(1, 6), said("C002"),
      ...before.slice(7, 12), ...before.slice(13, 23), said("C006"), before[24], said("C008"), ...before.slice(26)]);
    const recs = jsonl(join(run, "audit.jsonl"));
    expect(recs.map((x) => `${x.id_before} ${x.id} ${x.verdict} ${x.line_no}`)).toEqual(["C001 C001 corrected 1",
      "C002 C002 corrected 7", "C003 null removed 13", "C004 C003 ok 13", "C005 C004 ok 19", "C006 C005 corrected 23",
      "C007 C006 ok 24", "C008 C007 corrected 25"]);
    expect(recs[2]).toMatchObject({ was: before[12], line: null });
    expect(recs[4]).toMatchObject({ line: null, reason: expect.stringMatching(/^denetçi satırı reddedildi: L1720 iddianın satırlarında yok — /) });
    // the ledger is still the old answer's, and check says so; extracted again, it stands on the record
    const stale = au(["check", run]);
    expect([stale.code, stale.out.split(" — ")[0]]).toEqual([1, "!! DENETİM UYUMSUZ: C001 C002 C003 C003 C004 C005 C006 C007 C008"]);
    expect(last(cl(["extract", run]).out)).toMatch(/^CLAIMS: 7 · /);
    expect(au(["check", run])).toMatchObject({ code: 0, out: "check: OK 8\n" });
    expect(au(["apply", run]).code, "an audit is applied once").toBe(2);
  });
});
