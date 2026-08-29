import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isValid,
  startOfDay,
} from "date-fns";
import { LAGOS_TZ, YEAR_END, YEAR_START } from "@/lib/constants";

export function nowInLagos(): Date {
  return toZonedTime(new Date(), LAGOS_TZ);
}

export function formatLagosDate(date: Date | string, pattern = "MMMM d, yyyy") {
  const utc = toUtcDate(date);
  if (!utc) return "";
  return formatInTimeZone(utc, "UTC", pattern);
}

export function parseDateParam(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function toUtcDate(date: Date | string): Date | null {
  if (typeof date === "string") {
    const key = date.slice(0, 10);
    return parseDateParam(key);
  }

  if (!isValid(date)) return null;
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function toUtcDateKey(date: Date | string): string {
  const utc = toUtcDate(date);
  if (!utc) return "";
  return formatInTimeZone(utc, "UTC", "yyyy-MM-dd");
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
