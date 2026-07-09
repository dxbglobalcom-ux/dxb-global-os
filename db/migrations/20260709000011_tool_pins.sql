-- 0011_tool_pins — master PHASE-07 §3 verbatim ("0010" in the master; renumbered
-- to the house timestamp scheme because 20260709000010_memory_embeddings.sql
-- already holds seq 000010 — [ADAPT] recorded in 07-02-SUMMARY).
-- Anti rug-pull pin store (MCP-03): one row per (server, tool); hash of the
-- tool's description+inputSchema at approval time. Drift → quarantined=true
-- (sticky — un-quarantine is a human-path update only, never pin-check).
CREATE TABLE tool_pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server      text NOT NULL,
  tool        text NOT NULL,
  schema_hash text NOT NULL,               -- sha256(description + inputSchema JSON, key-sorted)
  quarantined boolean NOT NULL DEFAULT false,
  pinned_at   timestamptz NOT NULL DEFAULT now(),
  last_checked timestamptz,
  UNIQUE (server, tool)
);
ALTER TABLE tool_pins ENABLE ROW LEVEL SECURITY;
