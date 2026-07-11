import { ModuleWaiting } from "@/components/command/module-waiting";

// /ai/mcp — MCP sunucu kataloğu + departman profilleri; gerçek modül
// MCP gateway dilimiyle gelir (U8 — CEO emri 2026-07-11, E7 kapsamı).
export default function Page() {
  return <ModuleWaiting pageKey="mcp" step="E7 (MCP gateway)" />;
}
