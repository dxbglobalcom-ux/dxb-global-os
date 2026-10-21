// The ENGINEER's storageState, minted without a human at the keyboard (board row B03-bis).
//
// CEO 2026-10-21 (ledger engineer-account-holds-the-keys-2026-10-21): the engineers hold the dashboard
// login for the whole build, through their own account — not his. That account lives on the
// CONSTRUCTION engine only (scripts/test/engineer-account.mjs): every signed-in user is the CEO to the
// database (fn_succession_actor), so on the company engine an engineer would act and be audited as him.
// The dashboard under the eye check therefore runs against the construction API, e.g.
//   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<construction key>
//
// @supabase/ssr writes the session cookies itself (name, chunking and encoding are the library's
// business, never guessed here), and that cookie jar becomes a Playwright storageState. Credentials come
// from chmod-600 files under ~/.dxb; nothing is printed; the output is a chmod-600 file outside the repo.
//
//   node scripts/test/engineer-account.mjs   (once; idempotent)
//   node scripts/test/e2e-state-mint.mjs
import { writeFileSync, chmodSync } from "node:fs";
import { createRequire } from "node:module";
import {
  CONSTRUCTION_API_FILE,
  ENGINEER_LOGIN_FILE,
  ENGINEER_STATE_FILE,
  EYE_ORIGIN,
  readPrivateEnv,
  assertConstructionEngine,
} from "./engineer-env.mjs";

const require = createRequire(new URL("../../apps/dashboard/package.json", import.meta.url));
const { createServerClient } = require("@supabase/ssr");

const api = readPrivateEnv(CONSTRUCTION_API_FILE);
const url = assertConstructionEngine(api.API_URL);
const key = api.PUBLISHABLE_KEY || api.ANON_KEY;
const { EMAIL: email, PASSWORD: password } = readPrivateEnv(ENGINEER_LOGIN_FILE);
if (!key || !email || !password) {
  console.error(`missing values in ${CONSTRUCTION_API_FILE} or ${ENGINEER_LOGIN_FILE}`);
  process.exit(1);
}

/** @type {Map<string,string>} */
const jar = new Map();
const supabase = createServerClient(url, key, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
  },
});

const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
  console.error("sign-in failed:", error.message);
  process.exit(1);
}

// aal is worth knowing before a battery blames the pages for a redirect.
const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
console.log(`signed in — aal ${aal?.currentLevel ?? "?"} / required ${aal?.nextLevel ?? "?"}`);

if (jar.size === 0) {
  console.error("no cookies written by @supabase/ssr — nothing to save");
  process.exit(1);
}

const state = {
  cookies: [...jar].map(([name, value]) => ({
    name,
    value,
    domain: new URL(EYE_ORIGIN).hostname, // the eye copy only; never the CEO's panel on localhost:3000
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  })),
  origins: [],
};

const out = ENGINEER_STATE_FILE;
writeFileSync(out, JSON.stringify(state));
chmodSync(out, 0o600);
console.log(`storageState saved: ${out} (${state.cookies.length} cookies, chmod 600)`);
