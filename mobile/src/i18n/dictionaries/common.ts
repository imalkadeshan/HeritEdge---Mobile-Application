/**
 * Common dictionary: shared actions, navigation, states, time strings,
 * built-in category labels and built-in interest options.
 *
 * Built-in values (category keys like "Story", interest options like
 * "Stories") are namespaced after the RAW stored value so `translateBuiltin`
 * can look them up without a separate table. Custom/admin-edited values that
 * don't match a key pass through untranslated.
 */

export const enCommon = {
  // Common actions / states
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.retry": "Retry",
  "common.loading": "Loading...",
  "common.close": "Close",
  "common.done": "Done",
  "common.next": "Next",
  "common.skip": "Skip",
  "common.confirm": "Confirm",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.remove": "Remove",
  "common.apply": "Apply",
  "common.clear": "Clear",
  "common.search": "Search",
  "common.errorTitle": "Something went wrong. Please try again.",
  "common.connectionError": "Could not connect to the server",
  "common.getStarted": "Get Started",
  "common.noResults": "No results found",
  "common.optional": "Optional",
  "common.required": "Required",
  "common.yes": "Yes",
  "common.no": "No",
  "common.on": "On",
  "common.off": "Off",

  // Bottom navigation (Elder + Youth tabs, Admin tabs)
  "nav.home": "Home",
  "nav.explore": "Explore",
  "nav.myContent": "My Content",
  "nav.collaborate": "Collaborate",
  "nav.saved": "Saved",
  "nav.profile": "Profile",
  "nav.dashboard": "Dashboard",
  "nav.users": "Users",
  "nav.contents": "Contents",

  // Relative time (notifications, feeds)
  "time.justNow": "Just now",
  "time.minutesAgo": "{count}m ago",
  "time.hoursAgo": "{count}h ago",
  "time.daysAgo": "{count}d ago",

  // Built-in categories (keyed by the immutable stored key)
  "category.Story": "Story",
  "category.Proverb": "Proverb",
  "category.Recipe": "Recipe",
  "category.Tradition": "Tradition",
  "category.Song": "Song",
  "category.Dialect Word": "Dialect Word",

  // Built-in cultural interest options (keyed by the stored English value)
  "interest.Local Language": "Local Language",
  "interest.Stories": "Stories",
  "interest.Songs": "Songs",
  "interest.Recipes": "Recipes",
  "interest.Proverbs": "Proverbs",
  "interest.Traditions": "Traditions",
  "interest.Traditional Food": "Traditional Food",
  "interest.Farming": "Farming",
  "interest.Crafts": "Crafts",
  "interest.Folklore": "Folklore",
  "interest.Local History": "Local History",
  "interest.Local Words": "Local Words",
} as const;

export type CommonKey = keyof typeof enCommon;

export const siCommon: Record<CommonKey, string> = {
  // Common actions / states
  "common.back": "ආපසු",
  "common.cancel": "අවලංගු කරන්න",
  "common.save": "සුරකින්න",
  "common.retry": "නැවත උත්සාහ කරන්න",
  "common.loading": "පූරණය වෙමින්...",
  "common.close": "වසන්න",
  "common.done": "සම්පූර්ණයි",
  "common.next": "ඊළඟ",
  "common.skip": "මඟ හරින්න",
  "common.confirm": "තහවුරු කරන්න",
  "common.delete": "මකන්න",
  "common.edit": "සංස්කරණය",
  "common.remove": "ඉවත් කරන්න",
  "common.apply": "යොදන්න",
  "common.clear": "හිස් කරන්න",
  "common.search": "සොයන්න",
  "common.errorTitle": "යමක් වැරදියි. නැවත උත්සාහ කරන්න.",
  "common.connectionError": "සේවාදායකයට සම්බන්ධ විය නොහැක",
  "common.getStarted": "ආරම්භ කරන්න",
  "common.noResults": "ප්‍රතිඵල හමු නොවීය",
  "common.optional": "අවශ්‍ය නැත",
  "common.required": "අවශ්‍යයි",
  "common.yes": "ඔව්",
  "common.no": "නැත",
  "common.on": "ක්‍රියාත්මකයි",
  "common.off": "අක්‍රියයි",

  // Bottom navigation
  "nav.home": "මුල් පිටුව",
  "nav.explore": "සොයා බලන්න",
  "nav.myContent": "මගේ අන්තර්ගතය",
  "nav.collaborate": "සහයෝගය",
  "nav.saved": "සුරකින ලද",
  "nav.profile": "ප්‍රොෆයිල්",
  "nav.dashboard": "උපකරණ පුවරුව",
  "nav.users": "පරිශීලකයින්",
  "nav.contents": "අන්තර්ගත",

  // Relative time
  "time.justNow": "මොහොතකට පෙර",
  "time.minutesAgo": "{count} මි. පෙර",
  "time.hoursAgo": "{count} පැ. පෙර",
  "time.daysAgo": "{count} දා. පෙර",

  // Built-in categories
  "category.Story": "කතාව",
  "category.Proverb": "කියමන",
  "category.Recipe": "ආහාර වට්ටෝරුව",
  "category.Tradition": "සිරිත",
  "category.Song": "ගීතය",
  "category.Dialect Word": "උපභාෂා වචනය",

  // Built-in cultural interest options
  "interest.Local Language": "දේශීය භාෂාව",
  "interest.Stories": "කතා",
  "interest.Songs": "ගීත",
  "interest.Recipes": "වට්ටෝරු",
  "interest.Proverbs": "කියමන්",
  "interest.Traditions": "සිරිත්",
  "interest.Traditional Food": "සාම්ප්‍රදායික ආහාර",
  "interest.Farming": "ගොවිතැන",
  "interest.Crafts": "අත්කම්",
  "interest.Folklore": "ජන කතා",
  "interest.Local History": "දේශීය ඉතිහාසය",
  "interest.Local Words": "දේශීය වචන",
};
