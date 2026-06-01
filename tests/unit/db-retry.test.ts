import { describe, expect, it } from "vitest";
import { isTransientDbError, withDbRetry } from "../../src/server/db/retry";

describe("db retry", () => {
  it("detects ETIMEDOUT as transient", () => {
    expect(isTransientDbError({ code: "ETIMEDOUT" })).toBe(true);
    expect(isTransientDbError(new Error("fetch failed"))).toBe(true);
  });

  it("retries then succeeds", async () => {
    let attempts = 0;
    const result = await withDbRetry(async () => {
      attempts++;
      if (attempts < 2) throw new Error("fetch failed");
      return "ok";
    }, 3);
    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });
});
