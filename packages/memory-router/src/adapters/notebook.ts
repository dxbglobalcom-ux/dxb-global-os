// open-notebook adapter (study card open-notebook.md, 06-01 — pinned image
// lfnovo/open_notebook:1.10.0; spike 06-02 CONFIRMED procedure→notebook).
// Card contract: FastAPI REST on port 5055, base URL carried by env
// DXB_NOTEBOOK_URL (default 127.0.0.1 compose port — local-only binding,
// T-06-19/T-06-03). Documented surface (live OpenAPI, /docs — verified
// 2026-07-09):
//   POST /api/notes {title, content, note_type} -> NoteResponse { id, ... }
//   GET  /api/notes/{note_id}                   -> NoteResponse { id, content, ... }
//   DELETE /api/notes/{note_id}
// ref = SERVER-ASSIGNED note id (SurrealDB record id) — write-policy updates
// the memory_index ref inside the same transaction after the writer returns.
// Reachable ONLY through write-policy's registry (T-06-12) on the write side.

/** Typed loud failure when the container is down/unreachable — recall and
 *  commit stay honest when the service sleeps (never silently empty). */
export class NotebookDownError extends Error {
  constructor(cause: string) {
    super(
      `open-notebook is unreachable at ${notebookBaseUrl()} — start it: ` +
        `docker compose -f vps/open-notebook/compose.local.yml up -d (06-01). Cause: ${cause}`,
    );
    this.name = "NotebookDownError";
  }
}

export function notebookBaseUrl(): string {
  return process.env.DXB_NOTEBOOK_URL ?? "http://127.0.0.1:5055";
}

async function nbFetch(path: string, init?: RequestInit): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${notebookBaseUrl()}${path}`, {
      ...init,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    throw new NotebookDownError((e as Error).message);
  }
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`open-notebook ${path} -> ${res.status}: ${body.slice(0, 200)}`);
  }
  return body ? JSON.parse(body) : null;
}

export interface NotebookDocArgs {
  indexId: string;
  body: string;
}

/** Create one procedure doc; returns the server-assigned note id as ref. */
export async function writeDoc({ indexId, body }: NotebookDocArgs): Promise<string> {
  const data = (await nbFetch("/api/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: `memory ${indexId}`, content: body, note_type: "ai" }),
  })) as { id?: unknown };
  if (typeof data?.id !== "string" || data.id.length === 0) {
    throw new Error("open-notebook: note created but response carried no id");
  }
  return data.id;
}

/** Fetch a doc body back by its note-id ref. Loud on 404/downtime. */
export async function readDoc(ref: string): Promise<string> {
  const data = (await nbFetch(`/api/notes/${encodeURIComponent(ref)}`)) as {
    content?: string | null;
  };
  return data.content ?? "";
}

/** Test/ops cleanup surface (documented DELETE endpoint). */
export async function deleteDoc(ref: string): Promise<void> {
  await nbFetch(`/api/notes/${encodeURIComponent(ref)}`, { method: "DELETE" });
}
