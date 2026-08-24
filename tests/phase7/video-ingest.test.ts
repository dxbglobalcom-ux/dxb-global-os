import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { commitMemory, recallMemory } from "../../packages/memory-router/src/index.js";
import {
  ingestVideo,
  ytDlpArgs,
  type DownloadResult,
  type IngestDeps,
} from "../../tools/video-learn/src/ingest.js";
import { classifyDepartment, generateSections } from "../../tools/video-learn/src/generate.js";

// 07-07 (VID-01, master step 10): link → transcript → sections → quarantined
// memory rows through the single door. Deterministic battery via the stage
// seams; live e2e gated behind DXB_LIVE_SDK=1 (real yt-dlp + Speaches over the
// VPS voice profile + real routing_rules models).

const LIVE = process.env.DXB_LIVE_SDK === "1";
const db = getDb();

const RUN = randomUUID().slice(0, 8);
const FIXTURE_URL = `https://example.invalid/watch?v=fix-${RUN}`;
const TRANSCRIPT =
  "Welcome to the channel. Today we compare three marketing attribution models " +
  "and show how UTM tagging feeds the funnel dashboard used by growth teams.";
const SECTIONS = {
  summary: "Video, pazarlama attribution modellerini ve UTM etiketlemeyi anlatıyor.",
  executive_summary: "CEO özeti: attribution modeli seçimi funnel görünürlüğünü belirliyor.",
  key_concepts: [`UTM tagging maps campaign clicks to funnel stages (test ${RUN}).`],
  action_items: ["Funnel dashboard'a UTM alanı ekle."],
};
const EXPLANATION = "Detaylı açıklama: attribution modeli, hangi kanalın satışı getirdiğini gösterir.";

const DIM = 1536;
const fakeEmbed = async (): Promise<number[]> => {
  const v = new Array<number>(DIM).fill(0);
  v[7] = 1;
  return v;
};

/** Real door, deterministic seams (no LLM on the commit path). */
const seamCommit: NonNullable<IngestDeps["commit"]> = (dbArg, input) =>
  commitMemory(dbArg, input, { embed: fakeEmbed, judgeContradiction: async () => false });

const downloadCalls: Array<{ url: string; workdir: string }> = [];
const fakeDownload = async (url: string, workdir: string): Promise<DownloadResult> => {
  downloadCalls.push({ url, workdir });
  return {
    audioPath: `${workdir}/fix.mp3`,
    meta: {
      video_id: `fix-${RUN}`,
      title: "Attribution models explained",
      channel: "growth-channel",
      upload_date: "20260701",
      duration_s: 61,
      url,
    },
  };
};

const baseDeps: IngestDeps = {
  download: fakeDownload,
  stt: async () => TRANSCRIPT,
  classifyDept: async () => "marketing",
  generate: async () => SECTIONS,
  explain: async (a) => `${EXPLANATION} [mode=${a.mode}]`,
  commit: seamCommit,
};

async function rowsForSource(source: string) {
  return db
    .selectFrom("memory_index")
    .select(["id", "kind", "trust_tier", "ref"])
    .select(sql<string>`provenance->>'artifact_path'`.as("artifact_path"))
    .where(sql<boolean>`provenance->>'source' = ${source}`)
    .execute();
}

const cleanupSources: string[] = [FIXTURE_URL];

afterAll(async () => {
  for (const src of cleanupSources) {
    const rows = await rowsForSource(src);
    for (const r of rows) {
      if (r.ref.startsWith("memory-store/")) await rm(r.ref, { force: true });
      await db.deleteFrom("memory_embeddings").where("index_id", "=", r.id).execute().catch(() => {});
      await db.deleteFrom("memory_index").where("id", "=", r.id).execute();
    }
  }
  await closeDb();
});

describe("video-ingest deterministic battery", () => {
  it("happy path: every section lands as a SEPARATE quarantined row through the door", async () => {
    const res = await ingestVideo(FIXTURE_URL, {}, baseDeps);

    // CEO req 1+5: transcript / summary / executive / explanation / concepts /
    // actions are separate rows; raw transcript retrievable apart from outputs.
    const sections = res.sections.map((s) => s.section);
    for (const want of ["transcript", "summary", "executive", "explanation-detailed", "concepts", "actions"]) {
      expect(sections).toContain(want);
    }
    // rule 1: origin 'video' → EVERYTHING quarantined (fact + artifacts)
    expect(res.sections.every((s) => s.trust_tier === "quarantined")).toBe(true);
    expect(res.department).toBe("marketing");

    const rows = await rowsForSource(FIXTURE_URL);
    expect(rows.length).toBe(res.sections.length);
    expect(rows.every((r) => r.trust_tier === "quarantined")).toBe(true);
    const transcriptRow = rows.find((r) => r.artifact_path === `video/fix-${RUN}/transcript.md`);
    const explanationRow = rows.find((r) => r.artifact_path === `video/fix-${RUN}/explanation-detailed.md`);
    expect(transcriptRow).toBeDefined();
    expect(explanationRow).toBeDefined();
    expect(transcriptRow!.id).not.toBe(explanationRow!.id);

    // raw transcript stored verbatim; department metadata in front-matter
    const body = await readFile(transcriptRow!.ref, "utf8");
    expect(body).toContain(TRANSCRIPT);
    expect(body).toContain('department: "marketing"');

    // 06-05 trust semantics: trusted recall EXCLUDES, include-quarantined FINDS
    const ourIds = new Set(rows.map((r) => r.id));
    const trusted = await recallMemory(db, { query: "video artifact", kind: "artifact", limit: 20 });
    expect(trusted.rows.some((m) => ourIds.has(m.id))).toBe(false);
    const widened = await recallMemory(db, {
      query: "video artifact",
      kind: "artifact",
      trust: "include-quarantined",
      limit: 20,
    });
    expect(widened.rows.some((m) => ourIds.has(m.id))).toBe(true);
  });

  it("dead STT fails the job loudly with ZERO rows (atomicity, T-07-27)", async () => {
    const url = `https://example.invalid/watch?v=dead-${RUN}`;
    cleanupSources.push(url);
    await expect(
      ingestVideo(url, {}, { ...baseDeps, stt: async () => { throw new Error("connect ECONNREFUSED"); } }),
    ).rejects.toThrow(/^video-ingest:stt:/);
    expect((await rowsForSource(url)).length).toBe(0);
  });

  it("unparseable generator output rejects loudly, nothing filed (T-06-21)", async () => {
    const url = `https://example.invalid/watch?v=junk-${RUN}`;
    cleanupSources.push(url);
    const muteModel = async () =>
      ({ content: "no json here", model: "m", usage: { prompt_tokens: 1, completion_tokens: 1 } });
    await expect(
      ingestVideo(url, {}, {
        ...baseDeps,
        generate: (a) => generateSections(db, a, muteModel),
      }),
    ).rejects.toThrow(/^video-ingest:generate:.*unparseable/);
    expect((await rowsForSource(url)).length).toBe(0);
  });

  it("yt-dlp invocation: URL is ONE argv element with the card's guard flags (T-07-25)", async () => {
    const evil = 'https://example.invalid/watch?v=x"; rm -rf / #';
    const args = ytDlpArgs(evil, "/tmp/wd");
    expect(args[args.length - 1]).toBe(evil); // verbatim single element, no concat
    expect(args).toContain("--no-playlist");
    expect(args).toContain("--max-filesize");
    expect(args[args.indexOf("--max-filesize") + 1]).toBe("500m");
    expect(args).toContain("--write-info-json");
    // and the pipeline passes the url through unmodified
    expect(downloadCalls.length).toBeGreaterThan(0);
    expect(downloadCalls[0].url).toBe(FIXTURE_URL);
  });

  it("department: unsure/unparseable classifier lands research, NEVER ops (CEO req 3)", async () => {
    const garbage = async () =>
      ({ content: "definitely-not-json", model: "m", usage: { prompt_tokens: 1, completion_tokens: 1 } });
    expect(await classifyDepartment(db, { title: "t", transcript: "x" }, garbage)).toBe("research");
    const wrongDept = async () =>
      ({ content: '{"department":"sales"}', model: "m", usage: { prompt_tokens: 1, completion_tokens: 1 } });
    expect(await classifyDepartment(db, { title: "t", transcript: "x" }, wrongDept)).toBe("research");
  });

  it("mode eli5 → explanation-eli5.md path and the mode reaches the explainer (CEO req 2)", async () => {
    const url = `https://example.invalid/watch?v=mode-${RUN}`;
    cleanupSources.push(url);
    let seenMode = "";
    const res = await ingestVideo(url, { mode: "eli5" }, {
      ...baseDeps,
      download: async (u, wd) => {
        const d = await fakeDownload(u, wd);
        return { ...d, meta: { ...d.meta, video_id: `mode-${RUN}`, url: u } };
      },
      explain: async (a) => {
        seenMode = a.mode;
        return "ilk kez okuyan için anlatım";
      },
    });
    expect(seenMode).toBe("eli5");
    expect(res.sections.map((s) => s.section)).toContain("explanation-eli5");
    const rows = await rowsForSource(url);
    expect(rows.some((r) => r.artifact_path === `video/mode-${RUN}/explanation-eli5.md`)).toBe(true);
  });
});

describe.skipIf(!LIVE)("video-ingest LIVE e2e (DXB_LIVE_SDK=1)", () => {
  // Real chain: yt-dlp (pinned 2026.07.04, local) → Speaches STT (VPS voice
  // profile through the ssh tunnel at DXB_SPEACHES_URL) → routing_rules
  // classify/generate/explain → quarantined rows in the local db.
  const SHORT_VIDEO = process.env.DXB_LIVE_VIDEO_URL ?? "https://www.youtube.com/watch?v=jNQXAC9IVRw";

  it("short real video becomes quarantined memory through the door", async () => {
    const res = await ingestVideo(SHORT_VIDEO, {}, {});
    cleanupSources.push(SHORT_VIDEO);
    expect(res.sections.length).toBeGreaterThanOrEqual(4);
    expect(res.sections.every((s) => s.trust_tier === "quarantined")).toBe(true);
    const rows = await rowsForSource(SHORT_VIDEO);
    expect(rows.some((r) => r.artifact_path?.endsWith("/transcript.md"))).toBe(true);
    console.log(
      "LIVE_INGEST_OK",
      res.video_id,
      res.department,
      res.sections.map((s) => `${s.section}:${s.index_id.slice(0, 8)}`).join(" "),
    );
  }, 900_000);
});
