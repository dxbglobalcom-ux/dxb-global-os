"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LOGOUT_INTENT_KEY } from "./logout-button";

// Session guard — the client half of the E6.0 auth closure. The proxy wall
// covers every server round-trip; this covers what the server never sees:
//  1. multi-tab sync — supabase-js broadcasts SIGNED_OUT across tabs, we
//     drop this tab to /login the moment another one signs out;
//  2. session expiry — a SIGNED_OUT the user did not ask for shows a short
//     warning, then routes to a clean /login for safe re-entry;
//  3. bfcache restores — back button after logout revalidates the session
//     before the restored page is allowed to stand;
//  4. a slow heartbeat that catches cookie wipes no event reported.

export function SessionGuard({
  labels,
}: {
  labels: { ended: string; redirect: string };
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [expired, setExpired] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    function leave(silent: boolean) {
      if (leaving.current) return;
      leaving.current = true;
      if (silent) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setExpired(true);
      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1600);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      const chosen = sessionStorage.getItem(LOGOUT_INTENT_KEY) === "1";
      sessionStorage.removeItem(LOGOUT_INTENT_KEY);
      leave(chosen);
    });

    function onPageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) leave(true);
      });
    }
    window.addEventListener("pageshow", onPageShow);

    const heartbeat = window.setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) leave(false);
      });
    }, 30_000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(heartbeat);
    };
  }, [router, supabase]);

  if (!expired) return null;
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      data-testid="session-expired"
      className="fixed inset-0 flex items-center justify-center bg-surface-void/80 backdrop-blur-sm"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="max-w-sm rounded-input border border-edge-neutral bg-surface-carbon px-8 py-6 text-center">
        <p className="text-body-md text-ink-primary">{labels.ended}</p>
        <p className="mt-2 text-body-s text-ink-secondary">{labels.redirect}</p>
      </div>
    </div>
  );
}
