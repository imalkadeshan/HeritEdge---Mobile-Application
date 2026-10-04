import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText } from "./AppText";
import { AppHeader } from "./AppHeader";
import { AppButton } from "./AppButton";
import { AppIcon } from "./AppIcon";
import { SelectionChip } from "./SelectionChip";
import { ContentPreviewCard } from "./ContentPreviewCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { fontSize } from "../theme/typography";
import { useAppSettings } from "../context/AppSettingsContext";
import { apiErrorText } from "../i18n/apiError";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import { Category, apiGetAllContent, apiGetCategories } from "../services/api";
import { useSafeAreaInsets, stackBottomPadding } from "../utils/safeArea";
import {
  BrowseFilters,
  getBrowseFilters,
  sameBrowseFilters,
  setBrowseFilters,
} from "../services/browseFilters";
import {
  ALL_CATEGORY_ICON,
  CategoryIconName,
  categoryIcon,
} from "../utils/categoryIcon";

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

interface CategoryChip {
  label: string;
  icon: CategoryIconName;
  /** Stable category key; undefined means the "All" choice. */
  key: string | undefined;
}

/**
 * Browse cultural content by category (HE-29).
 *
 * One screen for both roles, rendered by the thin routes
 * app/elder/browse.tsx, app/youth/browse.tsx and the Youth Explore tab - the
 * `role` prop only decides which HE-27 detail route a card opens, and
 * `variant` switches between the pushed stack route (back button, neutral
 * tone) and the Explore tab (title only, warm tone).
 *
 * The chips come straight from GET /api/categories, so they always show the
 * current admin-editable label for each stable key, never offer a
 * deactivated category, and pick up a category an admin adds without a code
 * change. Search and the category filter are independent pieces of state and
 * are sent together, so neither silently clears the other.
 *
 * The chosen pair is also mirrored into the shared browseFilters store: when
 * the youth types a search on Home and then opens Explore, this screen
 * adopts those values on focus (and writes its own back, the other way
 * round), so nothing the user entered is lost between the two views.
 */
export function BrowseContentScreen({
  role,
  variant = "stack",
}: {
  role: "elder" | "youth";
  variant?: "stack" | "tab";
}) {
  const router = useRouter();
  const { t, language, scale } = useAppSettings();
  const insets = useSafeAreaInsets();
  // Bottom safe-area ownership: in the Explore tab the tab bar clears the
  // home indicator, so this screen must not; in the pushed /browse route
  // there is no tab bar, so this screen does.
  const bottomSafeStyle =
    variant === "tab"
      ? null
      : { paddingBottom: stackBottomPadding(insets, spacing.xxxxl) };
  const detailPath =
    role === "elder" ? "/elder/content-detail" : "/youth/content-detail";

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(
    () => getBrowseFilters(role).search
  );
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >(() => getBrowseFilters(role).category);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The filters this screen is showing. Kept in a ref so the focus-time
  // adoption below can compare against live state without a stale closure.
  const appliedRef = useRef<BrowseFilters>(getBrowseFilters(role));

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Built-in labels follow the app language; admin-renamed ones pass through.
  const categoryLabel = useCategoryLabel(categories);

  /** Publishes a filter pair to this screen, the store and the server. */
  const applyFilters = (
    next: BrowseFilters,
    options: { fetch?: boolean; refresh?: boolean } = {}
  ) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    appliedRef.current = next;
    setBrowseFilters(role, next);
    setSearchQuery(next.search);
    setSelectedCategory(next.category);
    if (options.fetch !== false) {
      fetchContent(
        next.search.trim() || undefined,
        next.category,
        options.refresh
      );
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const result = await apiGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data as Category[]);
      } else {
        setCategoriesError(
          apiErrorText(result, language) || t("home.errorCategories")
        );
      }
    } catch {
      setCategoriesError(t("common.connectionError"));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchContent = async (
    search?: string,
    category?: string,
    isRefresh = false
  ) => {
    if (isRefresh) setRefreshing(true);
    else if (search !== undefined || category !== undefined) setSearching(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await apiGetAllContent(search, category);
      if (result.success && Array.isArray(result.data)) {
        setContent(result.data as ContentItem[]);
      } else {
        setError(apiErrorText(result, language) || t("home.errorContent"));
      }
    } catch {
      setError(t("common.connectionError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  // Initial load only: coming back from the detail screen finds this screen
  // still mounted, so the chosen category and search box are untouched. The
  // first load honours whatever the Home screen last put in the store.
  useEffect(() => {
    const initial = appliedRef.current;
    fetchContent(initial.search.trim() || undefined, initial.category);
    fetchCategories();
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // Mount only - see the comment above.
  }, []);

  // Adopt the shared filters whenever this screen gains focus: the youth may
  // have typed a search or picked a category on Home in the meantime. Runs on
  // mount too, where the values already match, so it is a no-op there.
  useFocusEffect(
    useCallback(() => {
      const shared = getBrowseFilters(role);
      if (sameBrowseFilters(shared, appliedRef.current)) return;

      appliedRef.current = shared;
      setSearchQuery(shared.search);
      setSelectedCategory(shared.category);
      fetchContent(shared.search.trim() || undefined, shared.category);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    appliedRef.current = { ...appliedRef.current, search: text };
    setBrowseFilters(role, { search: text });
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      // The category stays whatever it is: only this line and the request
      // below decide the pair of filters the server sees.
      fetchContent(text.trim() || undefined, appliedRef.current.category);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    appliedRef.current = { ...appliedRef.current, search: "" };
    setBrowseFilters(role, { search: "" });
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    fetchContent(undefined, appliedRef.current.category);
  };

  const handleCategorySelect = (key: string | undefined) => {
    applyFilters({ search: appliedRef.current.search, category: key });
  };

  const handleClearFilters = () => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    applyFilters({ search: "", category: undefined });
  };

  // Refresh reloads the choice list too, so a category an admin just added,
  // renamed or deactivated shows up without leaving the screen.
  const handleRefresh = () => {
    fetchCategories();
    fetchContent(searchQuery.trim() || undefined, selectedCategory, true);
  };

  // "All" plus every *active* category, straight from the API: a deactivated
  // category is no longer offered, and a renamed one shows its new label.
  // Labels resolve through t()/categoryLabel each render, so a language
  // switch updates every chip immediately; the stable key drives selection
  // and the API filter.
  const categoryChips: CategoryChip[] = [
    { label: t("content.all"), icon: ALL_CATEGORY_ICON, key: undefined },
    ...categories.map((category) => ({
      label: categoryLabel(category.key),
      icon: categoryIcon(category.key),
      key: category.key,
    })),
  ];

  const selectedLabel = categoryLabel(selectedCategory);
  const hasFilters = Boolean(searchQuery.trim() || selectedCategory);

  const renderEmpty = () => {
    // While a search is in flight the "Searching..." note under the chips is
    // the feedback; keep the list area quiet instead of flashing an empty
    // message that the results will replace a moment later.
    if (searching) {
      return <View style={styles.centered} />;
    }

    return (
      <View style={styles.centered}>
        {selectedCategory ? (
          <AppText variant="title">{selectedLabel}</AppText>
        ) : (
          <AppIcon
            name={ALL_CATEGORY_ICON}
            size={32}
            color={colors.text.primary}
          />
        )}
        {searchQuery.trim() && selectedCategory ? (
          <AppText variant="body" color={colors.text.secondary}>
            {t("content.noResultsInCategory", {
              query: searchQuery.trim(),
              category: selectedLabel,
            })}
          </AppText>
        ) : searchQuery.trim() ? (
          <AppText variant="body" color={colors.text.secondary}>
            {t("content.noResultsFor", { query: searchQuery.trim() })}
          </AppText>
        ) : selectedCategory ? (
          <AppText variant="body" color={colors.text.secondary}>
            {t("content.emptyCategory", { category: selectedLabel })}
          </AppText>
        ) : (
          <AppText variant="body" color={colors.text.secondary}>
            {t("content.emptyBrowse")}
          </AppText>
        )}
        {hasFilters && (
          <AppButton
            label={t("content.clearFilters")}
            onPress={handleClearFilters}
            variant="outline"
            size="sm"
          />
        )}
      </View>
    );
  };

  const isTab = variant === "tab";

  return (
    <View
      style={[
        styles.container,
        isTab && { backgroundColor: colors.warm.background },
      ]}
    >
      <AppHeader
        title={isTab ? t("nav.explore") : t("content.browseByCategory")}
        onBack={isTab ? undefined : () => router.back()}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <AppIcon name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={[
              styles.searchInput,
              // Raw TextInput: apply the Text Size preference manually.
              { fontSize: Math.max(fontSize.xs, Math.round(14 * scale)) },
            ]}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              if (searchTimeout.current) clearTimeout(searchTimeout.current);
              fetchContent(searchQuery.trim() || undefined, selectedCategory);
            }}
            returnKeyType="search"
            accessibilityLabel={t("content.searchKnowledgeA11y")}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t("content.clearSearch")}
            >
              <AppIcon name="x" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.chipsSection}>
        {categoriesLoading && (
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t("home.loadingCategories")}
          </AppText>
        )}
        {categoriesError && (
          <View style={styles.categoriesError}>
            <AppText variant="caption" color={colors.error.main}>
              {categoriesError}
            </AppText>
            <AppText
              variant="caption"
              color={colors.primary.main}
              onPress={fetchCategories}
              accessibilityRole="button"
            >
              {t("home.tapToRetry")}
            </AppText>
          </View>
        )}
        <View style={styles.chipsRow}>
          {categoryChips.map((cat) => (
            <SelectionChip
              key={cat.key ?? "all"}
              icon={cat.icon}
              label={cat.label}
              selected={selectedCategory === cat.key}
              onPress={() => handleCategorySelect(cat.key)}
              accessibilityLabel={t("content.categoryA11y", {
                label: cat.label,
              })}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === cat.key }}
            />
          ))}
        </View>
        {searching && (
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {t("home.searching")}
          </AppText>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("home.loadingContent")}
          </AppText>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>
            {error}
          </AppText>
          <AppButton
            label={t("common.retry")}
            onPress={() => fetchContent(searchQuery.trim() || undefined, selectedCategory)}
            variant="outline"
            size="sm"
          />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={content}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ContentPreviewCard
              imageUrl={item.imageUrl}
              fallbackIcon={categoryIcon(item.category)}
              categoryLabel={categoryLabel(item.category)}
              title={item.title}
              excerpt={item.content}
              contributor={item.creator?.name}
              contributorImage={item.creator?.profileImage}
              warm={isTab}
              onPress={() =>
                router.push({
                  pathname: detailPath,
                  params: { id: item._id },
                })
              }
            />
          )}
          ListEmptyComponent={renderEmpty()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          contentContainerStyle={[
            content.length === 0 ? styles.emptyList : styles.listContent,
            bottomSafeStyle,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchSection: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  chipsSection: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoriesError: {
    gap: spacing.xxs,
  },
  centered: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    // paddingBottom is supplied inline from the insets (see bottomSafeStyle).
    gap: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
});
