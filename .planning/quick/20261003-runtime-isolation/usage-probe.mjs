// Reads the claude.ai plan's rate-limit windows through the SDK's /usage control request — no model call.
import { query } from "/home/dxb/DxB Global OS/node_modules/.pnpm/@anthropic-ai+claude-agent-sdk@0.3.259_@anthropic-ai+sdk@0.110.0_zod@4.4.3__@modelconte_18495ca1e384de899abb3270a0026dc2/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("CLAUDE")));
async function* idle() { await new Promise(() => {}); }
const q = query({ prompt: idle(), options: { settingSources: [], persistSession: false, strictMcpConfig: true, cwd: mkdtempSync(join(tmpdir(), "usage-probe-")), env } });
const timer = setTimeout(() => { console.log("TIMEOUT"); process.exit(2); }, 60000);
const u = await q.usage_EXPERIMENTAL_MAY_CHANGE_DO_NOT_RELY_ON_THIS_API_YET();
clearTimeout(timer);
console.log(JSON.stringify({ at: new Date().toISOString(), subscription: u.subscription_type, available: u.rate_limits_available, rate_limits: u.rate_limits, session_cost: u.session?.total_cost_usd }));
process.exit(0);
