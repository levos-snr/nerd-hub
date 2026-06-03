import { DbUnavailableError } from "./db/retry";

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function respondApiError(error: unknown, fallback: string): Response {
  if (error instanceof DbUnavailableError) {
    return jsonResponse(503, {
      error: error.message,
      code: "DATABASE_UNAVAILABLE",
      retryable: true,
    });
  }
  return jsonResponse(500, {
    error: error instanceof Error ? error.message : fallback,
  });
}
