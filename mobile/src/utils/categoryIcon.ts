/**
 * Shared category icon helper.
 *
 * Maps the API's category keys (keys and labels are unchanged) to outlined
 * Feather glyph names, so the same category always renders the same vector
 * icon on Home, Explore, Saved, content detail and the admin screens.
 *
 * Returns a glyph name - render it with <AppIcon name={categoryIcon(key)} />.
 * The six original keys have a hand-picked icon; any other key (i.e. a
 * category an admin created later) falls back to a generic one, so a new
 * category works everywhere without another code change.
 */

export type CategoryIconName =
  | "book-open" // Story
  | "message-circle" // Proverb
  | "coffee" // Recipe
  | "flag" // Tradition
  | "music" // Song
  | "message-square" // Dialect Word
  | "tag" // categories created later
  | "grid"; // the "All" choice

const CATEGORY_ICONS: Record<string, CategoryIconName> = {
  Story: "book-open",
  Proverb: "message-circle",
  Recipe: "coffee",
  Tradition: "flag",
  Song: "music",
  "Dialect Word": "message-square",
};

export const FALLBACK_CATEGORY_ICON: CategoryIconName = "tag";

/** Icon for the "All" chip (every category, no filter). */
export const ALL_CATEGORY_ICON: CategoryIconName = "grid";

/** Case-insensitive icon lookup with a fallback for unknown categories. */
export function categoryIcon(key?: string | null): CategoryIconName {
  if (!key || !key.trim()) return FALLBACK_CATEGORY_ICON;

  const normalized = key.trim().toLowerCase();
  const match = Object.keys(CATEGORY_ICONS).find(
    (known) => known.toLowerCase() === normalized
  );

  return match ? CATEGORY_ICONS[match] : FALLBACK_CATEGORY_ICON;
}
