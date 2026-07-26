// CEO storageState minting, WITHOUT a human at the keyboard.
//
// e2e-login.mjs opens a headed window and waits for the CEO — correct when a
// human is there, useless when the design battery must run inside a session.
// This script mints the same artifact through the app's OWN auth stack:
// @supabase/ssr writes the session cookies itself (name, chunking and encoding
// are the library's business, never guessed here), and we hand that cookie jar
// to Playwright as a storageState.
//
// Credentials come from apps/dashboard/.env.local — the same DXB_CEO_EMAIL /
// DXB_CEO_PASSWORD pair the project's own seed-ceo-user.ts uses. Nothing is
// printed: the output is a chmod-600 file outside the repo.
//
//   node scripts/test/e2e-state-mint.mjs        (:3000 / supabase must be up)
import { readFileSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/dashboard/package.json", import.meta.url));
const { createServerClient } = require("@supabase/ssr");

// .env.local, parsed here rather than depended on: this script runs from the
// repo root where Next's loader is not in play.
const envPath = new URL("../../apps/dashboard/.env.local", import.meta.url);
const env = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = env.DXB_CEO_EMAIL;
const password = env.DXB_CEO_PASSWORD;
if (!url || !key || !email || !password) {
  console.error("missing env in apps/dashboard/.env.local");
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
    domain: "localhost",
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  })),
  origins: [],
};

const out = join(homedir(), ".dxb", "e2e-state.json");
mkdirSync(join(homedir(), ".dxb"), { recursive: true });
writeFileSync(out, JSON.stringify(state));
chmodSync(out, 0o600);
console.log(`storageState saved: ${out} (${state.cookies.length} cookies, chmod 600)`);
