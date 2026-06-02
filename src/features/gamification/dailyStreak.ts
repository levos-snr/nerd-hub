/** UTC calendar day as YYYY-MM-DD */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function utcYesterday(today: string): string {
  const d = new Date(`${today}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordDailyActivity(
  streak: number,
  lastActivityDate: string | undefined,
  today: string = utcToday(),
): { streak: number; lastActivityDate: string } {
  if (lastActivityDate === today) {
    return { streak, lastActivityDate: today };
  }
  if (lastActivityDate === utcYesterday(today)) {
    return { streak: streak + 1, lastActivityDate: today };
  }
  return { streak: 1, lastActivityDate: today };
}
