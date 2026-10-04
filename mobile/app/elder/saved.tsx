import { SavedContentScreen } from "../../src/components";

/**
 * Elder route for Saved Content (HE-33).
 *
 * Same shared screen as the youth route; cards here open the elder detail
 * route, where the owning elder also reaches Edit/Delete (HE-27).
 */
export default function ElderSavedRoute() {
  return <SavedContentScreen role="elder" />;
}
