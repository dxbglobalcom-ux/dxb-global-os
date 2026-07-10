import { ModuleWaiting } from "@/components/command/module-waiting";

// /sys/integrations — real module lands at roadmap step E12.1 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="integrations" step="E12.1" />;
}
