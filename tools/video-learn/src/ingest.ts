// video-learn ingest (07-07, VID-01 / master step 10): CEO drops a video link →
// yt-dlp audio extract → Speaches STT → department classification → structured
// generation → CEO-facing mode-based explanation → commitMemory(origin:'video').
// Rule 1 of the write policy quarantines EVERY row born here (untrusted external
// input, T-07-24) — promotion is the explicit human path.
//
// CEO reqs (2026-07-09 approval round): multiple SEPARATE artifacts per video
// (raw transcript kept verbatim, apart from the readable outputs — req 5),
// output modes, content-inferred department (never default-ops), highest-tier
// final explanation, ergonomic CLI (cli.ts).
//
// Every stage is seam-injectable and fails typed-loud with a
// `video-ingest:<stage>:` prefix — a dead Speaches container must fail the job,
// not fake a transcript (T-07-27). Stage order puts all fallible externals
// BEFORE the commits; the per-section commits are sequential single-row
// transactions (commitMemory owns its tx), so a mid-sequence crash leaves a
// prefix of sections, never a torn row.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type Kysely } from "kysely";
import { getDb, type DB } from "@dxb/shared";
import { commitMemory } from "@dxb/memory-router";
import {
  classifyDepartment,
  explainForCeo,
  generateSections,
  resolveAttribution,
  DEFAULT_MODE,
  type Department,
  type GeneratedSections,
  type OutputMode,
} from "./generate.js";

const execFileAsync = promisify(execFile);

export { OUTPUT_MODES, DEFAULT_MODE, DEPARTMENTS, type OutputMode, type Department } from "./generate.js";

export interface VideoMeta {
  video_id: string;
  title: string;
  channel: string;
  upload_date: string;
  duration_s: number | null;
  url: string;
}

export interface DownloadResult {
  audioPath: string;
  meta: VideoMeta;
}

export interface IngestOpts {
  /** CEO override; absent → classified from content (research when unsure). */
  department?: Department;
  /** Explanation style (CEO req 2); default 'detailed'. */
  mode?: OutputMode;
  taskId?: string | null;
  /** Working dir for the download; default mkdtemp, removed afterwards. */
  workdir?: string;
}

export interface IngestDeps {
  download?: (url: string, workdir: string) => Promise<DownloadResult>;
  stt?: (audioPath: string) => Promise<string>;
  classifyDept?: (args: { title: string; transcript: string }) => Promise<Department>;
  generate?: (args: {
    department: string;
    title: string;
    transcript: string;
  }) => Promise<GeneratedSections>;
  explain?: (args: {
    department: string;
    title: string;
    transcript: string;
    sections: GeneratedSections;
    mode: OutputMode;
  }) => Promise<string>;
  commit?: typeof commitMemory;
}

export interface IngestedSection {
  section: string;
  index_id: string;
  ref: string;
  trust_tier: string;
}

export interface IngestResult {
  video_id: string;
  title: string;
  department: Department;
  attribution_fallback: boolean;
  mode: OutputMode;
  sections: IngestedSection[];
}

/** study-card verbatim invocation (yt-dlp-video-use.md) — array args ONLY, the
 *  URL is one argv element, never concatenated into a shell string (T-07-25). */
export function ytDlpArgs(url: string, workdir: string): string[] {
  return [
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "5",
    "--no-playlist",
    "--max-filesize",
    "500m",
    "--write-info-json",
    "-o",
    `${workdir}/%(id)s.%(ext)s`,
    url,
  ];
}

async function defaultDownload(url: string, workdir: string): Promise<DownloadResult> {
  await execFileAsync("yt-dlp", ytDlpArgs(url, workdir), { timeout: 600_000 });
  const infoFile = (await readdir(workdir)).find((f) => f.endsWith(".info.json"));
  if (!infoFile) throw new Error("yt-dlp finished without an .info.json sidecar");
  const info = JSON.parse(await readFile(join(workdir, infoFile), "utf8")) as Record<string, unknown>;
  const id = String(info.id ?? infoFile.replace(/\.info\.json$/, ""));
  return {
    audioPath: join(workdir, `${id}.mp3`),
    meta: {
      video_id: id,
      title: String(info.title ?? id),
      channel: String(info.channel ?? info.uploader ?? "unknown"),
      upload_date: String(info.upload_date ?? "unknown"),
      duration_s: typeof info.duration === "number" ? info.duration : null,
      url: String(info.webpage_url ?? url),
    },
  };
}

export function speachesBaseUrl(): string {
  return process.env.DXB_SPEACHES_URL ?? "http://127.0.0.1:8001";
}

/** Speaches STT model id (card: faster-whisper small int8). Verified against
 *  the live /v1/models list at the 07-07 evidence run. */
export function sttModel(): string {
  return process.env.DXB_STT_MODEL ?? "Systran/faster-whisper-small";
}

async function defaultStt(audioPath: string): Promise<string> {
  const audio = await readFile(audioPath);
  const form = new FormData();
  form.set("file", new Blob([audio], { type: "audio/mpeg" }), "audio.mp3");
  form.set("model", sttModel());
  // First call after cold start downloads the whisper model — generous timeout
  // (speaches card pitfall).
  const res = await fetch(`${speachesBaseUrl()}/v1/audio/transcriptions`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(600_000),
  });
  if (!res.ok) {
    throw new Error(`speaches STT ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const out = (await res.json()) as { text?: unknown };
  if (typeof out.text !== "string" || out.text.trim() === "") {
    throw new Error("speaches STT returned no transcript text");
  }
  return out.text;
}

function stageFail(stage: string, err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  throw new Error(`video-ingest:${stage}: ${msg}`, { cause: err });
}

function frontMatter(fields: Record<string, string | number | boolean | null>): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join("\n")}\n---\n\n`;
}

export async function ingestVideo(
  url: string,
  opts: IngestOpts = {},
  deps: IngestDeps = {},
): Promise<IngestResult> {
  const db: Kysely<DB> = getDb();
  const mode = opts.mode ?? DEFAULT_MODE;
  const download = deps.download ?? defaultDownload;
  const stt = deps.stt ?? defaultStt;
  const classify = deps.classifyDept ?? ((a) => classifyDepartment(db, a));
  const generate = deps.generate ?? ((a) => generateSections(db, a));
  const explain = deps.explain ?? ((a) => explainForCeo(db, a));
  const commit = deps.commit ?? commitMemory;

  const ownWorkdir = !opts.workdir;
  const workdir = opts.workdir ?? (await mkdtemp(join(tmpdir(), "video-learn-")));
  try {
    // 1. download (attacker-controllable URL → execFile array args only)
    let dl: DownloadResult;
    try {
      dl = await download(url, workdir);
    } catch (e) {
      stageFail("download", e);
    }

    // 2. transcript
    let transcript: string;
    try {
      transcript = await stt(dl.audioPath);
    } catch (e) {
      stageFail("stt", e);
    }

    // 3. department (CEO req 3: content-inferred; unsure → research, never ops)
    let department: Department;
    try {
      department = opts.department ?? (await classify({ title: dl.meta.title, transcript }));
    } catch (e) {
      stageFail("classify", e);
    }
    const attribution = resolveAttribution(department);

    // 4. structured sections (single call: summary/executive/concepts/actions)
    let sections: GeneratedSections;
    try {
      sections = await generate({ department: attribution.department, title: dl.meta.title, transcript });
    } catch (e) {
      stageFail("generate", e);
    }

    // 5. CEO-facing final explanation, highest tier via routing_rules (req 4)
    let explanation: string;
    try {
      explanation = await explain({
        department: attribution.department,
        title: dl.meta.title,
        transcript,
        sections,
        mode,
      });
    } catch (e) {
      stageFail("explain", e);
    }

    // 6. file through the single door — one artifact row per section (req 1+5);
    //    key_concepts additionally as facts (pgvector recall); rule 1 quarantines
    //    everything (origin 'video').
    const meta = {
      video_id: dl.meta.video_id,
      title: dl.meta.title,
      channel: dl.meta.channel,
      upload_date: dl.meta.upload_date,
      duration_s: dl.meta.duration_s,
      url: dl.meta.url,
      department,
      attribution_fallback: attribution.fallback,
    };
    const provenance = {
      agent: "video-learn",
      task_id: opts.taskId ?? null,
      origin: "video" as const,
      source: dl.meta.url,
    };
    const bodies: Array<{ section: string; body: string; facts?: string[] }> = [
      // raw transcript verbatim — exact-evidence retrieval path (req 5)
      { section: "transcript", body: frontMatter({ ...meta, section: "transcript" }) + transcript },
      { section: "summary", body: frontMatter({ ...meta, section: "summary" }) + sections.summary },
      {
        section: "executive",
        body: frontMatter({ ...meta, section: "executive" }) + sections.executive_summary,
      },
      {
        section: `explanation-${mode}`,
        body: frontMatter({ ...meta, section: "explanation", mode }) + explanation,
      },
      ...(sections.key_concepts.length
        ? [
            {
              section: "concepts",
              body:
                frontMatter({ ...meta, section: "concepts" }) +
                sections.key_concepts.map((c) => `- ${c}`).join("\n"),
              facts: sections.key_concepts,
            },
          ]
        : []),
      ...(sections.action_items.length
        ? [
            {
              section: "actions",
              body:
                frontMatter({ ...meta, section: "actions" }) +
                sections.action_items.map((a) => `- ${a}`).join("\n"),
            },
          ]
        : []),
    ];

    const out: IngestedSection[] = [];
    try {
      for (const b of bodies) {
        const { created } = await commit(db, {
          facts: (b.facts ?? []).map((body) => ({ body, kind: "fact" as const, confidence: 0.5 })),
          artifact: { path: `video/${dl.meta.video_id}/${b.section}.md`, body: b.body },
          provenance,
        });
        for (const c of created) {
          out.push({ section: b.section, index_id: c.index_id, ref: c.ref, trust_tier: c.trust_tier });
        }
      }
    } catch (e) {
      stageFail("commit", e);
    }

    return {
      video_id: dl.meta.video_id,
      title: dl.meta.title,
      department,
      attribution_fallback: attribution.fallback,
      mode,
      sections: out,
    };
  } finally {
    if (ownWorkdir) await rm(workdir, { recursive: true, force: true });
  }
}
