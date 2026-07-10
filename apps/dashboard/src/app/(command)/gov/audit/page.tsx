import { ModuleWaiting } from "@/components/command/module-waiting";

// /gov/audit — real module lands at roadmap step E8.4 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="audit" step="E8.4" />;
}
