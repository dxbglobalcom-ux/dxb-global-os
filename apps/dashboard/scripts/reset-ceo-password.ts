// Resets the CEO user's password to the CURRENT value of DXB_CEO_PASSWORD.
// Companion to seed-ceo-user.ts (which refuses to touch an existing user).
// Env-driven — no plaintext credentials in the repo, none in tool output:
//   SUPABASE_URL                (default: http://127.0.0.1:54321)
//   SUPABASE_SERVICE_ROLE_KEY   (required — admin API)
//   DXB_CEO_EMAIL               (required)
//   DXB_CEO_PASSWORD            (required — the NEW password)
// Run: node --experimental-strip-types --env-file=.env apps/dashboard/scripts/reset-ceo-password.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DXB_CEO_EMAIL;
const password = process.env.DXB_CEO_PASSWORD;

if (!serviceKey || !email || !password) {
  console.error(
    "Missing env: SUPABASE_SERVICE_ROLE_KEY, DXB_CEO_EMAIL, DXB_CEO_PASSWORD are required.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listError } = await admin.auth.admin.listUsers();
if (listError) {
  console.error(`listUsers failed: ${listError.message}`);
  process.exit(1);
}

const found = existing.users.find((u) => u.email === email);
if (!found) {
  console.error(`No user with email ${email} — run seed-ceo-user.ts first.`);
  process.exit(1);
}

const { error } = await admin.auth.admin.updateUserById(found.id, { password });
if (error) {
  console.error(`updateUserById failed: ${error.message}`);
  process.exit(1);
}
console.log(`Password reset for ${email} (${found.id}). Old sessions stay valid until sign-out.`);
