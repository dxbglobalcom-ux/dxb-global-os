#!/usr/bin/env node
// SessionEnd hook (KERN-03, 04-04 Task 4): tag subscription-mode Claude Code
// spend into cost_ledger. API-mode rows come from LiteLLM's spend tables; this
// hook covers the calls that never touch the proxy (CLAUDE.md tagging rule).
//
// stdin JSON shape verified 2026-07-08 against live hook docs + a real
// transcript: { session_id, transcript_path, cwd, hook_event_name, source }.
// No hook event carries usage/model, so tokens are summed from the
// transcript's assistant lines (message.model + message.usage).
//
// cost_eur stays 0: subscription calls have no marginal EUR — the row exists
// for per-dept/model/mode accounting (COST-04 view, Phase 8). Token counts
// carry the volume signal.
import { createInterface } from "node:readline";
import { createReadStream, existsSync } from "node:fs";
import { getDb, closeDb } from "@dxb/shared";

interface HookInput {
  session_id?: string;
  transcript_path?: string;
}

interface UsageTotals {
  prompt: number;
  completion: number;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function sumTranscript(path: string): Promise<Map<string, UsageTotals>> {
  const perModel = new Map<string, UsageTotals>();
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of lines) {
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj?.type !== "assistant") continue;
    const model = obj.message?.model;
    const usage = obj.message?.usage;
    if (!model || !usage) continue;
    const totals = perModel.get(model) ?? { prompt: 0, completion: 0 };
    // prompt side includes cache reads/writes — they are real input volume
    totals.prompt +=
      (usage.input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0);
    totals.completion += usage.output_tokens ?? 0;
    perModel.set(model, totals);
  }
  return perModel;
}

async function main(): Promise<void> {
  const input = JSON.parse(await readStdin()) as HookInput;
  const sessionId = input.session_id;
  const transcriptPath = input.transcript_path;
  if (!sessionId || !transcriptPath || !existsSync(transcriptPath)) return;

  process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const db = getDb();

  // v1 idempotency: one SessionEnd per session wins (resume/clear can fire the
  // hook again with a longer transcript; refining to incremental rows is a
  // recorded follow-up, not silent double-counting)
  const { sql } = await import("kysely");
  const existing = await db
    .selectFrom("cost_ledger")
    .select("id")
    .where("mode", "=", "subscription")
    .where(sql<boolean>`meta->>'session_id' = ${sessionId}`)
    .executeTakeFirst();
  if (existing) return;

  const perModel = await sumTranscript(transcriptPath);
  if (perModel.size === 0) return;

  const department = process.env.DXB_DEPARTMENT ?? "engineering";
  const taskId = process.env.DXB_TASK_ID ?? null;

  await db
    .insertInto("cost_ledger")
    .values(
      [...perModel.entries()].map(([model, totals]) => ({
        task_id: taskId,
        department,
        model,
        mode: "subscription",
        prompt_tokens: totals.prompt,
        completion_tokens: totals.completion,
        cost_eur: 0,
        source: "hook",
        meta: JSON.stringify({ session_id: sessionId }),
      })),
    )
    .execute();
}

try {
  await main();
} catch (e) {
  // never block session teardown — report and exit clean
  console.error(`tag-subscription-call: ${String(e).slice(0, 300)}`);
} finally {
  await closeDb().catch(() => {});
}
