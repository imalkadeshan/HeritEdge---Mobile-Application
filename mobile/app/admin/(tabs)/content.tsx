import { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  AppText,
  AppHeader,
  AppButton,
  AppCard,
  AppIcon,
  SelectionChip,
} from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing, touchTarget } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { categoryIcon } from "../../../src/utils/categoryIcon";
import { useAppSettings } from "../../../src/context/AppSettingsContext";
import { useCategoryLabel } from "../../../src/hooks/useCategoryLabel";
import { apiErrorText } from "../../../src/i18n/apiError";
import { formatDateTime } from "../../../src/i18n/format";
import {
  AdminContentItem,
  AdminContentPagination,
  Category,
  apiAdminGetContent,
  apiAdminGetCategories,
} from "../../../src/services/api";

/**
 * Cultural content (HE-35) - the admin's list of every Elder's items, now
 * the third tab of the admin area (/admin/content - the (tabs) group
 * segment never appears in the URL). AuthGuard stops non-admins from
 * opening it and the server rejects them with 403 anyway. Tapping a row
 * opens the management detail screen, where deletion lives.
 * As a tab root the header shows no Back button.
 *
 * "Manage Categories" sits directly under the header: category management
 * only makes sense next to the content it categorises, so it no longer
 * lives in Settings.
 *
 * The screen reloads page 1 and the category chips whenever it regains
 * focus, so an item deleted (or re-categorised) from the detail screen never
 * lingers, and a category deleted from /admin/categories disappears from
 * these chips. When the admin's own selected category was the deleted one,
 * the filter falls back to All and the list reloads unfiltered - the server
 * would otherwise reject the now-unknown filter key.
 */
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

type Mode = "initial" | "filter" | "more" | "refresh";

interface CategoryChoice {
  label: string;
  /** undefined = no category filter at all ("All"). */
  value: string | undefined;
}

export default function AdminContentListScreen() {
  const router = useRouter();
  const { t, language } = useAppSettings();

  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [pagination, setPagination] = useState<AdminContentPagination | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );

  // Language-aware label for every category key rendered on this screen.
  const categoryLabel = useCategoryLabel(categories);

  // Latest committed filters. Handlers write these synchronously, so a
  // pending debounced search can never fire with a category the admin has
  // already changed.
  const filtersRef = useRef<{ search: string; category: string | undefined }>(
    {
      search: "",
      category: undefined,
    }
  );

  // Monotonic id: only the newest request may touch state, so a slow older
  // response can never overwrite a newer one (rapid filter changes).
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedOnceRef = useRef(false);

  /** Returns the categories it stored, or null when the load failed. */
  const loadCategories = useCallback(async (): Promise<Category[] | null> => {
    try {
      const result = await apiAdminGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
        return result.data;
      }
      // A failed category load only costs the filter chips; the list itself
      // still works, so this never blocks the screen.
    } catch {
      // Same: chips stay hidden, everything else still works.
    }
    return null;
  }, []);

  const runQuery = async (
    page: number,
    search: string,
    category: string | undefined,
    mode: Mode
  ) => {
    const requestId = ++requestIdRef.current;

    setLoading(mode === "initial" || mode === "filter");
    setLoadingMore(mode === "more");
    setRefreshing(mode === "refresh");
    setError(null);
    setLoadMoreError(null);

    try {
      const result = await apiAdminGetContent({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        category,
      });

      if (requestId !== requestIdRef.current) return; // superseded

      if (result.success && result.data) {
        const next = result.data.content;
        setItems((prev) => (page > 1 ? [...prev, ...next] : next));
        setPagination(result.data.pagination);
      } else if (/authentication|signed out/i.test(result.message)) {
        router.replace("/login");
      } else if (page > 1) {
        // Keep what is already on screen and let the admin retry the page.
        setLoadMoreError(
          apiErrorText(result, language) || t("admin.contentLoadMoreError")
        );
      } else {
        setError(
          apiErrorText(result, language) || t("admin.contentLoadError")
        );
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      if (page > 1) {
        setLoadMoreError(t("common.connectionError"));
      } else {
        setError(t("common.connectionError"));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  };

  // Focus covers the first mount too, so there is exactly one initial load.
  // Categories are awaited first: the freshly fetched list tells us whether
  // the selected category still exists, which decides what we query for.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const freshCategories = await loadCategories();
        const selected = filtersRef.current.category;

        if (
          freshCategories &&
          selected &&
          !freshCategories.some((category) => category.key === selected)
        ) {
          // The selected category was deleted while this screen was in the
          // background - fall back to All instead of filtering by a key the
          // server would reject.
          filtersRef.current.category = undefined;
          setActiveCategory(undefined);
        }

        runQuery(
          1,
          filtersRef.current.search,
          filtersRef.current.category,
          focusedOnceRef.current ? "refresh" : "initial"
        );
        focusedOnceRef.current = true;
      })();

      return () => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    filtersRef.current.search = text.trim();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      runQuery(
        1,
        filtersRef.current.search,
        filtersRef.current.category,
        "filter"
      );
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    filtersRef.current.search = "";
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(1, "", filtersRef.current.category, "filter");
  };

  const handleCategorySelect = (value: string | undefined) => {
    setActiveCategory(value);
    filtersRef.current.category = value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(1, filtersRef.current.search, value, "filter");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory(undefined);
    filtersRef.current = { search: "", category: undefined };
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    runQuery(1, "", undefined, "filter");
  };

  const handleRefresh = () => {
    runQuery(
      1,
      filtersRef.current.search,
      filtersRef.current.category,
      "refresh"
    );
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing) return;
    if (!pagination?.hasNextPage) return;
    runQuery(
      pagination.page + 1,
      filtersRef.current.search,
      filtersRef.current.category,
      "more"
    );
  };

  const categoryChoices: CategoryChoice[] = [
    { label: t("admin.filterAll"), value: undefined },
    ...categories.map((category) => ({
      label: categoryLabel(category.key),
      value: category.key,
    })),
  ];

  const hasFilters = Boolean(searchQuery.trim() || activeCategory);

  const itemsUnit = (count: number) =>
    t(count === 1 ? "admin.unitItemsOne" : "admin.unitItemsMany");

  const renderEmpty = () => (
    <View style={styles.centered}>
      <AppText variant="title">📚</AppText>
      <AppText variant="body" color={colors.text.secondary} align="center">
        {hasFilters ? t("admin.emptyContentFiltered") : t("admin.emptyContent")}
      </AppText>
      {hasFilters && (
        <AppButton
          label={t("admin.clearFilters")}
          onPress={handleClearFilters}
          variant="outline"
          size="sm"
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (!pagination || items.length === 0) return null;

    if (loadMoreError) {
      return (
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.error.main} align="center">
            {loadMoreError}
          </AppText>
          <AppButton
            label={t("common.retry")}
            onPress={handleLoadMore}
            variant="outline"
            size="sm"
          />
        </View>
      );
    }

    if (pagination.hasNextPage) {
      return (
        <View style={styles.footer}>
          <AppButton
            label={loadingMore ? t("admin.loadingMore") : t("admin.loadMore")}
            onPress={handleLoadMore}
            variant="outline"
            fullWidth
            disabled={loadingMore}
            accessibilityLabel={t("admin.loadMoreContentA11y")}
          />
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.text.tertiary} align="center">
          {t("admin.showingAll", {
            count: pagination.total,
            unit: itemsUnit(pagination.total),
          })}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t("admin.contentTitle")} />

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.manageCategories}
          onPress={() => router.push("/admin/categories")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("admin.manageCategoriesA11y")}
        >
          <AppIcon name="grid" size={18} color={colors.primary.main} />
          <AppText variant="label" color={colors.primary.main} style={styles.manageCategoriesLabel}>
            {t("admin.manageCategories")}
          </AppText>
          <AppIcon name="chevron-right" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchBar}>
          <AppText variant="body" color={colors.text.tertiary}>
            🔍
          </AppText>
          <TextInput
            style={styles.searchInput}
            placeholder={t("admin.searchContentPlaceholder")}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              if (searchTimeoutRef.current)
                clearTimeout(searchTimeoutRef.current);
              runQuery(
                1,
                filtersRef.current.search,
                filtersRef.current.category,
                "filter"
              );
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t("admin.searchContentA11y")}
          />
          {searchQuery.length > 0 && (
            <AppText
              variant="body"
              color={colors.text.tertiary}
              onPress={handleClearSearch}
              accessibilityRole="button"
            >
              ✕
            </AppText>
          )}
        </View>

        {categories.length > 0 && (
          <View style={styles.chipsRow}>
            {categoryChoices.map((choice) => (
              <SelectionChip
                key={choice.value ?? "all"}
                label={choice.label}
                selected={activeCategory === choice.value}
                onPress={() => handleCategorySelect(choice.value)}
                accessibilityLabel={t("admin.categoryFilterA11y", {
                  label: choice.label,
                })}
                accessibilityRole="button"
                accessibilityState={{ selected: activeCategory === choice.value }}
              />
            ))}
          </View>
        )}

        {!loading && pagination && (
          <AppText variant="caption" color={colors.text.tertiary}>
            {t("admin.showingOf", {
              shown: items.length,
              total: pagination.total,
              unit: itemsUnit(pagination.total),
            })}
          </AppText>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("admin.contentLoading")}
          </AppText>
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main} align="center">
            {error}
          </AppText>
          <AppButton
            label={t("common.retry")}
            onPress={() =>
              runQuery(
                1,
                filtersRef.current.search,
                filtersRef.current.category,
                "initial"
              )
            }
            variant="outline"
            size="sm"
            accessibilityLabel={t("admin.retryContentA11y")}
          />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const created = item.createdAt
              ? formatDateTime(item.createdAt, language)
              : "";
            const updated = item.updatedAt
              ? formatDateTime(item.updatedAt, language)
              : "";

            return (
              <AppCard
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/admin/content-detail",
                    params: { id: item.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={t("admin.manageCardA11y", {
                  title: item.title,
                  name: item.creator.name,
                })}
              >
                <View style={styles.cardHeader}>
                  <AppText variant="label" style={styles.cardTitle}>
                    {item.title}
                  </AppText>
                  <View style={styles.badge}>
                    <AppIcon
                      name={categoryIcon(item.category)}
                      size={14}
                      color={colors.primary.main}
                    />
                    <AppText variant="caption" color={colors.primary.main}>
                      {categoryLabel(item.category)}
                    </AppText>
                  </View>
                </View>

                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t("admin.by", { name: item.creator.name })}
                  {item.creator.email ? ` · ${item.creator.email}` : ""}
                </AppText>

                <AppText variant="caption" color={colors.text.tertiary}>
                  {created
                    ? t("admin.createdOn", { date: created })
                    : t("admin.creationDateUnknown")}
                  {updated ? ` · ${t("admin.updatedOn", { date: updated })}` : ""}
                  {item.imageUrl ? " · 📷" : ""}
                  {item.audioUrl ? " · 🎙" : ""}
                </AppText>
              </AppCard>
            );
          }}
          ListEmptyComponent={renderEmpty()}
          ListFooterComponent={renderFooter()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          contentContainerStyle={
            items.length === 0 ? styles.emptyList : styles.listContent
          }
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
  filters: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  headerActions: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
  },
  // A full-width tappable row rather than a button so the grid icon, the
  // label and the chevron all sit inside one 48pt touch target.
  manageCategories: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.primary,
  },
  manageCategoriesLabel: {
    flex: 1,
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  card: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: {
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  footer: {
    paddingTop: spacing.md,
    gap: spacing.sm,
    alignItems: "center",
  },
});
