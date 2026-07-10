import { ModuleWaiting } from "@/components/command/module-waiting";

// /ops/workflows — real module lands at roadmap step E9.2 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="workflows" step="E9.2" />;
}
