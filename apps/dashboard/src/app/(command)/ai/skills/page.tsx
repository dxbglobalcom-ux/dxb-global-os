import { LibraryKindBoard } from "@/components/ai/library-kind-board";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// /ai/skills v1 (E12.1-D) — kind-scoped view over the Holding Library
// inventory (23 real skill assets from the E9.5 intake); the library item
// record stays the single mutation door.

export const metadata = { title: "Skills — DXB" };

export default async function SkillsPage() {
  const dict = getDict(await getLocale());
  return (
    <LibraryKindBoard
      kinds={["skill"]}
      pageTitle={dict.command.nav.pages.skills}
    />
  );
}
