import { Category } from "../services/api";
import {
  AppLanguage,
  en,
  hasTranslationKey,
  translate,
} from "../i18n/translations";

/**
 * Shared category label helper (HE-36 categories, reused by HE-27).
 *
 * Content stores only the immutable category *key* (e.g. "Story"); the text
 * an elder or youth reads comes from the categories API, so a label an admin
 * renames shows up everywhere without a data change. An unknown or
 * deactivated key falls back to the stored value so the item still reads
 * sensibly while the list of categories is loading.
 *
 * Always prefer this over `categories.find(...)` in screens so every surface
 * (detail, cards, chips) resolves a key the same way.
 *
 * i18n: with a `language` the *built-in default* label (still equal to the
 * English default for that key) is translated to `category.<key>`; custom /
 * admin-renamed labels are user data and always pass through untouched.
 * Omitting `language` keeps the historical English behaviour.
 */
export function categoryLabel(
  categories: Category[] | undefined,
  key?: string | null,
  language?: AppLanguage
): string {
  const stored = (key ?? "").trim();
  if (!stored) return "";

  const match = categories?.find(
    (category) => category.key.toLowerCase() === stored.toLowerCase()
  );

  const label = match?.label || stored;
  if (!language || language === "en") return label;

  const builtinKey = `category.${stored}`;
  if (hasTranslationKey(builtinKey) && label === en[builtinKey]) {
    return translate(language, builtinKey);
  }
  return label;
}
