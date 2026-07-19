import { LibraryKindBoard } from "@/components/ai/library-kind-board";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// /ai/knowledge v1 (E12.1-D) — the knowledge shelf of the Holding Library:
// research, reports, SOPs, policies, project docs and training material
// (real E9.5 intake rows). Memory stores have their own page (/ai/memory).

export const metadata = { title: "Knowledge — DXB" };

export default async function KnowledgePage() {
  const dict = getDict(await getLocale());
  return (
    <LibraryKindBoard
      kinds={["research", "report", "sop", "policy", "project_doc", "training"]}
      pageTitle={dict.command.nav.pages.knowledge}
      helpText={dict.help.knowledge}
      showKindColumn
    />
  );
}
