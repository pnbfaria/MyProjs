import { getDay, startOfDay, format } from 'date-fns';
import { BUSINESS_HOURS, BUSINESS_DAYS, HOLIDAYS } from './constants';

/**
 * Business time calculation utilities for SLA deadlines.
 * Respects configurable business hours (default 9:00–18:00),
 * business days (Mon–Fri), and French public holidays.
 */

const BUSINESS_DAY_HOURS = BUSINESS_HOURS.end - BUSINESS_HOURS.start; // 9 hours
const BUSINESS_DAY_MS = BUSINESS_DAY_HOURS * 60 * 60 * 1000;

// ── Holiday check ──

function isHoliday(date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return HOLIDAYS.includes(dateStr);
}

function isBusinessDay(date: Date): boolean {
  const day = getDay(date); // 0=Sun, 1=Mon ... 6=Sat
  return (BUSINESS_DAYS as readonly number[]).includes(day) && !isHoliday(date);
}

// ── Clamp to business hours ──

function clampToBusinessHours(date: Date): Date {
  const clamped = new Date(date);
  const hours = clamped.getHours() + clamped.getMinutes() / 60;

  if (hours < BUSINESS_HOURS.start) {
    clamped.setHours(BUSINESS_HOURS.start, 0, 0, 0);
  } else if (hours >= BUSINESS_HOURS.end) {
    // Move to next business day start
    clamped.setDate(clamped.getDate() + 1);
    clamped.setHours(BUSINESS_HOURS.start, 0, 0, 0);
    // Skip non-business days
    while (!isBusinessDay(clamped)) {
      clamped.setDate(clamped.getDate() + 1);
    }
  }

  return clamped;
}

function getNextBusinessDayStart(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(BUSINESS_HOURS.start, 0, 0, 0);
  while (!isBusinessDay(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

// ── Add Business Time ──

/**
 * Adds business hours to a starting date.
 * E.g., addBusinessHours(Monday 17:00, 2) => Tuesday 10:00
 */
export function addBusinessHours(start: Date, hours: number): Date {
  let remaining = hours * 60 * 60 * 1000; // Convert to ms
  let current = clampToBusinessHours(new Date(start));

  // Skip to first business day if needed
  while (!isBusinessDay(current)) {
    current = getNextBusinessDayStart(current);
  }

  while (remaining > 0) {
    const endOfDay = new Date(current);
    endOfDay.setHours(BUSINESS_HOURS.end, 0, 0, 0);

    const msUntilEndOfDay = endOfDay.getTime() - current.getTime();

    if (remaining <= msUntilEndOfDay) {
      current = new Date(current.getTime() + remaining);
      remaining = 0;
    } else {
      remaining -= msUntilEndOfDay;
      current = getNextBusinessDayStart(current);
    }
  }

  return current;
}

/**
 * Adds business days to a starting date.
 * E.g., addBusinessDays(Friday, 2) => Tuesday
 */
export function addBusinessDays(start: Date, days: number): Date {
  let remaining = days;
  let current = clampToBusinessHours(new Date(start));

  while (remaining > 0) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) {
      remaining--;
    }
  }

  // Preserve the same time of day
  current.setHours(
    Math.min(start.getHours(), BUSINESS_HOURS.end),
    start.getMinutes(),
    start.getSeconds(),
    0
  );
  current = clampToBusinessHours(current);

  return current;
}

/**
 * General purpose: add business time by unit.
 */
export function addBusinessTime(start: Date, value: number, unit: 'hours' | 'days'): Date {
  return unit === 'hours' ? addBusinessHours(start, value) : addBusinessDays(start, value);
}

// ── Elapsed Business Time ──

/**
 * Calculate elapsed business hours between two dates.
 */
export function getElapsedBusinessHours(start: Date, end: Date): number {
  if (end <= start) return 0;

  let totalMs = 0;
  let current = clampToBusinessHours(new Date(start));

  const endDate = new Date(end);

  while (current < endDate) {
    if (!isBusinessDay(current)) {
      current = getNextBusinessDayStart(current);
      continue;
    }

    const dayEnd = new Date(current);
    dayEnd.setHours(BUSINESS_HOURS.end, 0, 0, 0);

    const currentHour = current.getHours() + current.getMinutes() / 60;
    if (currentHour >= BUSINESS_HOURS.end) {
      current = getNextBusinessDayStart(current);
      continue;
    }

    if (currentHour < BUSINESS_HOURS.start) {
      current.setHours(BUSINESS_HOURS.start, 0, 0, 0);
    }

    const effectiveEnd = endDate < dayEnd ? endDate : dayEnd;
    const elapsed = effectiveEnd.getTime() - current.getTime();

    if (elapsed > 0) {
      totalMs += elapsed;
    }

    if (endDate <= dayEnd) break;
    current = getNextBusinessDayStart(current);
  }

  return totalMs / (60 * 60 * 1000);
}

/**
 * Calculate elapsed business days between two dates.
 */
export function getElapsedBusinessDays(start: Date, end: Date): number {
  if (end <= start) return 0;

  let count = 0;
  const current = startOfDay(new Date(start));
  const endDay = startOfDay(new Date(end));

  while (current <= endDay) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(0, count - 1); // Don't count the start day fully
}

/**
 * Get remaining business time in milliseconds.
 */
export function getRemainingBusinessMs(now: Date, deadline: Date): number {
  if (now >= deadline) {
    // Already past deadline — return negative elapsed
    return -(getElapsedBusinessHours(deadline, now) * 60 * 60 * 1000);
  }
  return getElapsedBusinessHours(now, deadline) * 60 * 60 * 1000;
}

// ── Trimester Utilities ──

export function getCurrentTrimester(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const quarter = Math.floor(month / 3);

  const start = new Date(year, quarter * 3, 1);
  const end = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);

  return {
    start,
    end,
    label: `Q${quarter + 1} ${year}`,
  };
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}
