import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../../src/router";
import { curriculumModules } from "../../src/features/curriculum/modules";

describe("e2e learner flow smoke", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/modules")) {
          return new Response(JSON.stringify({ modules: curriculumModules }), { status: 200 });
        }
        if (url.includes("/api/auth/get-session")) {
          return new Response(JSON.stringify(null), { status: 200 });
        }
        return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
      })
    );
  });

  it("renders landing page via TanStack Router", async () => {
    const router = getRouter();
    await router.navigate({ to: "/" });

    render(React.createElement(RouterProvider, { router }));

    await waitFor(() => {
      expect(
        screen.getByText(/Learn JavaScript and TypeScript together/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /start learning/i })).toBeInTheDocument();
  });
});
