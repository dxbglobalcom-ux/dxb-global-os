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
// menu stands under it. No network, no model.

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
    expect(last(r.out)).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 0");
    const all = jsonl(join(run, "claims.jsonl"));
    expect(all.map((c) => c.line)).toEqual([1, 7, 13, 14, 20, 24, 25, 26]);      // never a header or separator row
    expect(all[0]).toMatchObject({ id: "C001", kind: "verdict", section: null, rows: 6, sources: 6, threads: 5 });
    expect(all[5]).toMatchObject({                                                 // K1 line 66
      section: "Ayakta kalan çelişkiler", kind: "claim",
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
    expect(last(r.out)).toBe("CLAIMS: 9 · verdict 1 · thin 1 · counter-less 7 · inadmissible-cited 3 · carried 0");
    expect(cl(["status", run, "--ledger", join(run, "claims2.jsonl")]).out).toMatch(/ · inadmissible-cited 3\n$/);
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
    expect(last(r.out)).toBe("CLAIMS: 8 · verdict 1 · thin 1 · counter-less 6 · inadmissible-cited 1 · carried 5");
    expect(claim(run, "C008", "claims2.jsonl")).toMatchObject({ counter_status: "found", checked_by: "karsi",
      links: [{ kind: "against", id: "L1723" }, { kind: "against", id: "L1724" }] });
    expect(claim(run, "C002", "claims2.jsonl")).toMatchObject({ counter_status: "none", notes: ["karsi: defterde karşı satır bulunmadı"] });
    expect(claim(run, "C005", "claims2.jsonl")).toMatchObject({ counter_status: "not-sent (cap)", links: [], checked_by: null });
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
