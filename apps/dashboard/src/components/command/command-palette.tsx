"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ClipboardCheck,
  FileClock,
  Loader2,
  Pause,
  Play,
  Search,
  Send,
  TrendingUp,
  UserPlus,
  Workflow,
} from "lucide-react";
import { CommandItem } from "@/components/primitives";
import { createClient } from "@/lib/supabase/client";
import { deriveChainStatus, type IntentChainStatus } from "@/lib/intents";
import type { Locale } from "@/lib/i18n";

// ⌘K Command Palette — E6.4 (GAP-07). Three lanes in one surface:
//  1. Global search: /api/search over v_global_search (10 entity families,
//     grouped by type, every row navigable — no dead results).
//  2. Action catalog: CC-SPEC §8 navigation shortcuts (read lane) plus the
//     kill-switch pair (control lane). Control rows carry an explicit
//     CONTROL badge — the READ-ONLY ↔ CONTROL distinction is visible per
//     row, never implied (DESIGN_SYSTEM §13).
//  3. CEO intent: the instruction lane is ALWAYS visible (RULE #0-B trigger
//     case, 2026-07-17: "where does the CEO write a full intent?" needs a
//     standing answer — the old 3-char reveal rule is dead). Activating the
//     lane opens a MULTILINE composer (Enter sends, Shift+Enter breaks a
//     line) seeded with whatever was typed; text submits to the kernel seam
//     (POST /api/intent, raw text only; classify→decompose→dispatch lives in
//     the orchestrator). After submit the palette WATCHES the chain live:
//     intent status → task rows → audit trail links (roadmap E6.4 DoD).

export type PaletteLabels = {
  placeholder: string;
  hintOpen: string;
  empty: string;
  searching: string;
  sectionActions: string;
  sectionResults: string;
  sectionIntent: string;
  intentSubmit: string;
  intentSubmitting: string;
  intentCompose: string;
  intentPlaceholder: string;
  intentHint: string;
  intentBack: string;
  controlBadge: string;
  chainTitle: string;
  chainStatus: Record<string, string>;
  chainTasks: string;
  chainNoTasks: string;
  viewTasks: string;
  viewAudit: string;
  chainClose: string;
  actionLabels: Record<string, string>;
  typeLabels: Record<string, string>;
  killPause: string;
  killResume: string;
};

type SearchResult = {
  type: string;
  id: string;
  label: string;
  sublabel: string | null;
  href: string;
};

type ChainTask = { id: string; objective: string; status: string };

type ChainState = {
  intentId: string;
  text: string;
  status: IntentChainStatus;
  tasks: ChainTask[];
};

// CC-SPEC §8 action catalog — navigation rows are the read lane; the
// kill-switch pair is the only control-lane action shipped with E6.4
// (org/model mutations arrive with E6.2/E6.3 drawers).
const NAV_ACTIONS: Array<{ key: string; href: string; icon: typeof Search }> = [
  { key: "pendingApprovals", href: "/approvals?state=pending", icon: ClipboardCheck },
  { key: "failedWorkflows", href: "/ops/workflows?state=failed&range=24h", icon: Workflow },
  { key: "topTokenSpenders", href: "/fin/tokens?dim=employee&sort=desc", icon: TrendingUp },
  { key: "pnl", href: "/fin/pnl", icon: TrendingUp },
  { key: "activeTasks", href: "/ops/tasks?state=active", icon: Activity },
  { key: "newEmployee", href: "/org/hr", icon: UserPlus },
  { key: "auditTrail", href: "/gov/audit", icon: FileClock },
];

type PaletteItem =
  | { kind: "action"; key: string; href: string; icon: typeof Search }
  | { kind: "kill" }
  | { kind: "result"; result: SearchResult }
  | { kind: "intent" };

export function CommandPalette({
  labels,
  locale,
  paused,
}: {
  labels: PaletteLabels;
  locale: Locale;
  paused: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [chain, setChain] = useState<ChainState | null>(null);
  const [mode, setMode] = useState<"list" | "compose">("list");
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<"list" | "compose">("list");
  const listRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelected(0);
    setChain(null);
    setMode("list");
    setDraft("");
    if (pollRef.current) window.clearInterval(pollRef.current);
  }, []);

  // Global shortcut: ⌘K / Ctrl+K toggles, Escape closes.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        // In the composer, Escape steps back to the list — it must never
        // throw a typed instruction away with the whole palette.
        if (modeRef.current === "compose") setMode("list");
        else close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    modeRef.current = mode;
    if (mode === "compose") textareaRef.current?.focus();
  }, [mode]);

  // Debounced global search.
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const body = (await res.json()) as { results?: SearchResult[] };
        setResults(body.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
        setSelected(0);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open, query]);

  const q = query.trim().toLowerCase();
  const actions = NAV_ACTIONS.filter(
    (a) => q.length === 0 || (labels.actionLabels[a.key] ?? a.key).toLowerCase().includes(q),
  );
  const showKill =
    q.length === 0 ||
    labels.killPause.toLowerCase().includes(q) ||
    labels.killResume.toLowerCase().includes(q);

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];
    for (const a of actions) list.push({ kind: "action", ...a });
    if (showKill) list.push({ kind: "kill" });
    for (const r of results) list.push({ kind: "result", result: r });
    list.push({ kind: "intent" });
    return list;
  }, [actions, showKill, results]);

  // Watch the intent chain live after submit: intents row status plus the
  // task rows it dispatched. Poll stops at a terminal chain state.
  const watchChain = useCallback(
    (intentId: string, text: string) => {
      setChain({ intentId, text, status: "received", tasks: [] });
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(async () => {
        const { data: intent } = await supabase
          .from("intents")
          .select("status, task_ids")
          .eq("id", intentId)
          .single<{ status: string; task_ids: string[] }>();
        if (!intent) return;
        let tasks: ChainTask[] = [];
        if (intent.task_ids.length > 0) {
          const { data } = await supabase
            .from("tasks")
            .select("id, objective, status")
            .in("id", intent.task_ids);
          tasks = (data ?? []) as ChainTask[];
        }
        const status = deriveChainStatus(intent.status, tasks.map((t) => t.status));
        setChain({ intentId, text, status, tasks });
        if (["done", "failed", "failed_dispatch"].includes(status) && pollRef.current) {
          window.clearInterval(pollRef.current);
        }
      }, 2000);
    },
    [supabase],
  );

  useEffect(
    () => () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    },
    [],
  );

  async function submitIntent(raw: string) {
    const text = raw.trim();
    if (submitting || text.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: locale }),
      });
      if (res.status === 201) {
        const body = (await res.json()) as { intentId: string };
        watchChain(body.intentId, text);
        setQuery("");
        setDraft("");
        setMode("list");
        setResults([]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleKillSwitch() {
    // Control lane: the OS kill-switch writes through the E6.1 settings
    // seam — idempotency key mandatory, audit + change_log on the DB side.
    await fetch("/api/control/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        op: "set",
        key: "os.global_pause",
        scope: "global",
        value: !paused,
        rationale: "CEO kill-switch toggle from command palette",
      }),
    });
    close();
    router.refresh();
  }

  function activate(item: PaletteItem) {
    if (item.kind === "action") {
      close();
      router.push(item.href);
    } else if (item.kind === "result") {
      close();
      router.push(item.result.href);
    } else if (item.kind === "kill") {
      void toggleKillSwitch();
    } else {
      // The lane opens the composer; sending is always the composer's own
      // explicit act (deliberate CONTROL action, seeded with the query).
      setDraft((prev) => (query.trim().length > 0 ? query.trim() : prev));
      setMode("compose");
    }
  }

  function onInputKey(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((v) => Math.min(v + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((v) => Math.max(v - 1, 0));
    } else if (event.key === "Enter" && items[selected]) {
      event.preventDefault();
      activate(items[selected]);
    }
  }

  // Keep the selected row in view while arrowing through long result lists.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const chainStatusTone: Record<string, string> = {
    done: "text-status-ok",
    failed: "text-status-danger",
    failed_dispatch: "text-status-danger",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="palette-open"
        className="flex items-center gap-2 rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne hover:text-ink-primary"
      >
        <Search size={13} strokeWidth={1.5} aria-hidden />
        <span className="hidden md:inline">{labels.placeholder}</span>
        <kbd className="rounded-input border border-edge-neutral bg-surface-graphite px-1.5 font-data text-caption text-ink-muted">
          {labels.hintOpen}
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-surface-void/80 pt-[12vh] backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.placeholder}
            data-testid="command-palette"
            className="w-full max-w-2xl rounded-panel border border-edge-neutral bg-surface-obsidian shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-edge-neutral px-4">
              <Search size={16} strokeWidth={1.5} className="text-ink-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
                placeholder={labels.placeholder}
                data-testid="palette-input"
                className="h-12 w-full bg-transparent text-body-md text-ink-primary outline-none placeholder:text-ink-muted"
              />
              {searching && (
                <Loader2 size={14} className="animate-spin text-ink-muted" aria-hidden />
              )}
            </div>

            {chain ? (
              <div className="space-y-3 p-4" data-testid="intent-chain">
                <p className="label-caps text-accent-brushed">{labels.chainTitle}</p>
                <p className="text-body-md text-ink-primary">“{chain.text}”</p>
                <p className="text-body-s">
                  <span className="text-ink-secondary">{labels.sectionIntent}: </span>
                  <span
                    data-testid="intent-chain-status"
                    className={chainStatusTone[chain.status] ?? "text-accent-champagne"}
                  >
                    {labels.chainStatus[chain.status] ?? chain.status}
                  </span>
                </p>
                <div>
                  <p className="label-caps mb-1 text-ink-muted">{labels.chainTasks}</p>
                  {chain.tasks.length === 0 ? (
                    <p className="text-body-s text-ink-muted">{labels.chainNoTasks}</p>
                  ) : (
                    <ul className="space-y-1" data-testid="intent-chain-tasks">
                      {chain.tasks.map((task) => (
                        <li key={task.id} className="flex items-baseline gap-2 text-body-s">
                          <span className="font-data text-caption text-ink-muted">
                            {task.status}
                          </span>
                          <span className="min-w-0 break-words text-ink-primary">
                            {task.objective}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-4 border-t border-edge-neutral pt-3 text-body-s">
                  <button
                    type="button"
                    className="text-accent-champagne hover:text-accent-ivory"
                    onClick={() => {
                      close();
                      router.push("/ops/tasks");
                    }}
                  >
                    {labels.viewTasks}
                  </button>
                  <button
                    type="button"
                    className="text-accent-champagne hover:text-accent-ivory"
                    onClick={() => {
                      close();
                      router.push("/gov/audit");
                    }}
                  >
                    {labels.viewAudit}
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-ink-muted hover:text-ink-primary"
                    onClick={close}
                  >
                    {labels.chainClose}
                  </button>
                </div>
              </div>
            ) : mode === "compose" ? (
              <div className="space-y-3 p-4" data-testid="intent-composer">
                <div className="flex items-center justify-between">
                  <p className="label-caps text-accent-brushed">{labels.sectionIntent}</p>
                  <span className="label-caps rounded-input border border-status-danger/60 px-1.5 py-0.5 text-caption text-status-danger">
                    {labels.controlBadge}
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitIntent(draft);
                    }
                  }}
                  placeholder={labels.intentPlaceholder}
                  rows={4}
                  data-testid="intent-composer-input"
                  className="max-h-48 min-h-24 w-full resize-none rounded-input border border-edge-neutral bg-transparent p-3 text-body-md text-ink-primary outline-none placeholder:text-ink-muted focus:border-edge-champagne"
                />
                <div className="flex items-center gap-3">
                  <p className="text-caption text-ink-muted">{labels.intentHint}</p>
                  <button
                    type="button"
                    className="ml-auto text-body-s text-ink-muted hover:text-ink-primary"
                    onClick={() => setMode("list")}
                  >
                    {labels.intentBack}
                  </button>
                  <button
                    type="button"
                    data-testid="intent-composer-send"
                    disabled={submitting || draft.trim().length === 0}
                    onClick={() => void submitIntent(draft)}
                    className="flex items-center gap-2 rounded-input border border-status-danger/60 px-3 py-1.5 text-body-s text-status-danger transition duration-[var(--t-fast)] ease-refined enabled:hover:bg-status-danger/10 disabled:opacity-40"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                    ) : (
                      <Send size={14} strokeWidth={1.5} aria-hidden />
                    )}
                    {submitting ? labels.intentSubmitting : labels.intentSubmit}
                  </button>
                </div>
              </div>
            ) : (
              <div ref={listRef} className="max-h-[52vh] space-y-3 overflow-y-auto p-2">
                {(actions.length > 0 || showKill) && (
                  <div>
                    <p className="label-caps px-3 py-1 text-ink-muted">
                      {labels.sectionActions}
                    </p>
                    {actions.map((action, index) => (
                      <button
                        key={action.key}
                        type="button"
                        className="block w-full text-left"
                        onClick={() => activate(items[index])}
                        onMouseEnter={() => setSelected(index)}
                      >
                        <CommandItem
                          icon={<action.icon size={14} strokeWidth={1.5} aria-hidden />}
                          title={labels.actionLabels[action.key] ?? action.key}
                          selected={selected === index}
                        />
                      </button>
                    ))}
                    {showKill && (
                      <button
                        type="button"
                        className="block w-full text-left"
                        data-testid="palette-kill-switch"
                        onClick={() => activate({ kind: "kill" })}
                        onMouseEnter={() => setSelected(actions.length)}
                      >
                        <CommandItem
                          icon={
                            paused ? (
                              <Play size={14} strokeWidth={1.5} aria-hidden />
                            ) : (
                              <Pause size={14} strokeWidth={1.5} aria-hidden />
                            )
                          }
                          title={paused ? labels.killResume : labels.killPause}
                          selected={selected === actions.length}
                          trailing={
                            <span className="label-caps rounded-input border border-status-danger/60 px-1.5 py-0.5 text-caption text-status-danger">
                              {labels.controlBadge}
                            </span>
                          }
                        />
                      </button>
                    )}
                  </div>
                )}

                {results.length > 0 && (
                  <div data-testid="palette-results">
                    <p className="label-caps px-3 py-1 text-ink-muted">
                      {labels.sectionResults}
                    </p>
                    {results.map((result, index) => {
                      const offset = actions.length + (showKill ? 1 : 0) + index;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          className="block w-full text-left"
                          onClick={() => activate({ kind: "result", result })}
                          onMouseEnter={() => setSelected(offset)}
                        >
                          <CommandItem
                            title={result.label}
                            hint={result.sublabel ?? undefined}
                            selected={selected === offset}
                            trailing={
                              <span className="label-caps text-caption text-ink-muted">
                                {labels.typeLabels[result.type] ?? result.type}
                              </span>
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.length >= 2 && results.length === 0 && !searching && (
                  <p className="px-3 py-2 text-body-s text-ink-muted">{labels.empty}</p>
                )}

                <div>
                  <p className="label-caps px-3 py-1 text-ink-muted">
                    {labels.sectionIntent}
                  </p>
                  <button
                    type="button"
                    className="block w-full text-left"
                    data-testid="palette-intent-submit"
                    onClick={() => activate({ kind: "intent" })}
                    onMouseEnter={() => setSelected(items.length - 1)}
                  >
                    <CommandItem
                      icon={<Send size={14} strokeWidth={1.5} aria-hidden />}
                      title={labels.intentCompose}
                      selected={selected === items.length - 1}
                      trailing={
                        <span className="label-caps rounded-input border border-status-danger/60 px-1.5 py-0.5 text-caption text-status-danger">
                          {labels.controlBadge}
                        </span>
                      }
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
