import { redirect } from "next/navigation";

// /sys/settings — the module lives at /sys/settings/[section] (E6.2,
// SETTINGS_AND_CONTROL_SPEC §3). The bare path lands on the first real
// registry category.
export default function Page() {
  redirect("/sys/settings/global_os");
}
