import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";

// Honest module state (E2.2 rule: NO empty pages — a route renders real
// data or says exactly which roadmap step delivers it). This card is the
// only allowed placeholder; dummy widgets stay forbidden (§35).

export function ModuleWaiting({
  pageKey,
  step,
}: {
  pageKey: string;
  step: string;
}) {
  const dict = getDict();
  const t = dict.command;
  const title =
    (t.nav.pages as Record<string, string>)[pageKey] ?? pageKey;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">{title}</h1>
      <Panel title={t.moduleWaiting.title}>
        <p className="text-body-s text-ink-secondary">{t.moduleWaiting.body}</p>
        <p className="mt-2 font-data text-caption text-ink-muted">
          {t.moduleWaiting.step}: {step}
        </p>
      </Panel>
    </div>
  );
}
