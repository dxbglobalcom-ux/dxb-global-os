import { afterEach, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

describe("getDb env guard", () => {
  const saved = process.env.DXB_DATABASE_URL;
  afterEach(async () => {
    if (saved === undefined) delete process.env.DXB_DATABASE_URL;
    else process.env.DXB_DATABASE_URL = saved;
    await closeDb();
  });

  it("throws an actionable error when DXB_DATABASE_URL is unset (URL never echoed)", async () => {
    await closeDb(); // drop any cached client so the guard actually runs
    delete process.env.DXB_DATABASE_URL;
    expect(() => getDb()).toThrowError(/DXB_DATABASE_URL is not set/);
  });
});
