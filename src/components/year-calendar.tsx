"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type DayCount = { total: number; locked: number };

type CalendarProps = {
  counts: Record<string, DayCount>;
  initialMonth?: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function YearCalendar({ counts, initialMonth = 1 }: CalendarProps) {
  const [month, setMonth] = useState(initialMonth);

  const { days, monthLabel } = useMemo(() => {
    const first = new Date(2026, month - 1, 1);
    const lastDay = new Date(2026, month, 0).getDate();
    const startOffset = first.getDay();
    const cells: Array<{ date: string | null; day: number | null }> = [];

    for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
    for (let day = 1; day <= lastDay; day++) {
      const date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({ date, day });
    }

    return { days: cells, monthLabel: `${MONTHS[month - 1]} 2026` };
  }, [month]);

  return (
    <section id="calendar" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-ink/50">
              Explore 2026
            </p>
            <h2 className="font-serif text-3xl text-ink">{monthLabel}</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMonth((m) => Math.max(1, m - 1))}
              disabled={month === 1}
              className="rounded-full border border-ink/10 px-3 py-1 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setMonth((m) => Math.min(12, m + 1))}
              disabled={month === 12}
              className="rounded-full border border-ink/10 px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 rounded-2xl border border-ink/8 bg-white p-3 shadow-sm md:gap-2 md:p-4">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold uppercase text-ink/40"
            >
              {day}
            </div>
          ))}
          {days.map((cell, index) => {
            if (!cell.date || !cell.day) {
              return (
                <div key={`empty-${index}`} className="min-h-16 md:min-h-24" />
              );
            }

            const data = counts[cell.date] ?? { total: 0, locked: 0 };
            const richness =
              data.total >= 30
                ? "bg-terracotta/20 border-terracotta/25"
                : data.total >= 12
                  ? "bg-terracotta/12 border-terracotta/20"
                  : data.total >= 1
                    ? "bg-paper border-ink/8"
                    : "";

            return (
              <Link
                key={cell.date}
                href={`/day/${cell.date}`}
                className={cn(
                  "group min-h-16 rounded-xl border border-transparent p-2 transition hover:border-terracotta/20 hover:bg-terracotta/5 md:min-h-24 md:p-3",
                  richness,
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {cell.day}
                  </span>
                  {data.locked > 0 && (
                    <span
                      className="text-xs text-ember"
                      title="Preserved testimonies"
                    >
                      🔒
                    </span>
                  )}
                </div>
                <div className="mt-2 hidden md:block">
                  <p className="text-xs text-ink/60">
                    {data.total} testimon{data.total === 1 ? "y" : "ies"}
                  </p>
                  {data.locked > 0 && (
                    <p className="text-xs text-ember">
                      {data.locked} preserved
                    </p>
                  )}
                </div>
                <div className="mt-2 flex gap-1 md:hidden">
                  {data.total > 0 && (
                    <span className="h-2 w-2 rounded-full bg-terracotta/70" />
                  )}
                  {data.locked > 0 && (
                    <span className="h-2 w-2 rounded-full bg-ember" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
