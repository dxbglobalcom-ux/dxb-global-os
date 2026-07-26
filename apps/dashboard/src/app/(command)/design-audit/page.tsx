import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Panel, StatusBadge } from "@/components/primitives";
import { MODULE_LIVE } from "@/config/module-live";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import en from "../../../../messages/en.json";
import tr from "../../../../messages/tr.json";

// /design-audit (D-bloku dalga-2) — hidden audit route, the executable
// twin of /design-preview: instead of showing the component matrix it RUNS
// the design-contract gates on request (fake-metric ban §35 applies to the
// audit itself — every verdict below is computed, never hand-declared).
// Source scan needs the repo on disk; in a stripped prod bundle the file
// count drops to 0 and says so instead of pretending a pass.

export const metadata = { title: "Design Audit — DXB" };
export const dynamic = "force-dynamic";

const HEX_RE = new RegExp("#[0-9a-f]{3,8}\\b", "gi");

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
}

async function hexLeakScan(): Promise<{ scanned: number; offenders: string[] }> {
  const root = path.join(process.cwd(), "src");
  const files: string[] = [];
  try {
    await walk(root, files);
  } catch {
    return { scanned: 0, offenders: [] };
  }
  const offenders: string[] = [];
  for (const f of files) {
    const text = await fs.readFile(f, "utf8");
    if (HEX_RE.test(text)) offenders.push(path.relative(root, f));
    HEX_RE.lastIndex = 0;
  }
  return { scanned: files.length, offenders };
}

function keyPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v))
      out.push(...keyPaths(v as Record<string, unknown>, p));
    else out.push(p);
  }
  return out;
}

function CheckPanel({
  title,
  pass,
  passLabel,
  failLabel,
  detail,
  problems,
  problemsLabel,
}: {
  title: string;
  pass: boolean;
  passLabel: string;
  failLabel: string;
  detail: string;
  problems: string[];
  problemsLabel: string;
}) {
  return (
    <Panel title={title} state={pass ? undefined : "error"}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-data text-caption text-ink-muted tabular-nums">
          {detail}
        </span>
        <StatusBadge level={pass ? "ok" : "danger"}>
          {pass ? passLabel : failLabel}
        </StatusBadge>
      </div>
      {problems.length > 0 && (
        <div className="mt-3 border-t border-edge-neutral pt-3">
          <span className="label-caps text-ink-muted">{problemsLabel}</span>
          <ul className="mt-1 space-y-0.5 font-data text-caption text-status-danger">
            {problems.slice(0, 20).map((p) => (
              <li key={p} className="truncate" title={p}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

export default async function DesignAuditPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.designAudit;

  const hex = await hexLeakScan();

  const enKeys = new Set(keyPaths(en as Record<string, unknown>));
  const trKeys = new Set(keyPaths(tr as Record<string, unknown>));
  const missingInTr = [...enKeys].filter((k) => !trKeys.has(k));
  const missingInEn = [...trKeys].filter((k) => !enKeys.has(k));
  const parityProblems = [
    ...missingInTr.map((k) => `tr ∅ ${k}`),
    ...missingInEn.map((k) => `en ∅ ${k}`),
  ];

  const pages = (en as { command: { nav: { pages: Record<string, string> } } })
    .command.nav.pages;
  const navProblems: string[] = [];
  for (const [key, live] of Object.entries(MODULE_LIVE)) {
    if (!(key in pages)) navProblems.push(key);
    if (!(live.relatedKey in pages)) navProblems.push(`${key} → ${live.relatedKey}`);
    if (!live.relatedHref.startsWith("/"))
      navProblems.push(`${key} → ${live.relatedHref}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>
        {/* The specimen is a builder's tool and 404s in production (§35: its
            numbers are invented). Linking to a dead route from a CEO surface
            would be the same defect wearing a different hat, so the link
            exists exactly where the page does. */}
        {process.env.NODE_ENV === "production" ? null : (
          <Link
            href="/design-preview"
            className="flex items-center gap-1.5 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
          >
            {t.previewLink}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </div>
      <p className="text-body-s text-ink-secondary">{t.subtitle}</p>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <CheckPanel
          title={t.checkHex}
          pass={hex.scanned > 0 && hex.offenders.length === 0}
          passLabel={t.pass}
          failLabel={t.fail}
          detail={`${hex.scanned} ${t.filesScanned} · ${hex.offenders.length}`}
          problems={hex.offenders}
          problemsLabel={t.offenders}
        />
        <CheckPanel
          title={t.checkI18n}
          pass={parityProblems.length === 0}
          passLabel={t.pass}
          failLabel={t.fail}
          detail={`en ${enKeys.size} · tr ${trKeys.size}`}
          problems={parityProblems}
          problemsLabel={t.missingKeys}
        />
        <CheckPanel
          title={t.checkNav}
          pass={navProblems.length === 0}
          passLabel={t.pass}
          failLabel={t.fail}
          detail={`${Object.keys(MODULE_LIVE).length} → ${Object.keys(pages).length}`}
          problems={navProblems}
          problemsLabel={t.orphanModules}
        />
      </div>

      <Panel title={t.rulesTitle}>
        <ul className="space-y-1.5 text-body-s text-ink-secondary">
          {(t.rules as string[]).map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="text-accent-champagne" aria-hidden>
                —
              </span>
              {rule}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-edge-neutral pt-3 font-data text-caption text-ink-muted">
          references/design-direction/DESIGN-DIRECTION.md
        </p>
      </Panel>
    </div>
  );
}
