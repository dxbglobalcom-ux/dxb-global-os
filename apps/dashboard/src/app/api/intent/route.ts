import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Intent seam (DASH-02): the dashboard's 2nd and last pre-CRM write path —
// one INSERT of the CEO's RAW text into intents (purity-allowlisted). No
// model call, no interpretation here: the kernel-side intake worker owns
// classify→decompose→dispatch. Column-level grants (migration 0016) force
// status='received'; anything beyond text/lang/source/actor is unwritable
// from this session even if this code regressed.
const IntentBody = z.object({
  text: z.string().trim().min(1).max(500),
  lang: z.enum(["tr", "en"]).default("en"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: z.infer<typeof IntentBody>;
  try {
    body = IntentBody.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("intents")
    .insert({ text: body.text, lang: body.lang, source: "dashboard", actor: "ceo" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ intentId: data.id }, { status: 201 });
}
