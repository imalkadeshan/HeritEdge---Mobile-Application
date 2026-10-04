/**
 * HeritEdge app-language dictionaries (English / Sinhala).
 *
 * Assembly module: domain dictionaries live in ./dictionaries/* and are
 * merged here into flat `en` / `si` maps.
 *
 * - `en` is the source of truth for the key set; each domain file types its
 *   own `si` map as Record<its keys, string>, so per-domain parity is
 *   compile-checked (scripts/check-i18n.js verifies global parity, duplicates
 *   and {placeholder} agreement).
 * - `translate()` falls back to English for any missing key, then to the key
 *   itself, so a gap never renders blank.
 * - Parameters use {name} placeholders (e.g. "Hello, {name}").
 * - ONLY app interface strings belong here. User-authored content (names,
 *   bios, interests, cultural material, stored notification messages) is
 *   never passed through the dictionary as a key.
 * - Sinhala strings are written as natural UI Sinhala, not word-for-word
 *   transliterations.
 */

import { enCommon, siCommon } from "./dictionaries/common";
import { enHome, siHome } from "./dictionaries/home";
import { enProfile, siProfile } from "./dictionaries/profile";
import { enNotifications, siNotifications } from "./dictionaries/notifications";
import { enAuth, siAuth } from "./dictionaries/auth";
import { enElder, siElder } from "./dictionaries/elder";
import { enYouth, siYouth } from "./dictionaries/youth";
import { enContent, siContent } from "./dictionaries/content";
import { enCollab, siCollab } from "./dictionaries/collab";
import { enAdmin, siAdmin } from "./dictionaries/admin";
import { enApi, siApi } from "./dictionaries/api";

export const en = {
  ...enCommon,
  ...enHome,
  ...enProfile,
  ...enNotifications,
  ...enAuth,
  ...enElder,
  ...enYouth,
  ...enContent,
  ...enCollab,
  ...enAdmin,
  ...enApi,
} as const;

export type TranslationKey = keyof typeof en;

const siMerged: Record<string, string> = {
  ...siCommon,
  ...siHome,
  ...siProfile,
  ...siNotifications,
  ...siAuth,
  ...siElder,
  ...siYouth,
  ...siContent,
  ...siCollab,
  ...siAdmin,
  ...siApi,
};

export const si: Record<TranslationKey, string> = siMerged as Record<
  TranslationKey,
  string
>;

export type AppLanguage = "en" | "si";

const dictionaries: Record<AppLanguage, Partial<Record<TranslationKey, string>>> = {
  en,
  si,
};

/** Resolve a key in the active language with English fallback. */
export function translate(
  language: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const template = dictionaries[language][key] ?? en[key] ?? key;
  if (!params) return template;
  return Object.entries(params).reduce((text, [name, value]) => {
    if (value === null || value === undefined) return text;
    return text.split(`{${name}}`).join(String(value));
  }, template);
}

/** True when the key exists in the English dictionary. */
export function hasTranslationKey(key: string): key is TranslationKey {
  return Object.prototype.hasOwnProperty.call(en, key);
}

/**
 * Translate a built-in stored value (category keys, interest options, ...)
 * when a `prefix.value` key exists; otherwise return the value unchanged so
 * custom/admin-edited labels and user-authored text pass through untouched.
 *
 * Stable stored keys are never rewritten - only the rendered label changes.
 */
export function translateBuiltin(
  language: AppLanguage,
  prefix: string,
  value: string
): string {
  const trimmed = value?.trim();
  if (!trimmed) return value;
  const key = `${prefix}.${trimmed}`;
  return hasTranslationKey(key) ? translate(language, key) : value;
}
