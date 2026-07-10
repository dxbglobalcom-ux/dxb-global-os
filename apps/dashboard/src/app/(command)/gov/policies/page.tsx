import { ModuleWaiting } from "@/components/command/module-waiting";

// /gov/policies — real module lands at roadmap step E10.1 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="policies" step="E10.1" />;
}
