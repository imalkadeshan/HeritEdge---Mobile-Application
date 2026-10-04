import { BrowseContentScreen } from "../../../src/components";

/**
 * Elder Explore tab.
 *
 * The same shared HE-29 browse screen the /elder/browse stack route renders;
 * as a tab it shows the Explore title (no back button), the warm tone and the
 * Youth-style search bar with dynamic category chips. Cards open the elder
 * detail route (role="elder"), where the owning elder reaches Edit/Delete.
 *
 * Search/category state is read and written against the ELDER bucket of the
 * browseFilters store, so nothing typed here leaks into the Youth Home or
 * Explore screens (and vice versa).
 */
export default function ElderExploreTab() {
  return <BrowseContentScreen role="elder" variant="tab" />;
}
