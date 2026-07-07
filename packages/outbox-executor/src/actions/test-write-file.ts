// Harmless v1 proof handler (GATE-02 e2e evidence): writes payload {path, content}
// to a file CONFINED under tmp/outbox-proof/. Write-once per idempotency key —
// re-execution with the same key is a recorded skip, not a second effect.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { z } from "zod";

const Payload = z.object({
  path: z.string().min(1),
  content: z.string(),
});

const CONFINE_ROOT = resolve(process.cwd(), "tmp", "outbox-proof");

export async function testWriteFile(payload: unknown, idempotencyKey: string): Promise<unknown> {
  const { path, content } = Payload.parse(payload);

  // Path-traversal guard (T-4-09): no absolute paths, no escaping the confine
  // root after resolution.
  if (isAbsolute(path)) throw new Error(`test.write_file refuses absolute path: ${path}`);
  const target = resolve(CONFINE_ROOT, path);
  if (target !== CONFINE_ROOT && !target.startsWith(CONFINE_ROOT + sep)) {
    throw new Error(`test.write_file refuses path escaping tmp/outbox-proof/: ${path}`);
  }

  // Write-once proof: first line of the file is the idempotency key marker.
  const marker = `# idempotency_key: ${idempotencyKey}`;
  try {
    const existing = await readFile(target, "utf8");
    if (existing.startsWith(marker)) {
      return { skipped: true, reason: "idempotency marker already present", path: target };
    }
  } catch {
    // file absent — first write
  }

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${marker}\n${content}\n`, "utf8");
  return { written: true, path: target };
}
