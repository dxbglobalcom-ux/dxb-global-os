import { appendFile, chmod, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Model API-key vault seam (C12, 2026-07-19): a key entered on the Models
// page goes to a chmod-600 env file OUTSIDE the repo — never the database,
// never a log (A8 vault rule; no plaintext credentials in repo or prompts).
// The scheduler/LiteLLM wiring reads the file at provider-integration time.
// The audit trail records THAT a key was stored, never the key itself.

const Body = z.object({
  modelId: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9.-]+$/),
  apiKey: z.string().min(8).max(500),
  note: z.string().max(300).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const dir = join(homedir(), ".dxb");
  const file = join(dir, "model-keys.env");
  const envName = `MODEL_KEY_${body.modelId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  try {
    await mkdir(dir, { recursive: true });
    await appendFile(file, `${envName}=${body.apiKey}\n`, { mode: 0o600 });
    await chmod(file, 0o600);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "vault_write_failed", detail: (e as Error).message },
      { status: 500 },
    );
  }

  await supabase.from("audit_log").insert({
    actor: auth.user.email ?? "ceo",
    actor_type: "ceo",
    action: "model.key_stored",
    payload: {
      model_id: body.modelId,
      env_name: envName,
      vault: "~/.dxb/model-keys.env",
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ ok: true, envName });
}
