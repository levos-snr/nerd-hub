export type DatabaseDriver = "neon-http" | "postgres";

export function isNeonDatabaseUrl(url: string): boolean {
  return /neon\.tech/i.test(url);
}

export function isPoolerDatabaseUrl(url: string): boolean {
  return /-pooler/i.test(url);
}

/** Neon pooler endpoints reject some DDL (e.g. CREATE SCHEMA). Use the direct host for postgres.js. */
export function toDirectPostgresUrl(url: string): string {
  return url.replace(/-pooler\./gi, ".").replace(/-pooler/gi, "");
}

export function resolveDatabaseDriver(url: string): DatabaseDriver {
  const forced = process.env.DATABASE_DRIVER;
  if (forced === "postgres") return "postgres";
  if (forced === "neon-http") return "neon-http";
  // Neon: HTTPS driver (port 443) — reliable when TCP to Postgres (5432) times out locally
  if (isNeonDatabaseUrl(url)) return "neon-http";
  return "postgres";
}

export function resolveDatabaseUrl(
  url: string,
  options?: { forMigrations?: boolean; driver?: DatabaseDriver },
): string {
  const driver = options?.driver ?? resolveDatabaseDriver(url);
  if (driver === "postgres" && (options?.forMigrations || isPoolerDatabaseUrl(url))) {
    return toDirectPostgresUrl(url);
  }
  return url;
}
