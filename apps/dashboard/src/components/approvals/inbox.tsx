"use client";

// ApprovalsInbox — client orchestrator for the GATE-03 decision surface.
// Renders risk groups high→medium→low from server-fetched rows, refreshes
// the RSC tree on every dxb:approvals broadcast (no polling, no reload),
// and surfaces decision failures in an inline error panel (critical errors
// never go to a toast — UI-SPEC §4). Live truth per panel: FreshnessStamp.
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { Panel } from "@/components/panel";
import { Panel as CommandPanel } from "@/components/primitives";
import { FreshnessStamp } from "@/components/freshness-stamp";
import { useDxbChannel } from "@/lib/realtime";
import {
  GATE_FATIGUE_THRESHOLD,
  groupApprovals,
  type InboxApproval,
} from "@/lib/approvals";
import {
  HighApprovalCard,
  LowApprovalRow,
  MediumApprovalRow,
  type ApprovalText,
} from "@/components/approvals/approval-card";
import { BatchBar } from "@/components/approvals/batch-bar";
import { decideApprovals } from "@/app/(command)/approvals/actions";

export type InboxText = ApprovalText & {
  groupHigh: string;
  groupMedium: string;
  groupLow: string;
  approveAll: string;
  empty: string;
  emptyAction: string;
  fatigue: string;
  errorPanelTitle: string;
  asOf: string;
  notLiveSince: string;
};

export function ApprovalsInbox({ rows, text }: { rows: InboxApproval[]; text: InboxText }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const channel = useDxbChannel("approvals", refresh);

  const onDecide = useCallback(
    (ids: string[], decision: "approved" | "rejected", note?: string) => {
      setError(null);
      startTransition(async () => {
        const result = await decideApprovals(ids, decision, note);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      });
    },
    [router],
  );

  const groups = groupApprovals(rows);
  const total = rows.length;
  const stamp = <FreshnessStamp state={channel} asOfLabel={text.asOf} notLiveLabel={text.notLiveSince} />;

  // Boş durum Command dilinde (CEO göz-testi 2026-07-11: eski kokpit
  // paneli + "Back to cockpit" kalıntısı RET — kahverengi ton yasak B4).
  if (total === 0) {
    return (
      <CommandPanel action={stamp}>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircleIcon
            size={28}
            aria-hidden
            className="text-status-ok"
          />
          <p className="text-body-md text-ink-primary">{text.empty}</p>
          <Link
            href="/overview"
            className="rounded-input px-2 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            {text.emptyAction}
          </Link>
        </div>
      </CommandPanel>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {total >= GATE_FATIGUE_THRESHOLD && (
        <div className="sticky top-0 z-10 flex items-center gap-2 rounded-[0.75rem] border border-line bg-surface-2 px-4 py-2.5">
          <WarningIcon size={16} aria-hidden className="text-warn" />
          <p className="text-micro text-ink">{text.fatigue.replace("{n}", String(total))}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-[0.75rem] border border-line bg-surface-2 px-4 py-3">
          <p className="text-body font-medium text-danger">{text.errorPanelTitle}</p>
          <p className="pt-1 font-mono text-micro text-ink-2">{error}</p>
        </div>
      )}

      {groups.high.length > 0 && (
        <Panel title={text.groupHigh} stamp={stamp}>
          <div className="flex flex-col gap-4">
            {groups.high.map((approval) => (
              <HighApprovalCard
                key={approval.id}
                approval={approval}
                onDecide={onDecide}
                busy={isPending}
                text={text}
              />
            ))}
          </div>
        </Panel>
      )}

      {groups.medium.length > 0 && (
        <Panel title={text.groupMedium} stamp={groups.high.length === 0 ? stamp : undefined}>
          <ul className="divide-y divide-line">
            {groups.medium.map((approval) => (
              <MediumApprovalRow
                key={approval.id}
                approval={approval}
                onDecide={onDecide}
                busy={isPending}
                text={text}
              />
            ))}
          </ul>
        </Panel>
      )}

      {groups.low.length > 0 && (
        <Panel title={text.groupLow}>
          <ul className="divide-y divide-line">
            {groups.low.map((approval) => (
              <LowApprovalRow
                key={approval.id}
                approval={approval}
                onDecide={onDecide}
                busy={isPending}
                text={text}
              />
            ))}
          </ul>
          <BatchBar
            count={groups.low.length}
            busy={isPending}
            label={text.approveAll}
            onApproveAll={() => onDecide(groups.low.map((a) => a.id), "approved")}
          />
        </Panel>
      )}
    </div>
  );
}
