// The ONE place a zod type becomes the Agent SDK's `outputFormat.schema`.
//
// Measured 2026-09-03 22:00 on the company (SDK 0.3.259 / Claude Code 2.1.259): zod v4's
// `z.toJSONSchema()` writes a `"$schema": "https://json-schema.org/draft/2020-12/schema"`
// header, and the CLI now validates the schema before the run — it refuses that header with
// `--json-schema is not a valid JSON Schema: no schema with key or ref ".../2020-12/schema"`
// and the run dies with 0 tokens. Claude Code 2.1.201 (SDK 0.3.201) had accepted it. Every
// structured call in the company (worker, QA, decompose, classify, council, workflow executor)
// therefore goes through here, and the header is dropped — the schema body is unchanged.
import { z } from "zod";

export function sdkJsonSchema(type: z.ZodType): Record<string, unknown> {
  const schema = z.toJSONSchema(type) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
}
