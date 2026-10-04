import { BrowseContentScreen } from "../../../src/components";

/**
 * Youth Explore tab (Youth home redesign).
 *
 * The same HE-29 browse screen as the pushed /youth/browse route; as a tab it
 * renders with the Explore title (no back button) and adopts the search and
 * category the Home screen last used, so filters carry over between views.
 */
export default function YouthExploreTab() {
  return <BrowseContentScreen role="youth" variant="tab" />;
}
