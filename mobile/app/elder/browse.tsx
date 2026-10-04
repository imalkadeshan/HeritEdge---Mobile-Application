import { BrowseContentScreen } from "../../src/components";

/**
 * Elder route for Browse by Category (HE-29).
 *
 * Same shared screen as the youth route; cards here open the elder detail
 * route, where the owning elder also reaches Edit/Delete (HE-27).
 */
export default function ElderBrowseRoute() {
  return <BrowseContentScreen role="elder" />;
}
