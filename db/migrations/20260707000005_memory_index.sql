CREATE TABLE memory_index (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL CHECK (kind IN ('fact','relation','artifact','procedure')),
  store       text NOT NULL CHECK (store IN ('obsidian','graphify','notebook','pgvector','claude-mem')),
  ref         text NOT NULL,                   -- path / node id / row id
  provenance  jsonb NOT NULL,                  -- {source, agent, task_id, origin}
  trust_tier  text NOT NULL DEFAULT 'quarantined'
                CHECK (trust_tier IN ('trusted','quarantined')),
  confidence  numeric(3,2) NOT NULL DEFAULT 0.5,
  superseded_by uuid REFERENCES memory_index(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);
CREATE INDEX idx_memory_kind ON memory_index (kind, trust_tier)
  WHERE superseded_by IS NULL;
ALTER TABLE memory_index ENABLE ROW LEVEL SECURITY;
