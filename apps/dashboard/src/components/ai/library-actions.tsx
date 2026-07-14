"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { subscribeDxb } from "@/lib/realtime";

// Library access editor (E9.5, HOLDING_LIBRARY §7 — "grant editing on the CEO
// Control Mode surface"). EVERY mutation goes through /api/control/library
// (single-door rule §5); the fn's verdict is surfaced verbatim. The gateway
// note reminds the CEO that a grant change becomes ENFORCED once the 30 s
// recompile chain rewrites the MCP profiles (kayıt-yetki-uygulama, G3).

export type GrantView = {
  id: number;
  granteeKind: "department" | "employee" | "role_level";
  granteeId: string;
  grantedBy: string;
  createdAt: string;
  expiresAt: string | null;
  expiresLabel: string;
};

export type LibraryActionLabels = {
  grantAdd: string;
  grantRevoke: string;
  granteeKind: string;
  granteeId: string;
  expiresAt: string;
  granteeKinds: Record<string, string>;
  grantedBy: string;
  noGrants: string;
  gatewayNote: string;
  errorPrefix: string;
};

const ROLE_LEVELS = ["director", "orchestrator", "senior_specialist", "specialist"];

async function callLibrary(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/control/library", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; detail?: string };
  return data.ok ? null : (data.detail ?? data.error ?? "request failed");
}

/** Settings-channel liveness: library_item.changed / library_grant.changed →
 *  debounced server refetch (same idiom as the alerts channel). */
export function LibraryLive() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("settings", () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [router]);
  return null;
}

export function LibraryDetailActions({
  itemId,
  grants,
  employees,
  departments,
  labels,
}: {
  itemId: string;
  grants: GrantView[];
  employees: { id: string; slug: string }[];
  departments: string[];
  labels: LibraryActionLabels;
}) {
  const router = useRouter();
  const [granteeKind, setGranteeKind] = useState<"department" | "employee" | "role_level">(
    "department",
  );
  const [granteeId, setGranteeId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const failure = await callLibrary(body);
    setBusy(false);
    if (failure) {
      setError(failure);
    } else {
      setGranteeId("");
      setExpiresAt("");
      router.refresh();
    }
  };

  const inputCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  return (
    <div className="space-y-3">
      {grants.length === 0 ? (
        <p className="text-body-s text-status-warn">{labels.noGrants}</p>
      ) : (
        <ul className="space-y-2">
          {grants.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-center gap-2 rounded-panel border border-edge-neutral p-2"
            >
              <span className="label-caps text-ink-muted">
                {labels.granteeKinds[g.granteeKind] ?? g.granteeKind}
              </span>
              <span className="break-all font-data text-body-s text-ink-primary">{g.granteeId}</span>
              <span className="text-body-s text-ink-muted">
                {labels.grantedBy} {g.grantedBy} · {g.createdAt} · {g.expiresLabel}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => run({ op: "revoke_grant", grantId: g.id })}
                className="ml-auto rounded-input border border-edge-neutral px-2 py-1 text-body-s text-status-danger transition duration-[var(--t-fast)] ease-refined hover:border-status-danger disabled:opacity-50"
              >
                {labels.grantRevoke}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="flex flex-wrap items-end gap-2 rounded-panel border border-edge-neutral p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!granteeId) return;
          void run({
            op: "grant",
            itemId,
            granteeKind,
            granteeId,
            ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
          });
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.granteeKind}</span>
          <select
            className={inputCls}
            value={granteeKind}
            onChange={(e) => {
              setGranteeKind(e.target.value as typeof granteeKind);
              setGranteeId("");
            }}
          >
            {(["department", "employee", "role_level"] as const).map((k) => (
              <option key={k} value={k}>
                {labels.granteeKinds[k] ?? k}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.granteeId}</span>
          {granteeKind === "department" ? (
            <select className={inputCls} value={granteeId} onChange={(e) => setGranteeId(e.target.value)}>
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : granteeKind === "role_level" ? (
            <select className={inputCls} value={granteeId} onChange={(e) => setGranteeId(e.target.value)}>
              <option value="">—</option>
              {ROLE_LEVELS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                className={`${inputCls} w-56`}
                list="library-employee-options"
                value={granteeId}
                onChange={(e) => {
                  const slug = e.target.value;
                  const match = employees.find((emp) => emp.slug === slug);
                  setGranteeId(match ? match.id : slug);
                }}
              />
              <datalist id="library-employee-options">
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.slug} />
                ))}
              </datalist>
            </>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.expiresAt}</span>
          <input
            type="datetime-local"
            className={inputCls}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={busy || !granteeId}
          className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite disabled:opacity-50"
        >
          {labels.grantAdd}
        </button>
      </form>

      {error && (
        <p className="text-body-s text-status-danger">
          {labels.errorPrefix}: {error}
        </p>
      )}
      <p className="text-body-s text-ink-muted">{labels.gatewayNote}</p>
    </div>
  );
}
