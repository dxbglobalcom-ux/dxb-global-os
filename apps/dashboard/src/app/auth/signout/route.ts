import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side sign-out (E6.0 Auth Closure — GAP-01). The client normally
// signs out through supabase-js (which also broadcasts SIGNED_OUT to the
// other tabs); this handler is the recovery path: it revokes the session
// server-side and sweeps every sb-* cookie even when the client-side auth
// state is corrupted and supabase-js itself cannot run.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // A broken session must never block the exit — the cookie sweep
    // below still leaves the browser clean and the proxy wall closed.
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  const response = NextResponse.redirect(url, { status: 303 });
  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
  }
  return response;
}
