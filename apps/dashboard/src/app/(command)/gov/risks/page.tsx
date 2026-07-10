import { ModuleWaiting } from "@/components/command/module-waiting";

// /gov/risks — real module lands at roadmap step E9.4 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="risks" step="E9.4" />;
}
