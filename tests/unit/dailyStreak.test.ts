import { describe, expect, it } from "vitest";
import {
  recordDailyActivity,
  utcToday,
  utcYesterday,
} from "../../src/features/gamification/dailyStreak";

describe("daily streak", () => {
  it("starts streak on first activity", () => {
    const today = "2026-05-31";
    expect(recordDailyActivity(0, undefined, today)).toEqual({
      streak: 1,
      lastActivityDate: today,
    });
  });

  it("increments when last activity was yesterday", () => {
    const today = "2026-05-31";
    const yesterday = utcYesterday(today);
    expect(recordDailyActivity(3, yesterday, today)).toEqual({
      streak: 4,
      lastActivityDate: today,
    });
  });

  it("does not increment twice same day", () => {
    const today = utcToday();
    expect(recordDailyActivity(5, today, today)).toEqual({ streak: 5, lastActivityDate: today });
  });

  it("resets after gap", () => {
    const today = "2026-05-31";
    expect(recordDailyActivity(10, "2026-05-28", today)).toEqual({
      streak: 1,
      lastActivityDate: today,
    });
  });
});
