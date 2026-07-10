import { ModuleWaiting } from "@/components/command/module-waiting";

// /sys/logs — real module lands at roadmap step E8.4 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="logs" step="E8.4" />;
}
