import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("runs a trivial truth", () => {
    expect(1 + 1).toBe(2);
  });
});
