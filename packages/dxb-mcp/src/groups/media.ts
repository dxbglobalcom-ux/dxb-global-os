import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { sql } from "kysely";
import { z } from "zod";
import { extractFrames, getDb, probeMedia } from "@dxb/shared";

// B43 — THE STUDIO'S HANDS (CEO 2026-09-03: "Önce elleri kur, sonra stüdyo kendisi
// yapsın"). Five doors, the approval group's shape: an expert BIRTHS a job row and a
// separate resident process (the scheduler's media lane) executes it on the card.
//   media_submit  — a job into the job book (still · shoot · upscale · assemble · probe)
//   media_status  — read one job
//   media_wait    — block up to 25 min for a job, renewing the calling task's lease
//                   every loop (a 900 s lease would otherwise be reaped mid-render)
//   media_probe   — ffprobe + frames into the expert's own eye (image content)
//   media_cancel  — queued → cancelled; running → the lane is asked to stop
// No engine runs inside this process: the tool returns in milliseconds, the
// minutes happen in the lane, and every row is visible on the CEO's screen (B32).
// Money never leaves the company here — these are the holding's own engines.

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

/** The job book's work root, read AT CALL TIME and never at import.
 *
 *  W8 (CEO 2026-09-15): this was an `export const` evaluated the moment this module was
 *  imported. Both b43 suites set the env var inside `beforeAll`, which in ESM always runs
 *  AFTER the imports are resolved, so the redirect could never take effect and every test
 *  run wrote probe frames into the HOLDING'S PRODUCTION root. Measured before the fix: 105
 *  directories, 79 MB, 17 of them written that day by the builder's and the checker's own
 *  runs. A constant that reads the environment at import cannot be redirected by anything
 *  that runs later — which is everything. */
export function mediaWorkRoot(): string {
  return process.env.DXB_MEDIA_WORK_ROOT ?? "/home/dxb/tools/h3/jobs";
}

/** Files an expert may probe: the job book's own work root plus the station's
 *  engine folders. Anything else is refused — a probe tool is not a file reader. */
function allowedProbeRoots(): string[] {
  const extra = (process.env.DXB_MEDIA_PROBE_ROOTS ?? "").split(":").filter(Boolean);
  return [
    mediaWorkRoot(),
    process.env.DXB_H3_DIR ?? "/home/dxb/tools/h3",
    process.env.DXB_COMFY_DIR ?? "/home/dxb/tools/ComfyUI",
    process.env.DXB_COMFY_UPSCALE_DIR ?? "/home/dxb/tools/ComfyUI-upscale",
    ...extra,
  ].map((r) => resolve(r));
}

export function assertProbeAllowed(path: string): string {
  const abs = resolve(path);
  if (!allowedProbeRoots().some((root) => abs === root || abs.startsWith(root + "/"))) {
    throw new Error(`media_probe: '${path}' is outside the studio's folders`);
  }
  return abs;
}

const BASENAME = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9._-]+$/, "a bare file name: letters, digits, . _ -");
const ABSPATH = z.string().min(1).regex(/^\//, "an absolute path");

// Per-kind parameter contracts. They mirror the station's own drivers
// (tools/h3/run.py, img.py, upscale/seedvr2_graph.py, ffmpeg) so an
// expert cannot submit a job the lane cannot run — the defect is refused at the
// step that would produce it, not discovered twenty minutes later.
export const PARAM_SCHEMAS = {
  still: z.object({
    prompt: z.string().min(1),
    out: BASENAME.regex(/\.png$/, "a .png name"),
    w: z.number().int().min(256).max(2048).optional(),
    h: z.number().int().min(256).max(2048).optional(),
    steps: z.number().int().min(1).max(60).optional(),
    guidance: z.number().min(0).max(20).optional(),
    seed: z.number().int().min(0).optional(),
  }),
  shoot: z.object({
    prompt: z.string().min(1),
    seconds: z.number().min(0.5).max(15.1),
    width: z.number().int().min(256).max(1344),
    height: z.number().int().min(256).max(1344),
    steps: z.number().int().min(1).max(30).optional(),
    seed: z.number().int().min(0).optional(),
    prefix: z.string().min(1).max(60).regex(/^[A-Za-z0-9_/-]+$/),
    first_frame: ABSPATH.optional(),
    last_frame: ABSPATH.optional(),
    refs: z.array(ABSPATH).max(9).optional(),
    ref_audio: z.array(ABSPATH).max(3).optional(),
    ref_size: z.enum(["match", "max"]).optional(),
    lora: BASENAME.optional(),
    no_lora: z.boolean().optional(),
    negative: z.string().optional(),
    cfg: z.number().min(0).max(20).optional(),
  }),
  upscale: z.object({
    file: ABSPATH,
    model: z.enum(["3b", "7b"]),
    target: z.number().int().min(720).max(2160),
    color: z.enum(["lab", "wavelet", "adain", "none"]).optional(),
    seed: z.number().int().min(0).optional(),
    overlap: z.number().int().min(0).max(16).optional(),
  }),
  assemble: z.object({
    clips: z
      .array(z.object({ file: ABSPATH, trim_start: z.number().min(0).optional(), trim_end: z.number().min(0).optional() }))
      .min(1)
      .max(40),
    width: z.number().int().min(256).max(4096),
    height: z.number().int().min(256).max(4096),
    fps: z.number().int().min(12).max(60).optional(),
    grade: z.enum(["none", "ugc", "luxury"]).optional(),
    captions: z.array(z.object({ text: z.string().min(1).max(200), from: z.number().min(0), to: z.number().min(0) })).max(60).optional(),
    logo: z
      .object({ file: ABSPATH, width_frac: z.number().min(0.05).max(1).optional(), x_frac: z.number().min(0).max(1).optional(), y_frac: z.number().min(0).max(1).optional(), from: z.number().min(0).optional() })
      .optional(),
    audio: z.array(z.object({ file: ABSPATH, at: z.number().min(0) })).max(60).optional(),
    room_tone_db: z.number().min(-60).max(0).optional(),
    out: BASENAME.regex(/\.mp4$/, "an .mp4 name"),
  }),
  probe: z.object({
    file: ABSPATH,
    at_seconds: z.array(z.number().min(0)).max(6).optional(),
  }),
} as const;

export type MediaKind = keyof typeof PARAM_SCHEMAS;
export const MEDIA_KINDS = Object.keys(PARAM_SCHEMAS) as MediaKind[];

export function parseMediaParams(kind: MediaKind, params: unknown): Record<string, unknown> {
  return PARAM_SCHEMAS[kind].parse(params) as Record<string, unknown>;
}

async function appendAudit(actor: string, action: string, taskId: string | null, payload: unknown): Promise<void> {
  await getDb()
    .insertInto("audit_log")
    .values({ actor, actor_type: "agent", action, task_id: taskId, payload: JSON.stringify(payload) })
    .execute();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function registerMedia(server: McpServer): void {
  server.registerTool(
    "media_submit",
    {
      title: "Submit a media job (media.submit)",
      description:
        "Put one engine job into the studio's job book. The tool returns in milliseconds with the job row; the minutes happen in the resident media lane — wait for it with media_wait, then read output_path. " +
        "Kinds and their params (anything else is refused at submit): " +
        "still {prompt, out: '<name>.png', w?, h?, steps? (28), guidance?, seed?} — a FLUX frame; " +
        "shoot {prompt, seconds ≤ 15.1, width, height (multiples of 32 — the station's proven vertical draft is 640×1152, LAW D: draft first), steps? (4 = the studio standard, ≈ 14 min per 15 s), seed?, prefix (letters/digits/_/-), first_frame?, last_frame?, refs? (≤ 9 absolute paths), ref_audio? (≤ 3), ref_size? 'match'|'max', lora?, no_lora?, negative?, cfg?} — a MiniMax H3 take with the engine's own voice when the prompt carries spoken lines; " +
        "upscale {file, model '3b'|'7b', target 720–2160, color? 'lab'|'wavelet'|'adain'|'none', seed?, overlap?} — SeedVR2, only on the CEO's word (LAW D); " +
        "assemble {clips: [{file, trim_start?, trim_end?}] (≤ 40), width, height, fps? (24), grade? 'none'|'ugc'|'luxury', captions? [{text, from, to}], logo? {file, width_frac?, x_frac?, y_frac?, from?}, audio? [{file, at}], room_tone_db?, out: '<name>.mp4'} — ffmpeg cut/grade/captions/logo/mix; " +
        "probe {file, at_seconds? (≤ 6)} — ffprobe plus frames (media_probe does the same into your own eye).",
      inputSchema: {
        task_id: z.string().uuid(),
        kind: z.enum(["still", "shoot", "upscale", "assemble", "probe"]),
        params: z.record(z.string(), z.unknown()),
        note: z.string().max(300).optional(),
      },
    },
    async ({ task_id, kind, params, note }) => {
      const parsed = parseMediaParams(kind, params);
      const db = getDb();
      const task = await db
        .selectFrom("tasks")
        .select(["id", "agent_id", "department"])
        .where("id", "=", task_id)
        .executeTakeFirst();
      if (!task) throw new Error(`media_submit: task ${task_id} not found`);
      const row = await db
        .insertInto("media_jobs")
        .values({
          task_id: task.id,
          employee_id: task.agent_id ?? null,
          department: task.department,
          kind,
          params: JSON.stringify(parsed),
          note: note ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      await appendAudit(task_id, "media.submit", task_id, { job_id: row.id, kind });
      return ok(row);
    },
  );

  server.registerTool(
    "media_status",
    {
      title: "Read a media job (media.status)",
      description: "The job row: status, wall clock, peak VRAM, output path, result, error.",
      inputSchema: { job_id: z.string().uuid() },
    },
    async ({ job_id }) => {
      const row = await getDb().selectFrom("media_jobs").selectAll().where("id", "=", job_id).executeTakeFirst();
      if (!row) throw new Error(`media_status: job ${job_id} not found`);
      return ok(row);
    },
  );

  server.registerTool(
    "media_wait",
    {
      title: "Wait for a media job (media.wait)",
      description:
        "Block until the job is done/failed/cancelled or max_seconds pass (default 900, max 1500). While waiting, the job's task keeps its lease alive so the reaper cannot take it. Returns the row plus timed_out.",
      inputSchema: {
        job_id: z.string().uuid(),
        max_seconds: z.number().int().min(5).max(1500).default(900),
      },
    },
    async ({ job_id, max_seconds }) => {
      const db = getDb();
      const deadline = Date.now() + max_seconds * 1000;
      const pollMs = Number(process.env.DXB_MEDIA_WAIT_POLL_MS ?? 5000);
      for (;;) {
        const row = await db.selectFrom("media_jobs").selectAll().where("id", "=", job_id).executeTakeFirst();
        if (!row) throw new Error(`media_wait: job ${job_id} not found`);
        if (row.status === "done" || row.status === "failed" || row.status === "cancelled") {
          return ok({ ...row, timed_out: false });
        }
        if (Date.now() >= deadline) return ok({ ...row, timed_out: true });
        if (row.task_id) {
          // The lease renewal is the whole point of waiting here rather than
          // polling from the model: a running task is alive, not abandoned.
          await sql`
            UPDATE tasks SET lease_expires_at = now() + interval '900 seconds', updated_at = now()
             WHERE id = ${row.task_id}::uuid AND status IN ('claimed','running')
          `.execute(db);
        }
        await sleep(pollMs);
      }
    },
  );

  server.registerTool(
    "media_probe",
    {
      title: "Probe a media file (media.probe)",
      description:
        "ffprobe summary of a file inside the studio's folders (or of a job's output) plus up to 6 frames at the given seconds, returned as images so the expert judges with its own eye.",
      inputSchema: {
        job_id: z.string().uuid().optional(),
        file: z.string().min(1).optional(),
        at_seconds: z.array(z.number().min(0)).max(6).optional(),
      },
    },
    async ({ job_id, file, at_seconds }) => {
      let path = file ?? null;
      if (job_id) {
        const row = await getDb().selectFrom("media_jobs").select(["output_path", "status"]).where("id", "=", job_id).executeTakeFirst();
        if (!row) throw new Error(`media_probe: job ${job_id} not found`);
        if (!row.output_path) throw new Error(`media_probe: job ${job_id} has no output yet (status ${row.status})`);
        path = row.output_path;
      }
      if (!path) throw new Error("media_probe: give job_id or file");
      const abs = assertProbeAllowed(path);
      const summary = await probeMedia(abs);
      const isVideo = summary.video !== null && (summary.duration_s ?? 0) > 0;
      const stamps =
        at_seconds && at_seconds.length > 0
          ? at_seconds
          : isVideo
            ? [0, (summary.duration_s ?? 0) / 2, Math.max(0, (summary.duration_s ?? 0) - 0.05)]
            : summary.video
              ? [0]
              : [];
      const frameDir = join(mediaWorkRoot(), "probes", `${Date.now()}`);
      const frames = stamps.length > 0 ? await extractFrames(abs, stamps, frameDir) : [];
      const content: Array<
        { type: "text"; text: string } | { type: "image"; data: string; mimeType: string }
      > = [{ type: "text", text: JSON.stringify({ ...summary, frames }) }];
      for (const f of frames) {
        content.push({ type: "image", data: readFileSync(f).toString("base64"), mimeType: "image/png" });
      }
      return { content };
    },
  );

  server.registerTool(
    "media_cancel",
    {
      title: "Cancel a media job (media.cancel)",
      description: "A queued job is cancelled at once; a running job is asked to stop (the lane kills the engine process).",
      inputSchema: { job_id: z.string().uuid(), reason: z.string().max(300).optional() },
    },
    async ({ job_id, reason }) => {
      const db = getDb();
      const row = await db.selectFrom("media_jobs").selectAll().where("id", "=", job_id).executeTakeFirst();
      if (!row) throw new Error(`media_cancel: job ${job_id} not found`);
      let updated = row;
      if (row.status === "queued") {
        updated = await db
          .updateTable("media_jobs")
          .set({ status: "cancelled", ended_at: sql`now()`, error: reason ?? "cancelled", updated_at: sql`now()` })
          .where("id", "=", job_id)
          .where("status", "=", "queued")
          .returningAll()
          .executeTakeFirstOrThrow();
      } else if (row.status === "running") {
        updated = await db
          .updateTable("media_jobs")
          .set({ cancel_requested: true, updated_at: sql`now()` })
          .where("id", "=", job_id)
          .returningAll()
          .executeTakeFirstOrThrow();
      }
      await appendAudit(row.task_id ?? "media", "media.cancel", row.task_id, { job_id, reason: reason ?? null, was: row.status });
      return ok(updated);
    },
  );
}
