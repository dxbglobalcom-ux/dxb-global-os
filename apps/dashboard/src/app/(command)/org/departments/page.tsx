import { ModuleWaiting } from "@/components/command/module-waiting";

// /org/departments — real module lands at roadmap step E12.1 (E2.2 skeleton rule).
export default function Page() {
  return <ModuleWaiting pageKey="departments" step="E12.1" />;
}
