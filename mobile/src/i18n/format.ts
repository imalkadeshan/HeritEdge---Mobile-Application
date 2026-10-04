/**
 * Locale-aware formatting helpers (English / Sinhala).
 *
 * Deliberately hand-rolled (fixed month tables, ASCII digits) instead of
 * relying on `Intl`, so behaviour is identical on every device/OS. Sinhala
 * dates use the common abbreviated Sinhala month names; day-month order
 * follows Sinhala convention (year first).
 */

import { AppLanguage, TranslationKey, translate } from "./translations";

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_SI = [
  "ජන.", "පෙබ.", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
  "ජූලි", "අගෝ.", "සැප්.", "ඔක්.", "නොවැ.", "දෙසැ.",
];

function toDate(value: string | number | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "5 Oct 2026" (en) / "2026 ඔක්. 5" (si); empty string when invalid. */
export function formatDate(
  value: string | number | Date,
  language: AppLanguage
): string {
  const d = toDate(value);
  if (!d) return "";
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  return language === "si"
    ? `${year} ${MONTHS_SI[month]} ${day}`
    : `${day} ${MONTHS_EN[month]} ${year}`;
}

/** Date + time, 24h; used where the exact moment matters (admin lists). */
export function formatDateTime(
  value: string | number | Date,
  language: AppLanguage
): string {
  const d = toDate(value);
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d, language)} ${hh}:${mm}`;
}

/**
 * Locale-aware relative time for notification/audit feeds:
 * "Just now" / "5m ago" / "3h ago" / "2d ago", then an absolute date.
 */
export function formatRelativeTime(
  value: string | number | Date,
  language: AppLanguage,
  t: (
    key: TranslationKey,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => string
): string {
  const d = toDate(value);
  if (!d) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return t("time.justNow");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t("time.hoursAgo", { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return t("time.daysAgo", { count: diffDay });
  return formatDate(d, language);
}

/** Counts render with ASCII digits in both languages (app-wide convention). */
export function formatCount(value: number): string {
  return String(value);
}

/** Translate a built-in stored value via `prefix.value` when a key exists. */
export { translateBuiltin } from "./translations";
