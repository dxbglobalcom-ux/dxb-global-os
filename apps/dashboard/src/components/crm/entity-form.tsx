"use client";

// EntityForm (DASH-04, UI-SPEC §4 inputs): side-panel editor. Editable
// fields mirror the crm_update whitelist (lib/crm.ts — the DB door raises
// on anything wider); non-permitted fields render DISABLED with a lock
// hint — the UI mirrors policy, never widens it. Labels above inputs,
// errors below; placeholder-as-label is banned.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { updateCrmEntity } from "@/app/(cockpit)/crm/actions";
import type { CrmEntity } from "@/lib/crm";

export type FormField = {
  key: string;
  value: string;
  editable: boolean;
  input: "text" | "email" | "tel" | "number" | "select";
  options?: string[];
};

export function EntityForm({
  entity,
  rowId,
  fields,
  labels,
  statusLabels,
  text,
}: {
  entity: CrmEntity;
  rowId: string;
  fields: FormField[];
  labels: Record<string, string>;
  statusLabels: Record<string, string>;
  text: { save: string; saved: string; lockedHint: string; errorTitle: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.filter((f) => f.editable).map((f) => [f.key, f.value])),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        if (!field.editable) continue;
        const next = values[field.key] ?? "";
        if (next === field.value) continue;
        payload[field.key] =
          field.input === "number" ? (next === "" ? null : Number(next)) : next === "" ? null : next;
      }
      if (Object.keys(payload).length === 0) return;
      const result = await updateCrmEntity(entity, rowId, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-3.5"
    >
      {fields.map((field) => {
        const label = labels[field.key] ?? field.key;
        const common =
          "h-10 w-full rounded-[0.625rem] border border-line bg-surface px-3 text-body text-ink disabled:opacity-55";
        return (
          <div key={field.key} className="flex flex-col gap-1">
            <label htmlFor={`crm-${field.key}`} className="flex items-center gap-1.5 text-micro text-ink-2">
              {label}
              {!field.editable && (
                <span className="inline-flex items-center gap-1 text-ink-2" title={text.lockedHint}>
                  <LockSimpleIcon size={11} aria-label={text.lockedHint} />
                </span>
              )}
            </label>
            {field.input === "select" && field.editable ? (
              <select
                id={`crm-${field.key}`}
                value={values[field.key] ?? field.value}
                onChange={(event) => setValues((v) => ({ ...v, [field.key]: event.target.value }))}
                className={common}
              >
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option] ?? option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`crm-${field.key}`}
                type={field.input === "select" ? "text" : field.input}
                value={field.editable ? (values[field.key] ?? "") : field.value}
                disabled={!field.editable}
                onChange={(event) => setValues((v) => ({ ...v, [field.key]: event.target.value }))}
                className={common}
              />
            )}
          </div>
        );
      })}

      {error && (
        <div role="alert" className="rounded-[0.625rem] border border-line bg-surface px-3 py-2">
          <p className="text-micro font-medium text-danger">{text.errorTitle}</p>
          <p className="pt-0.5 font-mono text-micro text-ink-2">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:scale-[0.98] disabled:opacity-50"
        >
          {text.save}
        </button>
        {saved && !isPending && <span className="text-micro text-ok">{text.saved}</span>}
      </div>
    </form>
  );
}
