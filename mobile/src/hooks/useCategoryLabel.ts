import { Category } from "../services/api";
import { useAppSettings } from "../context/AppSettingsContext";
import { categoryLabel } from "../utils/categoryLabel";

/**
 * `categoryLabel` bound to the active app language, so call sites stay short:
 *
 *   const categoryLabel = useCategoryLabel(categories);
 *   categoryLabel(item.categoryKey);
 *
 * Built-in default labels follow the app language; custom / admin-renamed
 * labels always pass through untranslated (they are user data).
 */
export function useCategoryLabel(categories?: Category[]) {
  const { language } = useAppSettings();
  return (key?: string | null) => categoryLabel(categories, key, language);
}
