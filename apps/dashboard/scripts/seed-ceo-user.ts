// Seeds the single CEO user into Supabase Auth (idempotent).
// Env-driven — no plaintext credentials in the repo (SEC constraint):
//   SUPABASE_URL                (default: http://127.0.0.1:54321)
//   SUPABASE_SERVICE_ROLE_KEY   (required — admin API)
//   DXB_CEO_EMAIL               (required)
//   DXB_CEO_PASSWORD            (required; CEO rotates after first login)
// Run: node --experimental-strip-types apps/dashboard/scripts/seed-ceo-user.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DXB_CEO_EMAIL;
const password = process.env.DXB_CEO_PASSWORD;

if (!serviceKey || !email || !password) {
  console.error("Missing env: SUPABASE_SERVICE_ROLE_KEY, DXB_CEO_EMAIL, DXB_CEO_PASSWORD are required.");
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
if (found) {
  console.log(`CEO user already present: ${found.id} (${email}) — nothing to do.`);
  process.exit(0);
}

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) {
  console.error(`createUser failed: ${error.message}`);
  process.exit(1);
}
console.log(`CEO user created: ${data.user.id} (${email})`);
