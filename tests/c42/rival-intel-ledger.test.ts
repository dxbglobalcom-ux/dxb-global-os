// C42 STAGE 1 — the gate that makes a stale tick impossible.
//
// The CEO's complaint of 2026-07-27 was not that work was missing; it was that
// work was DECLARED finished while its row stayed half-done ("bişeyler oldu
// deniyor bitti deniyor ama olmamış işte"). The open work board answered that
// with a rule; this file answers it with a machine.
//
// A ledger row that says `reported` is a CLAIM. Here it must survive:
//   - its report file exists,
//   - it carries all six required sections,
//   - section 2 is a real frame-by-frame record, not a summary.
//
// Read-only: this suite touches no database and no network.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIR = join(process.cwd(), ".planning/research/rival-intel");
const LEDGER = join(DIR, "00-LEDGER.md");

// The six sections the CEO's order requires of every report. His words:
// "MİLİMETRİK DEĞERLENDİRME HER KAREDEKİ OLGU … ŞU SKİLLERİ ŞU PLUGİNLERİ ŞU
// TOOLLARI İNDİRİP KURUP YAPARIM YAPILIR PROJESİ OLMALI."
const REQUIRED_SECTIONS = [
  "## 1. Source identity",
  "## 3. Capabilities",
  "## 4. What DXB has today",
  "## 5. The build project",
  "## 6. Verdict",
] as const;

// Section 2 is the anti-summary section, and its NAME depends on what the source
// is: a reel has frames, a repository has files, a PDF has pages. Requiring the
// literal words "frame-by-frame" would have forced a repo report to lie about
// what it read — measured on the first full run, where sources 08 and 16 failed
// the gate for honestly calling their section "file-by-file record". The rule
// that actually matters is unchanged and is enforced twice: section 2 must exist
// and must be a RECORD, and for a reel or a video it must additionally carry a
// real count of timestamped rows (see MIN_FRAME_ROWS below).
const SECTION_2 = /^## 2\. .*\brecord\b/im;

// A frame row is a table line opening with a timestamp: | 00:04 | ...
const FRAME_ROW = /^\|\s*\d{1,2}:\d{2}(?:[.:]\d{1,3})?\s*\|/gm;
const MIN_FRAME_ROWS = 8;

type Row = { n: string; kind: string; status: string; report: string };

function ledgerRows(): Row[] {
  const text = readFileSync(LEDGER, "utf8");
  return text
    .split("\n")
    .filter((l) => /^\|\s*\d{2}\s*\|/.test(l))
    .map((l) => {
      const c = l.split("|").map((s) => s.trim());
      // | n | source | kind | status | claimed | report | ceo note |
      // A stray "|" inside a cell would silently shift every column after it —
      // measured on the first run of this gate, where an uploader name carrying
      // a pipe ("Okyanusi | Akın Yılmaz") turned the kind column into a person's
      // name. The row-shape assertions below are what caught it; keep them.
      return { n: c[1], kind: c[3], status: c[4], report: c[6].replace(/`/g, "") };
    });
}

describe("C42 rival-intel ledger", () => {
  it("the ledger exists and every row is well formed", () => {
    expect(existsSync(LEDGER)).toBe(true);
    const rows = ledgerRows();
    expect(rows.length).toBeGreaterThanOrEqual(16);
    for (const r of rows) {
      expect(r.n, `row number on ${JSON.stringify(r)}`).toMatch(/^\d{2}$/);
      expect(["reel", "video", "pdf", "repo"], `kind on row ${r.n}`).toContain(r.kind);
      expect(
        ["pending", "claimed", "fetched", "watched", "reported"],
        `status on row ${r.n}`,
      ).toContain(r.status);
      expect(r.report, `report filename on row ${r.n}`).toMatch(/^\d{2}-[a-z0-9-]+\.md$/);
    }
  });

  it("row numbers are unique and report filenames are unique", () => {
    const rows = ledgerRows();
    expect(new Set(rows.map((r) => r.n)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => r.report)).size).toBe(rows.length);
  });

  // THE GATE. Everything above is hygiene; this is the rule that stops a
  // half-finished row from wearing a finished label.
  it("every 'reported' row has a report carrying all six sections", () => {
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const path = join(DIR, r.report);
      expect(existsSync(path), `row ${r.n} says reported but ${r.report} is not on disk`).toBe(
        true,
      );
      const body = readFileSync(path, "utf8");
      for (const section of REQUIRED_SECTIONS) {
        expect(body, `row ${r.n} report is missing "${section}"`).toContain(section);
      }
      expect(
        SECTION_2.test(body),
        `row ${r.n} report has no "## 2. …record" section — the anti-summary section is missing`,
      ).toBe(true);
    }
  });

  it("a reported reel or video carries a real frame-by-frame record, not a summary", () => {
    for (const r of ledgerRows().filter(
      (x) => x.status === "reported" && (x.kind === "reel" || x.kind === "video"),
    )) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      const frames = body.match(FRAME_ROW)?.length ?? 0;
      expect(
        frames,
        `row ${r.n}: section 2 has ${frames} timestamped rows — a summary, not a frame record`,
      ).toBeGreaterThanOrEqual(MIN_FRAME_ROWS);
    }
  });

  // LAW 7 — added 2026-08-08, the SECOND time the CEO burned a whole batch of
  // verdicts for one error. Sixteen reports on 2026-08-01: "UNDERESTIMATED MY
  // OPPONENTS TOOOOOOO MUCH". Five reports on 2026-08-08, for the same thing in a
  // politer word — they called the rivals' lead "legibility", wrote "nothing in it
  // is technically ahead of us", and counted 205 agents and 199 personas as if a
  // count were a judgement. Capability that has never run is stock on a shelf.
  //
  // Every one of the earlier cases asks HOW MUCH WAS WATCHED. None of them ever
  // asked HOW IT WAS JUDGED — which is why 9/9 went green over a sentence he had
  // already burned. This case asks the second question, so the machine fails the
  // commit instead of the CEO finding it three days later.
  it("a report never calls a rival's lead cosmetic, and never counts our inventory as a verdict", () => {
    const FORBIDDEN: Array<[RegExp, string]> = [
      [
        /\b(?:gap|lead|difference)\b[^.\n]{0,60}\bis\b[^.\n]{0,30}\b(?:legibilit|presentation|display|drawing|cosmetic)/i,
        'calls the rivals\' lead a matter of legibility/presentation — the exact verdict burned on 2026-08-08',
      ],
      [
        /\bnot(?:hing)?\b[^.\n]{0,40}\btechnically ahead of us\b/i,
        '"nothing in it is technically ahead of us" — burned verbatim on 2026-08-08',
      ],
      [
        /\bahead of us\b[^.\n]{0,30}\b(?:on the surface|only on the surface|superficially)\b/i,
        'narrows a rival\'s lead to "the surface"',
      ],
      [
        /\b(?:we|dxb|ours?|the ceo)\b[^.\n]{0,40}\b(?:\d+\s*(?:x|times)|thirty times|larger than|bigger than)\b[^.\n]{0,40}\b(?:them|their|all three|combined|rival)/i,
        'compares size instead of output — counting inventory and calling it a judgement',
      ],
      [
        /\bnot (?:an? )?engineering (?:gap|problem)\b/i,
        'declares the gap non-engineering — the softening sentence he deleted',
      ],
    ];
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      // The banner that RECORDS the rejection is allowed to quote the burned text;
      // the ledger is the record of the defect, never the defect. Reports are not.
      for (const [re, why] of FORBIDDEN) {
        const hit = body.match(re);
        expect(
          hit,
          `row ${r.n} (${r.report}) breaks ledger law 7 — ${why}. Found: "${hit?.[0] ?? ""}"`,
        ).toBeNull();
      }
      // The required half: a verdict must state what the source PRODUCES, measured,
      // or say plainly that it does not show it.
      expect(
        /\b(?:earns?|earning|revenue|customers?|paying|users?|stars|subscribers|sold|sells|priced at|\$[\d,]|does not (?:show|prove) what it produces)\b/i.test(
          body,
        ),
        `row ${r.n} (${r.report}) records nothing about what this rival PRODUCES — law 7 requires the measured output, or the honest line that the source does not show it`,
      ).toBe(true);
    }
  });

  // LAW 8 — added 2026-08-09 on the CEO's live order and REWRITTEN the same day on his
  // correction, which deleted the first wording (LAW A).
  //
  // The first wording made the report ask "is the thing on the screen alive?" and it
  // produced precisely the verdicts he struck out — "no self-driven movement",
  // "NOT ESTABLISHED", "the face of an organism without the pulse". His correction:
  // "onların hepsi canlı ve gerçek zaten… bu rakiplerin tüm sistemleri canlı kanlı.
  // en sondaki nimbus zaten capcanlı yaşayan sistemler. Ekrandaki şeyler canlı mı diye
  // sormanıza gerek yok."
  //
  // So aliveness is the PREMISE, not the question. The holding is to be built as a
  // living organism — the FIRST LAW OF V2 on 00-BOARD-OPEN-WORK.md, "IT MUST BE ALIVE
  // (2026-08-02)" — and these rivals are the living examples read for their MECHANISM.
  // A clip is an advertisement, not the system: what it fails to show is a limit of the
  // film, never a fact about the rival. This case holds all three lines at once.
  // The section runs from its heading to the next heading, or to the end of the file.
  // End-of-input is written `$(?![\s\S])` on purpose: JavaScript has no \Z, and under /i
  // a literal Z would end the section at the first "z" in the text — which it did.
  const ALIVENESS_SECTION =
    /^#{2,4}\s*(?:\d+[a-z]?\.\s*)?Aliveness\b[^\n]*\n([\s\S]*?)(?=^#{1,3} |$(?![\s\S]))/im;
  const ALIVENESS_VERDICTS =
    /(?:not\s+(?:a\s+)?living|is\s+not\s+alive|does\s+not\s+show\s+a\s+living|no\s+self-driven|not\s+established|not\s+shown|—\s*NO\b|has\s+not\s+shown\s+its\s+pulse|without\s+the\s+pulse|canlı\s+değil)/i;
  it("every report takes the rival's LIVING MECHANISM — never a verdict on whether it is alive", () => {
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      const section = ALIVENESS_SECTION.exec(body);
      expect(
        section !== null,
        `row ${r.n} (${r.report}) has no "Aliveness" section — ledger law 8 requires every source to be read for HOW it is built to live: what runs on its own clock, what makes the surface breathe, how it answers the human, and what DXB takes`,
      ).toBe(true);
      const text = section?.[1] ?? "";
      expect(
        ALIVENESS_VERDICTS.test(text),
        `row ${r.n} (${r.report}) grades the rival's aliveness in its Aliveness section — law 8 forbids it: every source on this queue is a live, running system (CEO first-hand). Write what the source SHOWS and what it implies; a clip that does not display a mechanism is a limit of the film, never a fact about the rival`,
      ).toBe(false);
      expect(
        /what\s+DXB\s+takes/i.test(text),
        `row ${r.n} (${r.report}) never says what DXB takes from this living system — law 8 requires the buildable mechanism, named as a project where one exists`,
      ).toBe(true);
    }
  });

  it("a reported row records the fingerprint of what was actually studied", () => {
    for (const r of ledgerRows().filter((x) => x.status === "reported")) {
      const body = readFileSync(join(DIR, r.report), "utf8");
      // sha256 for downloaded media, a commit for a cloned repo — either way the
      // report must name the exact bytes it read, so a later reader can tell
      // whether the source has changed underneath it.
      expect(body, `row ${r.n} report names no sha256 and no commit`).toMatch(
        /\b(?:[a-f0-9]{64}|[a-f0-9]{7,40})\b/i,
      );
    }
  });

  // "A hash is present" was not enough. Measured 2026-07-28: a bulk-insert script
  // matched media files by a two-character prefix and hashed the extracted .wav
  // instead of the .mp4, so SIX reports carried a syntactically perfect sha256 of
  // the wrong file — and the test above passed all six. A fingerprint that is not
  // checked against the artefact is decoration. When the media is on disk, the
  // number in the report must BE its hash.
  it("a recorded sha256 is the hash of the file it claims to describe", () => {
    const mediaDir = join(DIR, "media");
    if (!existsSync(mediaDir)) return; // media is gitignored; skip on a fresh clone
    const media = readdirSync(mediaDir).filter((f) => /^\d{2}-.*\.(mp4|pdf)$/.test(f));
    for (const file of media) {
      const n = file.slice(0, 2);
      const row = ledgerRows().find((r) => r.n === n && r.status === "reported");
      if (!row) continue;
      const body = readFileSync(join(DIR, row.report), "utf8");
      const claimed = body.match(/\*\*sha256\*\*\s*\|\s*`([a-f0-9]{64})`/i)?.[1];
      if (!claimed) continue; // repo rows name a commit instead; covered above
      const actual = createHash("sha256").update(readFileSync(join(mediaDir, file))).digest("hex");
      expect(
        claimed,
        `row ${n}: the report's sha256 is not the hash of ${file} — it describes some other bytes`,
      ).toBe(actual);
    }
  });

  it("the NEXT pointer names a row that is not yet reported", () => {
    const text = readFileSync(LEDGER, "utf8");
    const m = text.match(/^\*\*NEXT:\s*(\d{2}|done)\s*\*\*/m);
    expect(m, "the ledger has no NEXT pointer — a fresh session cannot resume").not.toBeNull();
    const next = m![1];
    const rows = ledgerRows();
    if (next === "done") {
      expect(rows.every((r) => r.status === "reported")).toBe(true);
    } else {
      const row = rows.find((r) => r.n === next);
      expect(row, `NEXT points at row ${next}, which does not exist`).toBeDefined();
      expect(row!.status, `NEXT points at row ${next}, already reported`).not.toBe("reported");
    }
  });

  // THE SECOND GATE, and it exists because of a measured miss, not a worry.
  //
  // The CEO's directive package ships two carriers of the same text: a Markdown
  // file and a DOCX. Its own README calls the DOCX "the formatted human-review
  // copy", so every session read the Markdown and skipped it — but the CEO
  // WRITES HIS AMENDMENTS INTO THE DOCX. Measured 2026-08-02: he edited it at
  // 2026-08-01 17:45, adding five reels and the cognee repository; the copy in
  // the repository was still the one of 2026-07-29, and the fetch run of
  // 2026-08-02 01:33-01:54 — eight hours after his edit — took twelve
  // supplementary links when his list already held seventeen. Six sources were
  // invisible, and nothing on disk said so.
  //
  // A rule in a document could not have caught that. This can: every source URL
  // written in EITHER carrier must own a ledger row, or the suite fails.
  it("every source URL in the CEO's directive owns a ledger row — both carriers", () => {
    const pkg = join(process.cwd(), "docs/ceo-directives/2026-07-reanalysis");
    const md = join(pkg, "00_READ_FIRST_MASTER_DIRECTIVE.md");
    const docx = join(pkg, "DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.docx");
    if (!existsSync(md) && !existsSync(docx)) return; // package absent — nothing to check

    // A source is a reel/post slug or a repository path. The trailing share
    // parameters he pastes ("?igsh=…") are NOT part of the identity: the same
    // reel arrives with a different tail every time he copies it, so matching on
    // the whole URL would report phantom misses forever.
    const SOURCE = /(?:instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+))|(?:github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))/g;
    const identities = (text: string) => {
      const out = new Set<string>();
      for (const m of text.matchAll(SOURCE)) out.add((m[1] ?? m[2]).replace(/\.git$/, "").toLowerCase());
      return out;
    };

    const wanted = new Set<string>();
    if (existsSync(md)) for (const id of identities(readFileSync(md, "utf8"))) wanted.add(id);
    if (existsSync(docx)) {
      // A .docx is a zip; the body text lives in word/document.xml. Reading it
      // needs no dependency and no network — `unzip -p` writes it to stdout.
      const xml = execFileSync("unzip", ["-p", docx, "word/document.xml"], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      for (const id of identities(xml)) wanted.add(id);
    }
    expect(wanted.size, "no source URL was readable out of the directive package").toBeGreaterThan(0);

    const ledger = readFileSync(LEDGER, "utf8").toLowerCase();
    const missing = [...wanted].filter((id) => !ledger.includes(id));
    expect(
      missing,
      `the CEO's directive names ${missing.length} source(s) with no ledger row: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("no orphan reports — a report on disk belongs to a ledger row", () => {
    if (!existsSync(DIR)) return;
    // `00-` is the ledger's own prefix (00-LEDGER, 00-SYNTHESIS) — those belong
    // to the stage, not to a source row.
    const reports = readdirSync(DIR).filter(
      (f) => /^\d{2}-.*\.md$/.test(f) && !f.startsWith("00-"),
    );
    const known = new Set(ledgerRows().map((r) => r.report));
    for (const f of reports) {
      expect(known.has(f), `${f} is on disk but no ledger row claims it`).toBe(true);
    }
  });
});
