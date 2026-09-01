#!/usr/bin/env node
// B43 — register the studio's MEDIA ENGINES as governed library rows.
//
// The CEO's question, 2026-09-01: "bu modellerin araçların bugün kullanılan hepsinin yeri
// işareti ilgili yerlere işlendi mi?" Measured answer that day: the study cards and the
// tracker carried MiniMax H3 and nothing else, and the COMPANY'S OWN LIBRARY carried none
// of the three. A tool the holding runs every day and cannot see in its own database is
// not an asset of the holding; it is a private habit of one machine.
//
// Same single door as register-arsenal.mjs: every write through control_library_action in
// CEO context, md5 idempotency, re-run safe.
//   node scripts/library/register-media-engines.mjs            # dry run
//   node scripts/library/register-media-engines.mjs --apply
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const pg = require("pg");

const APPLY = process.argv.includes("--apply");
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error(
    "library/register-media-engines: DXB_DATABASE_URL is not set. This tool writes governed rows " +
      "and carries no default — name the engine explicitly.",
  );
  process.exit(2);
}

// Every number below was measured on DXB-Center (RTX 5060 Ti, 16,311 MiB) on 2026-09-01 and
// is cited in the study card named by source_ref. None of it is read off a vendor page.
const ITEMS = [
  {
    kind: "tool",
    name: "minimax-h3",
    version: "2026-08-02 weights · fl2va+ref2va fp8_scaled",
    owner_dept: "social-media",
    usage_notes:
      "Video engine with native stereo sound, open weights, runs on the holding's own card through " +
      "ComfyUI. Two checkpoints: FL2VA (first/last frame — camera-exact, for products) and REF2VA " +
      "(up to 9 reference images + 3 sounds — identity lock, for people). MEASURED CEILING: 1152x640 " +
      "(0.74 MP) for a 15 s shot, and 362 frames = 15.08 s is the model's own longest single " +
      "generation — no prompt length changes it, so a 30 s film is 6-10 cut shots, never one run. " +
      "THREE LAWS measured 2026-09-01: (1) a turbo LoRA must be sampled at its OWN step count — a " +
      "4-step LoRA at 8 steps destroys fine structure; (2) any human the client's eye lands on needs " +
      "a REAL PHOTOGRAPH through REF2VA, never a drawing; (3) cutting costs card time — 41.1 s of " +
      "card per finished second as one shot, 56.4 s (+37%) as eight. CEO REJECTED all four films made " +
      "with it on 2026-09-01: volume engine, not hero engine. Licence closed by the CEO 2026-08-31.",
    source_ref: ".planning/research/study-cards/minimax-h3.md",
  },
  {
    kind: "tool",
    name: "flux-krea-dev",
    version: "flux1-krea-dev_fp8_scaled · 11904639672 bytes",
    owner_dept: "social-media",
    usage_notes:
      "Image engine on the holding's own card — hero frames and master reference sets (studio step 3). " +
      "MEASURED: 1152x640, 28 steps, guidance 4.5 = 25.5 s per picture, $0.00, no quota, nothing leaves " +
      "the machine. Installed 2026-09-01 on the CEO's order after an outside drawing service's daily " +
      "quota stopped production at 12:29. Krea is the variant trained against the plastic 'AI look'. " +
      "QUALITY APPROVED BY THE CEO 2026-09-01 (ceo-approvals.json: flux-krea-quality-approved-2026-09-01). " +
      "FLUX is guidance-distilled: sampler cfg stays 1.0 and strength is carried by FluxGuidance. " +
      "Driver /home/dxb/tools/h3/img.py.",
    source_ref: ".planning/research/study-cards/flux-krea-dev.md",
  },
  {
    kind: "tool",
    name: "comfyui",
    version: "live 2026-08-30 · 127.0.0.1:8188",
    owner_dept: "social-media",
    usage_notes:
      "The bench every media model on this station runs inside; not a model itself. Started by " +
      "/home/dxb/tools/h3/start-server.sh with flags chosen against this card's real constraint " +
      "(--fast-disk --cache-none --use-sage-attention --reserve-vram 0.8; never --highvram). 34 GB of " +
      "weights live OUTSIDE the checkout in /home/dxb/tools/ComfyUI-models/, attached through " +
      "extra_model_paths.yaml, so updating ComfyUI never touches them. TRAP measured 2026-09-01: a new " +
      "model stays invisible until the process HOLDING PORT 8188 dies — find it with " +
      "ss -lptnH 'sport = :8188' and confirm the model with curl /object_info/UNETLoader, never by " +
      "trusting that the restart worked.",
    source_ref: ".planning/research/study-cards/comfyui.md",
  },
];

async function ceoAction(client, payload, label) {
  const key = `media-engines-${createHash("md5").update(JSON.stringify(payload)).digest("hex")}`;
  await client.query("BEGIN");
  try {
    await client.query(
      `SELECT set_config('request.jwt.claims',
         '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
    );
    const { rows } = await client.query("SELECT control_library_action($1::jsonb, $2) AS resp", [
      JSON.stringify(payload),
      key,
    ]);
    if (!rows[0].resp.ok) {
      throw new Error(`${label}: ${rows[0].resp.error} ${rows[0].resp.detail ?? ""}`);
    }
    await client.query("COMMIT");
    return rows[0].resp;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

const client = new pg.Client({ connectionString: DB_URL });
await client.connect();

if (!APPLY) {
  console.log(`dry-run: would register ${ITEMS.length} media engines`);
  for (const i of ITEMS) console.log(`  tool/${i.name}@${i.version}`);
  await client.end();
  process.exit(0);
}

let ok = 0;
for (const item of ITEMS) {
  const exists = await client.query(
    "SELECT id FROM library_items WHERE kind='tool' AND name=$1 AND version=$2",
    [item.name, item.version],
  );
  if (exists.rows.length > 0) {
    console.log(`exists  tool/${item.name}@${item.version} (${exists.rows[0].id})`);
    ok += 1;
    continue;
  }
  await ceoAction(
    client,
    { action: "register_item", ...item, quality_score: 100, review_status: "approved" },
    `register ${item.name}`,
  );
  console.log(`registered tool/${item.name}@${item.version}`);
  ok += 1;
}
console.log(`done: ${ok}/${ITEMS.length} ok`);
await client.end();
