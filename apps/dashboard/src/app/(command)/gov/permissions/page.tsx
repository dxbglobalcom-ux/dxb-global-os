import { ModuleWaiting } from "@/components/command/module-waiting";

// /gov/permissions — real module lands at roadmap step E12.1 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="permissions" step="E12.1" />;
}
