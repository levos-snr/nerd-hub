import { describe, expect, it } from "vitest";
import {
  isNeonDatabaseUrl,
  isPoolerDatabaseUrl,
  resolveDatabaseDriver,
  resolveDatabaseUrl,
  toDirectPostgresUrl,
} from "../../src/server/db/resolve-connection";

const neonPooler =
  "postgresql://user:pass@ep-abc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
const neonDirect =
  "postgresql://user:pass@ep-abc.us-east-2.aws.neon.tech/neondb?sslmode=require";
const local = "postgresql://user:pass@localhost:5432/app";

describe("resolve-connection", () => {
  it("detects Neon URLs", () => {
    expect(isNeonDatabaseUrl(neonPooler)).toBe(true);
    expect(isNeonDatabaseUrl(local)).toBe(false);
  });

  it("defaults Neon to neon-http (HTTPS, not TCP)", () => {
    expect(resolveDatabaseDriver(neonPooler)).toBe("neon-http");
  });

  it("strips pooler host for postgres migrations", () => {
    expect(toDirectPostgresUrl(neonPooler)).toBe(neonDirect);
    expect(isPoolerDatabaseUrl(neonPooler)).toBe(true);
  });

  it("keeps pooled URL for neon-http", () => {
    expect(resolveDatabaseUrl(neonPooler, { driver: "neon-http" })).toBe(neonPooler);
  });

  it("uses direct URL for postgres migrations on pooler", () => {
    expect(
      resolveDatabaseUrl(neonPooler, { forMigrations: true, driver: "postgres" })
    ).toBe(neonDirect);
  });
});
