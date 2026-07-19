import { LibraryKindBoard } from "@/components/ai/library-kind-board";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

// /ai/plugins v1 (E12.1-D) — kind-scoped view over the Holding Library
// inventory (18 real plugin assets from the E9.5 intake).

export const metadata = { title: "Plugins — DXB" };

export default async function PluginsPage() {
  const dict = getDict(await getLocale());
  return (
    <LibraryKindBoard
      kinds={["plugin"]}
      pageTitle={dict.command.nav.pages.plugins}
      helpText={dict.help.plugins}
    />
  );
}
