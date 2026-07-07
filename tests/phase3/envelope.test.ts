import { describe, expect, it } from "vitest";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";

const valid = {
  department: "engineering",
  objective: "write the phase-3 lifecycle test suite end to end",
  output_contract: "vitest file, all green",
  model_tier: "L3",
} as const;

describe("TaskEnvelope (LOCKED contract)", () => {
  it("rejects objective shorter than 20 chars", () => {
    expect(TaskEnvelope.safeParse({ ...valid, objective: "too short" }).success).toBe(false);
  });

  it("rejects output_contract shorter than 10 chars", () => {
    expect(TaskEnvelope.safeParse({ ...valid, output_contract: "short" }).success).toBe(false);
  });

  it("rejects model_tier outside L1-L4 and priority above 9", () => {
    expect(TaskEnvelope.safeParse({ ...valid, model_tier: "L5" }).success).toBe(false);
    expect(TaskEnvelope.safeParse({ ...valid, priority: 10 }).success).toBe(false);
  });

  it("parses minimal input with the LOCKED defaults", () => {
    const parsed = TaskEnvelope.parse(valid);
    expect(parsed.approval_class).toBe("none");
    expect(parsed.budget).toEqual({ max_tokens: 200_000, max_cost_eur: 1.0 });
    expect(parsed.priority).toBe(0);
    expect(parsed.parent_task_id).toBeNull();
  });

  it("requires parent_task_id to be uuid or null", () => {
    expect(TaskEnvelope.safeParse({ ...valid, parent_task_id: "not-a-uuid" }).success).toBe(false);
    expect(
      TaskEnvelope.safeParse({ ...valid, parent_task_id: "8f14e45f-ceea-4e17-a123-3c59e0b0a111" })
        .success,
    ).toBe(true);
  });
});
