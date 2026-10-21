// Creates — or re-keys — the engineers' own dashboard account on the CONSTRUCTION engine
// (board row B03-bis; CEO 2026-10-21: "anahtar sende de duracak", a separate engineer account,
// closed when the holding is finished — ledger engineer-account-holds-the-keys-2026-10-21).
//
// Idempotent: the account is found by e-mail and its password set again, or created once.
// The company engine is refused (engineer-env.mjs): every signed-in user there is the CEO to the
// database. Keys come from chmod-600 files under ~/.dxb and are never printed:
//   ~/.dxb/construction-api.env   API_URL + SERVICE_ROLE_KEY
//     (umask 077; supabase status --workdir construction -o env > ~/.dxb/construction-api.env)
//   ~/.dxb/engineer-login.env     EMAIL + PASSWORD — written here on the first run
//
//   node scripts/test/engineer-account.mjs
import { existsSync, writeFileSync, chmodSync, mkdirSync } from "node:fs";
import {
  DXB_HOME,
  ENGINEER_LOGIN_FILE,
  CONSTRUCTION_API_FILE,
  readPrivateEnv,
  assertConstructionEngine,
  newEngineerPassword,
} from "./engineer-env.mjs";

const ENGINEER_EMAIL = "engineer@dxb-build.local";

const api = readPrivateEnv(CONSTRUCTION_API_FILE);
const base = assertConstructionEngine(api.API_URL);
const serviceKey = api.SERVICE_ROLE_KEY;
if (!serviceKey) throw new Error(`${CONSTRUCTION_API_FILE} has no SERVICE_ROLE_KEY`);

mkdirSync(DXB_HOME, { recursive: true, mode: 0o700 });
if (!existsSync(ENGINEER_LOGIN_FILE)) {
  writeFileSync(ENGINEER_LOGIN_FILE, `EMAIL=${ENGINEER_EMAIL}\nPASSWORD=${newEngineerPassword()}\n`, {
    mode: 0o600,
  });
  chmodSync(ENGINEER_LOGIN_FILE, 0o600);
}
const login = readPrivateEnv(ENGINEER_LOGIN_FILE);

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function call(method, path, body) {
  const res = await fetch(`${base}/auth/v1/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status}`);
  return res.json();
}

const { users } = await call("GET", "/users?page=1&per_page=1000");
const found = users.find((u) => u.email === login.EMAIL);
if (found) {
  await call("PUT", `/users/${found.id}`, { password: login.PASSWORD, email_confirm: true });
  console.log(`engineer account re-keyed on ${base} (${login.EMAIL})`);
} else {
  await call("POST", "/users", { email: login.EMAIL, password: login.PASSWORD, email_confirm: true });
  console.log(`engineer account created on ${base} (${login.EMAIL})`);
}
