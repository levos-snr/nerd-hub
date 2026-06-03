import { createFileRoute } from "@tanstack/react-router";

async function handleAuth(request: Request): Promise<Response> {
  const { auth } = await import("../../../features/auth/auth.server");
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
      PUT: ({ request }) => handleAuth(request),
      PATCH: ({ request }) => handleAuth(request),
      DELETE: ({ request }) => handleAuth(request),
    },
  },
});
