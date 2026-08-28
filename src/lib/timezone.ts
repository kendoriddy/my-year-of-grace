import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { LAGOS_TZ, YEAR_END, YEAR_START } from "@/lib/constants";

export function nowInLagos(): Date {
  return toZonedTime(new Date(), LAGOS_TZ);
}

export function formatLagosDate(date: Date | string, pattern = "MMMM d, yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  const dateOnly = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  return format(dateOnly, pattern);
}

export function parseDateParam(value: string): Date | null {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;
  return parsed;
}

export function isDateIn2026(date: Date): boolean {
  return !isBefore(date, YEAR_START) && !isAfter(date, YEAR_END);
}

export function toDateKey(date: Date): string {
  return formatInTimeZone(date, LAGOS_TZ, "yyyy-MM-dd");
}

export function getDaysOfGrace(): number {
  const today = nowInLagos();
  const end = isAfter(today, YEAR_END) ? YEAR_END : today;
  const start = startOfDay(YEAR_START);
  const diff = endOfDay(end).getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isYearEndExperienceOpen(): boolean {
  const today = nowInLagos();
  return format(today, "MM-dd") === "12-31" || isAfter(today, YEAR_END);
}

export function monthOptions2026() {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const date = new Date(2026, i, 1);
    return {
      value: String(month),
      label: format(date, "MMMM"),
    };
  });
}
