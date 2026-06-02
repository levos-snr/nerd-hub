const TRANSIENT_CODES = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "ENOTFOUND",
]);
const TRANSIENT_FRAGMENTS = [
  "fetch failed",
  "connection terminated",
  "connection timeout",
  "cannot reach database",
  "error connecting to database",
  "client idle timeout",
];

function errorText(error: unknown): string {
  if (error instanceof Error) {
    const nested = "cause" in error && error.cause ? errorText(error.cause) : "";
    return `${error.message} ${error.name} ${nested}`.toLowerCase();
  }
  return String(error).toLowerCase();
}

export function isTransientDbError(error: unknown): boolean {
  const text = errorText(error);
  if (TRANSIENT_FRAGMENTS.some((f) => text.includes(f))) return true;

  if (error && typeof error === "object") {
    const code = "code" in error ? String((error as { code?: string }).code) : "";
    if (code && TRANSIENT_CODES.has(code)) return true;

    if ("errors" in error && Array.isArray((error as { errors: unknown[] }).errors)) {
      return (error as { errors: unknown[] }).errors.some((e) => isTransientDbError(e));
    }
  }

  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DbUnavailableError extends Error {
  override name = "DbUnavailableError";

  constructor(message = "Database is temporarily unreachable. Please try again.") {
    super(message);
  }
}

/** Retries Neon/network blips (common on free tier or restrictive networks). */
export async function withDbRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt >= maxAttempts - 1) break;
      await sleep(200 * 2 ** attempt);
    }
  }

  if (isTransientDbError(lastError)) {
    throw new DbUnavailableError();
  }

  throw lastError;
}
