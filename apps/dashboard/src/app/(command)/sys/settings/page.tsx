import { ModuleWaiting } from "@/components/command/module-waiting";

// /sys/settings — real module lands at roadmap step E6.2 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="settings" step="E6.2" />;
}
