import { AppLanguage, TranslationKey, hasTranslationKey, translate } from "./translations";

/**
 * Uniform rendering for backend failure payloads.
 *
 * The backend returns `{ success: false, message, code? }`; when a `code` is
 * present and a matching `api.<CODE>` key exists, the UI shows the localized
 * string; otherwise it falls back to the stored English `message` (also what
 * legacy/no-code responses produce).
 *
 * Use at the surface points: `Alert.alert(apiErrorText(result, t))` or
 * `setError(apiErrorText(result, t))`.
 */

interface ErrorLike {
  message?: string;
  code?: string;
}

export function apiErrorText(
  result: ErrorLike | null | undefined,
  language: AppLanguage,
  t?: (key: TranslationKey, params?: Record<string, string | number | boolean | null | undefined>) => string
): string {
  const code = result?.code?.trim();
  if (code && hasTranslationKey(`api.${code}`)) {
    const key = `api.${code}` as TranslationKey;
    return t ? t(key) : translate(language, key);
  }
  return result?.message ?? "";
}
