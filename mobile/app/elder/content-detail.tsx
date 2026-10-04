import { ContentDetailScreen } from "../../src/components";

/**
 * Elder route for the cultural item detail (HE-27).
 *
 * Elder cards open this screen first (view), and the owning elder reaches
 * Edit/Delete from the shared footer it renders. Same component as the youth
 * route, so both roles see identical server data.
 */
export default function ElderContentDetailRoute() {
  return <ContentDetailScreen />;
}
