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
  MessagesSquare,
  Pause,
  Play,
  Search,
  TrendingUp,
  UserPlus,
  Workflow,
} from "lucide-react";
import { CommandItem } from "@/components/primitives";

// ⌘K Command Palette — E6.4 (GAP-07), reshaped 2026-07-19 (CEO complaint C7):
// the palette is SEARCH + shortcuts only. The intent composer left this
// surface — commands to the company start as a CONVERSATION with Hamza on
// the Chat Board (/chat, C1/C10); the palette's last row walks you there.
//  1. Global search: /api/search over v_global_search (10 entity families,
//     grouped by type, every row navigable — no dead results).
//  2. Action catalog: CC-SPEC §8 navigation shortcuts (read lane) plus the
//     kill-switch pair (control lane, explicit CONTROL badge — DESIGN_SYSTEM §13).
//  3. Chat lane: always visible, routes to the Hamza board.

export type PaletteLabels = {
  placeholder: string;
  hintOpen: string;
  empty: string;
  searching: string;
  sectionActions: string;
  sectionResults: string;
  sectionChat: string;
  chatOpen: string;
  controlBadge: string;
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

// CC-SPEC §8 action catalog — navigation rows are the read lane; the
// kill-switch pair is the only control-lane action shipped with E6.4.
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
  | { kind: "chat" };

export function CommandPalette({
  labels,
  paused,
}: {
  labels: PaletteLabels;
  paused: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelected(0);
  }, []);

  // Global shortcut: ⌘K / Ctrl+K toggles, Escape closes.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    list.push({ kind: "chat" });
    return list;
  }, [actions, showKill, results]);

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
      close();
      router.push("/chat");
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
            {/* 7a fix: the global :focus-visible ring drew an offset gold
                rectangle around ONLY the input — the "misaligned yellow box"
                the CEO flagged repeatedly. Focus is shown by the header row
                itself (champagne underline), perfectly aligned to the panel. */}
            <div className="flex items-center gap-3 border-b border-edge-neutral px-4 transition duration-[var(--t-fast)] ease-refined focus-within:border-edge-champagne">
              <Search size={16} strokeWidth={1.5} className="text-ink-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKey}
                placeholder={labels.placeholder}
                data-testid="palette-input"
                data-no-ring
                className="h-12 w-full bg-transparent text-body-md text-ink-primary outline-none placeholder:text-ink-muted"
              />
              {searching && (
                <Loader2 size={14} className="animate-spin text-ink-muted" aria-hidden />
              )}
            </div>

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
                  {labels.sectionChat}
                </p>
                <button
                  type="button"
                  className="block w-full text-left"
                  data-testid="palette-chat-open"
                  onClick={() => activate({ kind: "chat" })}
                  onMouseEnter={() => setSelected(items.length - 1)}
                >
                  <CommandItem
                    icon={<MessagesSquare size={14} strokeWidth={1.5} aria-hidden />}
                    title={labels.chatOpen}
                    selected={selected === items.length - 1}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
