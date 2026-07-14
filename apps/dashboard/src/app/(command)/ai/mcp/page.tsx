import Link from "next/link";
import { LibraryKindBoard } from "@/components/ai/library-kind-board";
import { Panel, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ai/mcp v1 (E12.1-D) — MCP surface: the 8 registered MCP groups from the
// Holding Library inventory + the per-department gateway posture
// (departments.mcp_profile — 'default-deny' baseline is the least-privilege
// constitution, shown as-is). Compiled profile FILES live in the gateway
// repo tree (E9.5 grant→profile chain); their per-tool contents ride the
// library item's Access tab, not a duplicate table here.

export const metadata = { title: "MCP — DXB" };

export default async function McpPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.mcp;
  const supabase = await createClient();

  const deptRes = await supabase
    .from("departments")
    .select("slug, display_name, display_name_tr, mcp_profile")
    .order("slug");

  const depts =
    (deptRes.data ?? []) as {
      slug: string;
      display_name: string;
      display_name_tr: string | null;
      mcp_profile: string;
    }[];

  return (
    <LibraryKindBoard
      kinds={["mcp"]}
      pageTitle={dict.command.nav.pages.mcp}
      footnote={t.profileNote}
      extra={
        <Panel title={t.postureTitle}>
          {deptRes.error ? (
            <p className="text-body-s text-status-danger">
              departments: {deptRes.error.message}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 2xl:grid-cols-3">
              {depts.map((d) => (
                <li
                  key={d.slug}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <Link
                    href={`/org/employees?dept=${encodeURIComponent(d.slug)}`}
                    className="min-w-0 truncate text-accent-champagne"
                  >
                    {locale === "tr"
                      ? (d.display_name_tr ?? d.display_name)
                      : d.display_name}
                  </Link>
                  <StatusBadge level={d.mcp_profile === "default-deny" ? "ok" : "warn"}>
                    <span className="font-data">{d.mcp_profile}</span>
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      }
    />
  );
}
