import { ContentDetailScreen } from "../../src/components";

/**
 * Youth route for the cultural item detail (HE-27).
 *
 * The screen itself is shared with the elder route so both roles read the
 * same authoritative item; only this route segment differs, which is what
 * AuthGuard keys off.
 */
export default function YouthContentDetailRoute() {
  return <ContentDetailScreen />;
}
