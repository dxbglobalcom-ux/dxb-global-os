"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Visible logout (E6.0 — GAP-01 BLOCKER). supabase.auth.signOut() clears
// the sb-* cookies and broadcasts SIGNED_OUT to every other tab; the
// replace+refresh pair lands on /login without leaving the protected page
// in history and drops the client router cache behind it.

// SessionGuard reads this flag to tell a chosen logout apart from an
// expiry — a normal sign-out must not show the expiry warning.
export const LOGOUT_INTENT_KEY = "dxb-logout-intent";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    sessionStorage.setItem(LOGOUT_INTENT_KEY, "1");
    try {
      await supabase.auth.signOut();
    } catch {
      // Corrupted client auth state: fall back to the server-side sweep —
      // it revokes the session and expires the sb-* cookies for us.
      await fetch("/auth/signout", { method: "POST" }).catch(() => {});
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      data-testid="logout"
      className="rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon hover:text-ink-primary disabled:opacity-60"
    >
      {label}
    </button>
  );
}
