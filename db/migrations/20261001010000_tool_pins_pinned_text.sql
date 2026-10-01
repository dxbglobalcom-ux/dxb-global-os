-- 20261001010000_tool_pins_pinned_text.sql — the pin keeps the text it approved, not only its hash.
--
-- Measured 2026-10-01: the daily pin check had quarantined 12 tools on 2026-09-27 (9 scrapling tools
-- after a newer install, 3 of our own dxb-mcp tools after our edits) and nobody could say what had
-- changed — only the sha256 of the approved {description, inputSchema} was stored. With the approved
-- text kept, a drift is judged on the change itself (packages/gateway/src/pin-check.ts classifyDrift)
-- and the alert can show it.
--
-- Nullable on purpose: existing pins carry no text until the pin check writes it — and it writes it
-- only while the live tool still hashes to the approved hash, so the text it stores IS the approved
-- text (self-backfill). Nothing else in this table changes.

ALTER TABLE tool_pins ADD COLUMN IF NOT EXISTS pinned_text jsonb;

COMMENT ON COLUMN tool_pins.pinned_text IS
  'Canonical {description, inputSchema} that schema_hash was computed from; written at pin time, or by the pin check while the live hash still equals schema_hash.';
