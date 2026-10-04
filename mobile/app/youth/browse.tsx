import { BrowseContentScreen } from "../../src/components";

/**
 * Youth route for Browse by Category (HE-29).
 *
 * The screen is shared with the elder route; only this route segment differs
 * (what AuthGuard keys off) and the role prop, which decides whether a card
 * opens /youth/content-detail.
 */
export default function YouthBrowseRoute() {
  return <BrowseContentScreen role="youth" />;
}
