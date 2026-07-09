import { AppShell } from "@/components/shell/app-shell";
import { HorizonLine } from "@/components/shell/horizon-line";
import { getDict } from "@/lib/i18n";

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict();
  return (
    <AppShell
      brand={dict.brand.name}
      labels={dict.nav}
      horizon={<HorizonLine />}
    >
      {children}
    </AppShell>
  );
}
