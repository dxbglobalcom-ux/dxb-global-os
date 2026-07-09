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

  // 2FA is mandatory (master-plan LOCKED): a session below aal2 is treated as
  // unauthenticated, so a password-only or magic-link session cannot reach the
  // cockpit — the login flow forces TOTP enroll/verify to raise it.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const cockpitReady = Boolean(user) && aal?.currentLevel === "aal2";

  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/login") || path.startsWith("/auth");

  if (!cockpitReady && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (cockpitReady && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
