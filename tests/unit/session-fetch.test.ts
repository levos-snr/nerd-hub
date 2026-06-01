import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchSessionWithRetry } from "../../src/features/auth/session-fetch";

describe("fetchSessionWithRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns authenticated user on 200 with user", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: { id: "1", email: "a@b.c", name: "A" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const result = await fetchSessionWithRetry(1);
    expect(result).toEqual({
      status: "authenticated",
      user: { id: "1", email: "a@b.c", name: "A" },
    });
  });

  it("returns unauthenticated on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const result = await fetchSessionWithRetry(1);
    expect(result).toEqual({ status: "unauthenticated" });
  });

  it("returns unavailable on 500 instead of treating as logged out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("server error", { status: 500 })),
    );

    const result = await fetchSessionWithRetry(1);
    expect(result.status).toBe("unavailable");
  });
});
