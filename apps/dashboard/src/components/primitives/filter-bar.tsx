"use client";
// FilterBar — the C9 list-page filter standard (complaint ledger standing
// order 5). Filter state lives in the URL (COST spec §10 drill idiom): each
// group owns one query param; the server page reads it and narrows EVERY
// panel. Two shapes: `select` for long option lists (progressive disclosure —
// registered CEO preference) and `chips` for short enumerations (ranges).
// A group's defaultValue deletes its param instead of writing it, so the
// bare URL stays canonical.
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type FilterOption = { value: string; label: string };

export type FilterGroup = {
  /** URL query param this group owns */
  param: string;
  label: string;
  options: FilterOption[];
  /** current effective value (server-validated) */
  value?: string;
  /** value that means "no param in URL" (e.g. the default range) */
  defaultValue?: string;
  /** first <option> label for select groups ("All departments") */
  allLabel?: string;
  kind?: "select" | "chips";
};

export function FilterBar({
  groups,
  clearLabel,
}: {
  groups: FilterGroup[];
  clearLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const navigate = (mutate: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(search.toString());
    mutate(q);
    const s = q.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  };

  const setParam = (group: FilterGroup, value: string) =>
    navigate((q) => {
      if (value && value !== (group.defaultValue ?? "")) q.set(group.param, value);
      else q.delete(group.param);
    });

  const clearAll = () =>
    navigate((q) => {
      for (const g of groups) q.delete(g.param);
    });

  const isActive = (g: FilterGroup) =>
    Boolean(g.value) && g.value !== (g.defaultValue ?? "");
  const anyActive = groups.some(isActive);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {groups.map((g) =>
        g.kind === "chips" ? (
          <div key={g.param} className="flex flex-wrap items-center gap-2" role="group" aria-label={g.label}>
            {g.options.map((o) => {
              const selected = (g.value ?? g.defaultValue ?? "") === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setParam(g, o.value)}
                  className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                    selected
                      ? "border-edge-champagne text-accent-champagne"
                      : "border-edge-neutral text-ink-secondary"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        ) : (
          <label
            key={g.param}
            className="flex items-center gap-2 text-body-s text-ink-muted"
          >
            {g.label}
            <select
              value={g.value ?? ""}
              onChange={(e) => setParam(g, e.target.value)}
              className={`max-w-[26ch] rounded-input border bg-surface-graphite px-2.5 py-1 text-body-s text-ink-primary outline-none transition duration-[var(--t-fast)] ease-refined focus:border-edge-champagne ${
                isActive(g) ? "border-edge-champagne" : "border-edge-neutral"
              }`}
            >
              <option value="">{g.allLabel ?? g.label}</option>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ),
      )}
      {anyActive && (
        <button
          type="button"
          onClick={clearAll}
          className="rounded-input border border-transparent px-2.5 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
        >
          {clearLabel} ✕
        </button>
      )}
    </div>
  );
}
