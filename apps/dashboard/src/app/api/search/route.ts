import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/search?q= — global search seam (E6.4 / GAP-07, CC-SPEC §8).
// READ-ONLY: one view (v_global_search, 10 entity families), ranked here,
// LIMIT 50 with per-type grouping done by the palette (CC-SPEC §21 "search
// result explosion" rule). No model call, no mutation — pure lookup.

const TYPE_WEIGHT: Record<string, number> = {
  employee: 10,
  department: 9,
  company: 9,
  project: 8,
  workflow: 8,
  task: 7,
  approval: 6,
  decision: 5,
  library: 5,
  audit: 3,
};

type SearchRow = {
  entity_type: string;
  entity_id: string;
  label: string;
  sublabel: string | null;
  href: string;
  haystack: string;
  updated_at: string | null;
};

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Escape ILIKE metacharacters so the CEO can search for literal % / _.
  const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);

  const { data, error } = await supabase
    .from("v_global_search")
    .select("entity_type, entity_id, label, sublabel, href, haystack, updated_at")
    .ilike("haystack", `%${escaped}%`)
    .limit(120);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ranked = ((data ?? []) as SearchRow[])
    .map((row) => {
      const position = row.haystack.indexOf(q);
      const weight = TYPE_WEIGHT[row.entity_type] ?? 1;
      // Earlier match in the haystack beats later; type weight dominates.
      return {
        type: row.entity_type,
        id: row.entity_id,
        label: row.label,
        sublabel: row.sublabel,
        href: row.href,
        score: weight * 1000 - Math.max(position, 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return NextResponse.json({ results: ranked });
}
