import { createFileRoute } from "@tanstack/react-router";

async function handleAuth(request: Request) {
  const { auth } = await import("../../../features/auth/auth.server");
  return auth.handler(request);
}

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const handlers = Object.fromEntries(
  methods.map((method) => [method, ({ request }: { request: Request }) => handleAuth(request)])
) as Record<(typeof methods)[number], (ctx: { request: Request }) => Promise<Response>>;

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers,
  },
});
