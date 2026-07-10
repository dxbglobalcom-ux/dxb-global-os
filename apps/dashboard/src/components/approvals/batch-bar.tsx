"use client";

// BatchBar (UI-SPEC §4 low tier): one accent pill approving every low-risk
// item in a single transaction. The count lives in the label — no separate
// counter chip.
export function BatchBar({
  count,
  onApproveAll,
  busy,
  label,
}: {
  count: number;
  onApproveAll: () => void;
  busy: boolean;
  label: string;
}) {
  if (count === 0) return null;
  return (
    <div className="flex justify-end border-t border-line pt-3">
      <button
        type="button"
        disabled={busy}
        onClick={onApproveAll}
        className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:scale-[0.98] disabled:opacity-50"
      >
        {label.replace("{n}", String(count))}
      </button>
    </div>
  );
}
