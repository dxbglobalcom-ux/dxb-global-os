#!/usr/bin/env node
// video-learn CLI (07-07, CEO req 6):
//   pnpm video-learn ingest <url> [--department <dept>] [--mode <mode>]
//   pnpm video-learn ask <video_id> "<question>"
// ingest files a video through the memory door (quarantined, origin 'video');
// ask answers a CEO question grounded ONLY in the stored raw transcript —
// quarantine binds gated agent decisions (06-05), not an explicit CEO read,
// so the answer is printed WITH a visible quarantine caveat, never silently.
import { readFile } from "node:fs/promises";
import { sql, type Kysely } from "kysely";
import { getDb, closeDb, llmCall, type DB } from "@dxb/shared";
import { ingestVideo } from "./ingest.js";
import {
  routedModel,
  resolveAttribution,
  DEPARTMENTS,
  OUTPUT_MODES,
  FALLBACK_DEPARTMENT,
  type Department,
  type OutputMode,
} from "./generate.js";

const USAGE = `usage:
  video-learn ingest <url> [--department <${DEPARTMENTS.join("|")}>] [--mode <${OUTPUT_MODES.join("|")}>]
  video-learn ask <video_id> "<question>"`;

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function cmdIngest(argv: string[]): Promise<void> {
  const url = argv[0];
  if (!url || url.startsWith("--")) fail(USAGE);
  let department: Department | undefined;
  let mode: OutputMode | undefined;
  for (let i = 1; i < argv.length; i += 2) {
    const flag = argv[i];
    const val = argv[i + 1];
    if (flag === "--department") {
      if (!(DEPARTMENTS as readonly string[]).includes(val)) {
        fail(`unknown department '${val}' — one of: ${DEPARTMENTS.join(", ")}`);
      }
      department = val as Department;
    } else if (flag === "--mode") {
      if (!(OUTPUT_MODES as readonly string[]).includes(val)) {
        fail(`unknown mode '${val}' — one of: ${OUTPUT_MODES.join(", ")}`);
      }
      mode = val as OutputMode;
    } else {
      fail(USAGE);
    }
  }
  const res = await ingestVideo(url, { department, mode });
  console.log(`INGESTED ${res.video_id} — "${res.title}"`);
  console.log(`department: ${res.department}${res.attribution_fallback ? " (spend attributed to 'os' — dept key missing)" : ""}`);
  console.log(`mode: ${res.mode}`);
  for (const s of res.sections) {
    console.log(`  ${s.section.padEnd(20)} ${s.trust_tier.padEnd(12)} ${s.index_id}`);
  }
}

async function cmdAsk(argv: string[]): Promise<void> {
  const [videoId, question] = argv;
  if (!videoId || !question) fail(USAGE);
  const db: Kysely<DB> = getDb();
  const row = await db
    .selectFrom("memory_index")
    .select(["id", "ref", "trust_tier"])
    .where("kind", "=", "artifact")
    .where(sql<boolean>`provenance->>'artifact_path' = ${`video/${videoId}/transcript.md`}`)
    .orderBy("created_at", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!row) fail(`no stored transcript for video_id '${videoId}' — ingest it first`);
  const transcript = await readFile(row.ref, "utf8");
  const model = await routedModel(db, "video.explain");
  const res = await llmCall({
    department: resolveAttribution(FALLBACK_DEPARTMENT).department,
    model,
    maxTokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "Answer the CEO's question about a video, grounded ONLY in the transcript provided — " +
          "no invention beyond it. Answer in the language of the question; keep technical terms verbatim.",
      },
      { role: "user", content: `QUESTION: ${question}\n\nTRANSCRIPT:\n${transcript}` },
    ],
  });
  if (row.trust_tier === "quarantined") {
    console.log("⚠ kaynak karantinalı (origin 'video', doğrulanmamış dış içerik) — cevap transkripte dayanır:\n");
  }
  console.log(res.content.trim());
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === "ingest") await cmdIngest(rest);
  else if (cmd === "ask") await cmdAsk(rest);
  else fail(USAGE);
} finally {
  await closeDb();
}
