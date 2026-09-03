// 2026-09-03 22:00 — the Agent SDK bump (0.3.201 → 0.3.259, needed for Claude Fable 5.1) made the
// CLI validate outputFormat schemas; zod v4's 2020-12 "$schema" header is refused there
// ("--json-schema is not a valid JSON Schema: no schema with key or ref …/2020-12/schema").
// The one helper drops the header and keeps the body. Exercised on a real company type.
import { describe, expect, it } from "vitest";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import { sdkJsonSchema } from "../../packages/shared/src/sdk-schema.js";

describe("sdkJsonSchema — the SDK's structured-output schema, one door", () => {
  it("drops the $schema header and keeps the body", () => {
    const s = sdkJsonSchema(TaskEnvelope);
    expect(s.$schema).toBeUndefined();
    expect(s.type).toBe("object");
    const props = Object.keys(s.properties as object);
    expect(props).toEqual(expect.arrayContaining(["department", "objective", "output_contract", "model_tier"]));
    expect(JSON.stringify(s)).not.toContain("json-schema.org");
  });
});
