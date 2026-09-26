// B56 · LANE B — THE FIELD: SEVEN HUNTERS, EACH THE OWNER OF ITS PLATFORMS.
//
// WHAT WAS MEASURED. On the answer he rejected on 2026-09-24 the ground had found 294 X addresses
// and the answer cited none of them (the lead's count, EVIDENCE-B56). The named cause: the hunters
// owned TOPICS, so X belonged to no one, and nothing asked a hunter to account for what it left
// unread. His order of 2026-09-26: the hunters are Opus 5.5 at low effort, and what is gathered is
// not thrown away — "100 bilgi gelior konuyla iligli adam 2 sini alıp diğerlerini çöze atıor".
//
// WHAT IS GUARDED HERE, BY RUNNING IT. The engine is copied to a temporary folder (engine-copy.ts);
// inside the COPY the ground, the ledger and the coverage table are stand-ins that print the shapes
// the contract fixes (fixtures/fleet/), and `claude` is a stand-in that keeps what it was launched
// with. Who owns which platform, what each prompt carries, how a hunter is launched and what the
// summary counts are the real fleet.sh and merge.py. The real evidence.py and kapsama.py are Lane
// A's and have their own cases; a real hunter costs money and is the lead's live run.

import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, cpSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench } from "./engine-copy.js";

const FLEET_DIR = join(process.cwd(), ".claude/skills/dxb-research/fleet");
const FX = join(import.meta.dirname, "fixtures", "fleet");
const SEVEN = ["x", "video", "forums", "pro", "code", "foreign", "counter"];
// the one classifier's platform names (scripts/platforms.py, EVIDENCE-B56 "THE CONTRACTS")
const PLATFORMS = ["x", "youtube", "tiktok", "instagram", "facebook", "linkedin", "reddit", "hackernews", "github",
  "bluesky", "threads", "quora", "stackoverflow", "chinese", "medium", "substack", "web"];

let b: Bench;
let run7 = "";
let out7 = { code: 0, stdout: "" };

function fleet(out: string, ...args: string[]): { code: number; stdout: string } {
  try {
    const stdout = execFileSync("bash", [join(b.engine, "fleet", "fleet.sh"), out, ...args], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 90_000,
    });
    return { code: 0, stdout };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { code: err.status ?? 1, stdout: String(err.stdout ?? "") + String(err.stderr ?? "") };
  }
}

const flat = (s: string) => s.replace(/\s+/g, " ");
const roles = () => readFileSync(join(FLEET_DIR, "roles.tsv"), "utf8");

beforeAll(() => {
  b = makeBench();
  copyFileSync(join(FX, "evidence-stub.py"), join(b.engine, "scripts", "evidence.py"));
  copyFileSync(join(FX, "kapsama-stub.py"), join(b.engine, "scripts", "kapsama.py"));
  copyFileSync(join(FX, "sweep-stub.sh"), join(b.engine, "scripts", "sweep.sh"));
  copyFileSync(join(FX, "claude-stub.sh"), join(b.bin, "claude"));
  chmodSync(join(b.bin, "claude"), 0o755);
  run7 = join(b.root, "run7");
  out7 = fleet(run7, "--q", "astra 6 vs fable 5.1", "--hunters", "7", "--timeout", "30");
}, 120_000);
afterAll(() => b?.dispose());

describe("the roster — seven hunters, every platform with one owner, on his model", () => {
  it("names the seven, gives each its platforms in the classifier's words, and owns no platform twice", () => {
    const rows = roles().trim().split("\n").map((l) => l.split("\t"));
    expect(rows.map((r) => r[0]).sort()).toEqual([...SEVEN].sort());
    const owned = rows.flatMap((r) => r[1].split(" ")).filter((p) => p !== "rest");
    for (const p of owned) expect(PLATFORMS, `"${p}" is not a platform of the classifier`).toContain(p);
    expect(new Set(owned).size, "a platform has two owners").toBe(owned.length);
    expect(rows.find((r) => r[0] === "counter")?.[1]).toBe("rest");
    const fleetSh = readFileSync(join(FLEET_DIR, "fleet.sh"), "utf8");
    expect(fleetSh).toMatch(/^DEFAULT4="x video forums counter"$/m);
    const seven = /^DEFAULT7="([^"]*)"$/m.exec(fleetSh)?.[1].split(" ") ?? [];
    expect([...seven].sort()).toEqual([...SEVEN].sort());
  });

  it("launches on claude-opus-5-5 at low effort with a ten-minute clock, and the old rationale is gone", () => {
    const fleetSh = readFileSync(join(FLEET_DIR, "fleet.sh"), "utf8");
    expect(fleetSh).toMatch(/^N=4; MODEL=claude-opus-5-5; TMO=600;/m);
    expect(fleetSh).toMatch(/claude -p "\$\(cat "\$OUT\/prompt-\$role\.txt"\)" \\\n\s+--model "\$MODEL" --effort low \\/);
    expect(fleetSh).not.toMatch(/Sonnet brings/);
    expect(fleetSh).not.toMatch(/Work only your lane/);
  });
});

describe("the fleet, run — what each hunter is handed and how it is launched", () => {
  it("hands each hunter every open address of its own platforms, the three commands and the brief", () => {
    expect(out7.code, out7.stdout.slice(-1500)).toBe(0);
    const prompt = readFileSync(join(run7, "prompt-x.txt"), "utf8");
    // every address of its platforms, id first, liveness kept, exactly as `evidence.py list` printed
    // it — a post whose body the ground already carried included, a closed door left out
    expect(prompt).toContain("L0001\thttps://x.com/dev_one/status/1001\tSwitched back after a week\tunchecked");
    expect(prompt).toContain("L0002\thttps://x.com/dev_two/status/1002\tFull text carried by the ground\talive");
    expect(prompt).toContain("L0003\thttps://bsky.app/profile/dev3.bsky.social/post/3k2\t");
    expect(prompt, "a closed door is already recorded, not on the list").not.toContain("L0007\t");
    expect(prompt, "a Reddit row is the forums hunter's").not.toContain("L0004\t");
    expect(flat(prompt)).toContain("x: 1 with a body · 1 without a body · 1 closed doors (skipped)");
    expect(flat(prompt)).toContain("bluesky: 0 with a body · 1 without a body · 0 closed doors (skipped)");
    // the three commands, with the engine's own path and this run's path spelled out
    const evi = `python3 "${join(b.engine, "scripts", "evidence.py")}"`;
    for (const verb of ["fetch", "add", "list", "show"]) expect(prompt).toContain(`${evi} ${verb} "${run7}"`);
    expect(prompt).toContain(`${run7}/bodies/<sha256 of the address>.txt`);
    const f = flat(prompt);
    expect(f).toContain("A batch whose ids carry no verdict is not finished reading.");
    expect(f).toContain("Read every address on your list. Every quote you keep goes in with `add`.");
    expect(f).toContain("recorded by `fetch` (it writes the closed door itself), never skipped in silence");
    expect(f).toContain("A decisive address on another platform is added the same way: it is never lost.");
    expect(f).toContain('"okunacak adres kalmadı"');
    expect(f).toMatch(/You have 30 s \(0 min\); the fleet stops you at \d\d:\d\d:\d\d\. Stop reading at \d\d:\d\d:\d\d/);
    expect(f).not.toMatch(/Work only your lane|six blocks/);
    // every open row is on exactly one hunter's list (forums has Reddit, video YouTube, counter the web);
    // the closed door is on none
    const lists = readdirSync(run7).filter((n) => /^list-.+\.tsv$/.test(n));
    expect(lists.sort()).toEqual(SEVEN.map((r) => `list-${r}.tsv`).sort());
    const owner: Record<string, string[]> = {};
    for (const n of lists) {
      for (const line of readFileSync(join(run7, n), "utf8").split("\n").filter(Boolean)) {
        (owner[line.split("\t")[0]] ??= []).push(n);
      }
    }
    expect(owner).toEqual({
      L0001: ["list-x.tsv"], L0002: ["list-x.tsv"], L0003: ["list-x.tsv"], L0004: ["list-forums.tsv"],
      L0005: ["list-counter.tsv"], L0006: ["list-video.tsv"],
    });
  });

  it("launches every hunter on his model at low effort, with its own name in its environment", () => {
    for (const role of SEVEN) {
      const argv = readFileSync(join(run7, `work-${role}`, "launch.txt"), "utf8").split("\n");
      expect(argv[argv.indexOf("--model") + 1], role).toBe("claude-opus-5-5");
      expect(argv[argv.indexOf("--effort") + 1], role).toBe("low");
      expect(argv, role).toContain(`DXB_HUNTER=${role}`);
    }
  });

  it("ends with the counted summary and the coverage table, before the answer is called ready", () => {
    const s = out7.stdout;
    const table = s.indexOf("KAPSAMA — nereye bakildi");
    expect(table, s.slice(-1500)).toBeGreaterThan(-1);
    expect(s.indexOf(`KAPSAMA-STAND-IN run=${run7}`)).toBeGreaterThan(table);
    expect(s.indexOf("CEVAP HAZIR")).toBeGreaterThan(table);
    const summary = readFileSync(join(run7, "SUMMARY.txt"), "utf8");
    expect(summary).toMatch(/^x\s+3\s+1$/m); // the ledger: three X addresses, one with a body
    expect(summary).toMatch(/^\s+\[x\] PLATFORM x: bulundu 1 \/ okundu 1/m);
  });

  it("names a platform no hunter of the run owns, instead of dropping it", () => {
    const r = fleet(join(b.root, "run-two"), "--q", "astra 6 vs fable 5.1", "--roles", "x,forums", "--timeout", "30");
    expect(r.stdout).toMatch(/!! SAHIPSIZ PLATFORM: .*\byoutube\b.*\bweb\b/);
  }, 90_000);
});

describe("merge.py — the summary counts; it does not narrate", () => {
  it("counts the ledger per platform and prints each hunter's own lines, never its prose", () => {
    const dir = join(b.root, "merge-run");
    cpSync(join(FX, "merge-run"), dir, { recursive: true });
    const out = execFileSync("python3", [join(b.engine, "fleet", "merge.py"), dir, "--crowd", join(dir, "crowd-count.txt")],
      { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    // the ledger: distinct addresses found · distinct addresses with a body (two quotes, one address)
    expect(out).toMatch(/^x\s+3\s+1$/m);
    expect(out).toMatch(/^reddit\s+2\s+1$/m);
    expect(out).toMatch(/^tiktok\s+0\s+0$/m); // zero is printed — a platform not printed cannot be asked about
    expect(out).toMatch(/^TOPLAM\s+6\s+2$/m);
    // each hunter's lines, as its claim; an id the ledger does not hold is named
    expect(out).toContain("[x] PLATFORM x: bulundu 3 / okundu 1 / okunmadı: 1 — süre bitti / kapı kapalı: 1 × HTTP 429");
    expect(out).toContain("[forums] PLATFORM reddit: bulundu 2 / okundu 1");
    expect(out).toMatch(/\[x\] KULLANDIGIM SATIRLAR: 3 kimlik — defterde 2 · DEFTERDE YOK 1: L0999/);
    expect(out).toMatch(/\[forums\] okunacak adres kalmadi/);
    // no prose: the paragraph is counted, never printed
    expect(out).not.toContain("nesir paragrafıdır");
    expect(out).toMatch(/\[x\] \+1 satir nesir — ozete alinmadi/);
    expect(out).toMatch(/INSAN \(sayildi\): 7 ayri kisi · 10 yorum · 2 baslik/);
  });
});
