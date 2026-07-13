// Local spill for failed observability flushes (OBSERVABILITY_SPEC §17-19):
// data loss is not accepted, latency is. A flush that fails its retries lands
// here as JSONL and is replayed by restoreSpill() at the next scope opening.
// Spill failure itself is swallowed after a loud log line — observation must
// NEVER block or crash the agent path (spec §3 ⛔).
import { appendFileSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export type SpillRow = { table: "tool_calls" | "file_changes"; row: Record<string, unknown> };

export function spillDir(): string {
  return process.env.OBS_SPILL_DIR ?? "/var/lib/dxb/obs-spill";
}

export function spill(rows: SpillRow[]): boolean {
  try {
    const dir = spillDir();
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `obs-spill-${Date.now()}-${process.pid}.jsonl`);
    appendFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    return true;
  } catch (err) {
    // Last resort: the observation is lost to disk too — log the evidence gap
    // loudly. (Alert row lands with E8.4b's alerts table — recorded boundary.)
    console.error("[obs] SPILL FAILED — observation rows lost:", err);
    return false;
  }
}

// Replays every spill file through the given inserter; a file is deleted only
// after ALL its rows inserted. Insert errors leave the file for the next try.
export async function restoreSpill(
  insert: (rows: SpillRow[]) => Promise<void>,
): Promise<{ files: number; rows: number }> {
  let files = 0;
  let rows = 0;
  let names: string[];
  try {
    names = readdirSync(spillDir()).filter((n) => n.endsWith(".jsonl"));
  } catch {
    return { files: 0, rows: 0 }; // no spill dir = nothing to restore
  }
  for (const name of names) {
    const path = join(spillDir(), name);
    try {
      const parsed = readFileSync(path, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as SpillRow);
      if (parsed.length > 0) await insert(parsed);
      unlinkSync(path);
      files += 1;
      rows += parsed.length;
    } catch (err) {
      console.error(`[obs] spill restore failed for ${name} (kept for retry):`, err);
    }
  }
  return { files, rows };
}
