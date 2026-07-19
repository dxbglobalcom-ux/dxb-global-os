import { redirect } from "next/navigation";

// Root landing — the legacy cockpit home that lived here was retired on
// 2026-07-19 (CEO complaint C6: old-design surfaces must be unreachable).
// The Executive Command Center overview is the single home.
export default function RootPage() {
  redirect("/overview");
}
