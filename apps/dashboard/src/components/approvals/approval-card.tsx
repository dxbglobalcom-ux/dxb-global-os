"use client";

// ApprovalCard variants (UI-SPEC §4, GATE-03 visual language):
// high — one card per item, top badge strip (--danger + money-OUT), FULL
// payload visible, approve is double-confirm (arm → confirmable after 600ms,
// disarms on blur/5s). medium — list row with expandable payload. low —
// dense row (BatchBar owns the batch approve). Side-stripe borders and
// per-action popups are banned; decisions live inline in the cards.
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CurrencyEurIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { isMoneyOut, type InboxApproval } from "@/lib/approvals";
import { formatEur } from "@/lib/format";
import { timeHM } from "@/lib/format";

export type ApprovalText = {
  approve: string;
  confirmApprove: string;
  reject: string;
  rejectNotePlaceholder: string;
  moneyOut: string;
  highBadge: string;
  payload: string;
};

function payloadAmount(payload: Record<string, unknown>): number | null {
  const raw = payload.amount_eur ?? payload.cost_eur;
  const value = typeof raw === "string" ? Number(raw) : raw;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function MoneyOutBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-micro font-medium text-danger">
      <CurrencyEurIcon size={12} aria-hidden />
      {label}
    </span>
  );
}

// Double-confirm approve: click 1 arms; the confirm state becomes actionable
// 600ms later; blur or 5s idle disarms. Second actionable click decides.
function DoubleConfirmApprove({
  onConfirm,
  disabled,
  approveLabel,
  confirmLabel,
}: {
  onConfirm: () => void;
  disabled: boolean;
  approveLabel: string;
  confirmLabel: string;
}) {
  const [armed, setArmed] = useState(false);
  const [confirmable, setConfirmable] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  };

  const disarm = () => {
    clearTimers();
    setArmed(false);
    setConfirmable(false);
  };

  useEffect(() => clearTimers, []);

  if (!armed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setArmed(true);
          timers.current.push(window.setTimeout(() => setConfirmable(true), 600));
          timers.current.push(window.setTimeout(disarm, 5000));
        }}
        className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-body font-medium text-on-accent transition-transform duration-[var(--dur-fast)] hover:bg-accent-press active:scale-[0.98] disabled:opacity-50"
      >
        {approveLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || !confirmable}
      onBlur={disarm}
      onClick={() => {
        disarm();
        onConfirm();
      }}
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-danger px-5 text-body font-medium text-on-accent transition-opacity duration-[var(--dur-fast)] disabled:opacity-60"
    >
      <CheckIcon size={16} aria-hidden />
      {confirmLabel}
    </button>
  );
}

function RejectControl({
  onReject,
  disabled,
  text,
  withNote,
}: {
  onReject: (note?: string) => void;
  disabled: boolean;
  text: ApprovalText;
  withNote: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="flex items-center gap-2">
      {withNote && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={text.rejectNotePlaceholder}
          className="h-10 w-56 rounded-full border border-line bg-surface px-4 text-body text-ink placeholder:text-ink-2"
        />
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onReject(note || undefined)}
        className="inline-flex h-10 items-center rounded-full border border-line px-5 text-body text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-danger disabled:opacity-50"
      >
        {text.reject}
      </button>
    </div>
  );
}

function PayloadView({ payload, open, label }: { payload: Record<string, unknown>; open: boolean; label: string }) {
  const body = (
    <pre className="max-h-64 overflow-auto rounded-[0.625rem] bg-bg p-3 font-mono text-micro leading-relaxed text-ink-2">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
  if (open) return <div className="pt-2">{body}</div>;
  return (
    <details className="pt-1">
      <summary className="cursor-pointer text-micro text-ink-2 hover:text-ink">{label}</summary>
      <div className="pt-2">{body}</div>
    </details>
  );
}

// high: full-width card, badge strip on top, payload fully visible.
export function HighApprovalCard({
  approval,
  onDecide,
  busy,
  text,
}: {
  approval: InboxApproval;
  onDecide: (ids: string[], decision: "approved" | "rejected", note?: string) => void;
  busy: boolean;
  text: ApprovalText;
}) {
  const amount = payloadAmount(approval.payload);
  return (
    <article className="rounded-[1rem] border border-line bg-surface-2 px-5 py-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-micro font-medium text-danger">
          <WarningOctagonIcon size={12} aria-hidden />
          {text.highBadge}
        </span>
        {isMoneyOut(approval.action_type) && <MoneyOutBadge label={text.moneyOut} />}
        <span className="font-mono text-micro text-ink-2" data-numeric>
          {timeHM(new Date(approval.created_at))}
        </span>
        {amount !== null && (
          <span className="ml-auto font-mono text-body font-medium text-ink" data-numeric>
            {formatEur(amount)}
          </span>
        )}
      </div>
      <div className="py-3">
        <p className="text-body text-ink">{approval.objective ?? approval.action_type}</p>
        <p className="pt-0.5 text-micro text-ink-2">
          {approval.department ?? ""} · <span className="font-mono">{approval.action_type}</span>
        </p>
        <PayloadView payload={approval.payload} open label={text.payload} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <RejectControl
          onReject={(note) => onDecide([approval.id], "rejected", note)}
          disabled={busy}
          text={text}
          withNote
        />
        <DoubleConfirmApprove
          onConfirm={() => onDecide([approval.id], "approved")}
          disabled={busy}
          approveLabel={text.approve}
          confirmLabel={text.confirmApprove}
        />
      </div>
    </article>
  );
}

// medium: compact row, payload behind disclosure, single-click decisions.
export function MediumApprovalRow({
  approval,
  onDecide,
  busy,
  text,
}: {
  approval: InboxApproval;
  onDecide: (ids: string[], decision: "approved" | "rejected", note?: string) => void;
  busy: boolean;
  text: ApprovalText;
}) {
  const amount = payloadAmount(approval.payload);
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="min-w-0 flex-1 truncate text-body text-ink">
          {approval.objective ?? approval.action_type}
        </span>
        {isMoneyOut(approval.action_type) && <MoneyOutBadge label={text.moneyOut} />}
        {amount !== null && (
          <span className="font-mono text-micro text-ink" data-numeric>
            {formatEur(amount)}
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide([approval.id], "rejected")}
          className="text-micro text-ink-2 hover:text-danger disabled:opacity-50"
        >
          {text.reject}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide([approval.id], "approved")}
          className="inline-flex h-8 items-center rounded-full border border-line px-4 text-micro font-medium text-ink transition-colors duration-[var(--dur-fast)] hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {text.approve}
        </button>
      </div>
      <PayloadView payload={approval.payload} open={false} label={text.payload} />
    </li>
  );
}

// low: dense row — decisions happen in the BatchBar, row keeps only reject.
export function LowApprovalRow({
  approval,
  onDecide,
  busy,
  text,
}: {
  approval: InboxApproval;
  onDecide: (ids: string[], decision: "approved" | "rejected", note?: string) => void;
  busy: boolean;
  text: ApprovalText;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="min-w-0 flex-1 truncate text-body text-ink-2">
        {approval.objective ?? approval.action_type}
      </span>
      {isMoneyOut(approval.action_type) && <MoneyOutBadge label={text.moneyOut} />}
      <span className="font-mono text-micro text-ink-2" data-numeric>
        {timeHM(new Date(approval.created_at))}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => onDecide([approval.id], "rejected")}
        className="text-micro text-ink-2 hover:text-danger disabled:opacity-50"
      >
        {text.reject}
      </button>
    </li>
  );
}
