import { ModuleWaiting } from "@/components/command/module-waiting";

// /ai/orchestration — real module lands at roadmap step E7.2 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="orchestration" step="E7.2" />;
}
