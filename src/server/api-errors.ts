import type { ServerResponse } from "node:http";
import { DbUnavailableError } from "./db/retry";
import { json } from "./api-utils";

export function respondApiError(res: ServerResponse, error: unknown, fallback: string): void {
  if (error instanceof DbUnavailableError) {
    json(res, 503, {
      error: error.message,
      code: "DATABASE_UNAVAILABLE",
      retryable: true,
    });
    return;
  }
  json(res, 500, { error: error instanceof Error ? error.message : fallback });
}
