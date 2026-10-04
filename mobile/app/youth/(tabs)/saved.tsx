import { SavedContentScreen } from "../../../src/components";

/**
 * Youth Saved tab (Youth home redesign).
 *
 * The same HE-33 saved screen the old /youth/saved route rendered, now the
 * Saved tab (Saved title, no back button) in the warm tab tone. It refetches
 * on focus, so un-saving from the detail screen is reflected immediately.
 */
export default function YouthSavedTab() {
  return <SavedContentScreen role="youth" variant="tab" />;
}
