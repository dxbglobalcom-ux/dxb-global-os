import { ModuleWaiting } from "@/components/command/module-waiting";

// /sys/health — real module lands at roadmap step E8.3 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="health" step="E8.3" />;
}
