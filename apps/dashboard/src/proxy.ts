// Auth wall (Next 16 proxy convention — middleware.ts is deprecated in 16;
// recorded as a mandatory adaptation of the plan's "middleware.ts").
// Every route except /login and /auth/* requires a Supabase session.
// The wall lives at the network boundary, not layout-deep (plan must_have).
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and auth.getUser() —
  // and never remove getUser(): it revalidates the session server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2FA is mandatory on outward-facing deploys (master-plan LOCKED). On the
  // CEO's own laptop it is friction he explicitly rejected (CEO order
  // 2026-07-10): NEXT_PUBLIC_DXB_MFA_ENFORCED=false relaxes the gate to
  // password-only. Default (unset) stays ENFORCED — the VPS never sets it.
  const mfaEnforced = process.env.NEXT_PUBLIC_DXB_MFA_ENFORCED !== "false";
  let cockpitReady = Boolean(user);
  if (mfaEnforced) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    cockpitReady = Boolean(user) && aal?.currentLevel === "aal2";
  }

  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/login") || path.startsWith("/auth");

  if (!cockpitReady && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // E2.3 switch: authenticated entry lands on the Command Center shell.
  // Legacy cockpit routes stay reachable and redirect one by one as
  // modules reach parity (CC-SPEC §22) — rollback is this one line.
  if (cockpitReady && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }

  // Eski cockpit rotaları Command Center karşılıklarına yönlenir (D2 —
  // CEO RET 2026-07-11: eski tasarım görünmeyecek). /approvals fiziken
  // taşındı; /crm bilinçli istisna (nav'dan linklenmez, modülü ayrı blok).
  const LEGACY_REDIRECTS: Record<string, string> = {
    "/": "/overview",
    "/tasks": "/ops/tasks",
    "/costs": "/fin/costs",
  };
  const legacyTarget = LEGACY_REDIRECTS[path];
  if (cockpitReady && legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
