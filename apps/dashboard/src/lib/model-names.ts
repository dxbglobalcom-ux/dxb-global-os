// CEO-visible model labels, resolved once per page.
//
// U20 decision 4 froze the runtime model ids as internal technical keys
// (`fable-5`, `claude-sonnet-5`) because renaming them would break the live FK
// chain, the settings undo chain and the persona gate — and put every label the
// CEO reads on `model_catalog.display_name`. The U21 eye-test (2026-07-26)
// found four surfaces still rendering the raw id, so the CEO saw "fable-5" on
// his own workforce page after the authorship handover to Opus 5. This helper is
// the single place that translation happens.
//
// Shape is a plain Record, not a Map: it crosses the server -> client component
// boundary (org tree, engine responsibility) and Maps are not serialisable.

export type ModelNameMap = Record<string, string>;

type CatalogRow = { id: string; display_name: string | null };

/** Reads the catalog once. Never throws: a failed lookup degrades to raw ids. */
export async function fetchModelNames(supabase: {
  from: (table: string) => {
    select: (cols: string) => PromiseLike<{ data: unknown; error: unknown }>;
  };
}): Promise<ModelNameMap> {
  const res = await supabase.from("model_catalog").select("id, display_name");
  const out: ModelNameMap = {};
  for (const row of (res.data ?? []) as CatalogRow[]) {
    out[row.id] = row.display_name ?? row.id;
  }
  return out;
}

/**
 * The label to show. Falls back to the id rather than to an empty cell: an
 * honest technical string beats a blank one (CEO minimalism ruling — a field is
 * rendered only when its value is informative, and the id still is).
 */
export function modelLabel(names: ModelNameMap | undefined, id: string): string {
  return names?.[id] ?? id;
}
