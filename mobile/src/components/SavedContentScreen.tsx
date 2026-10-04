import { useCallback, useRef, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText } from "./AppText";
import { AppHeader } from "./AppHeader";
import { AppButton } from "./AppButton";
import { ContentPreviewCard } from "./ContentPreviewCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useAppSettings } from "../context/AppSettingsContext";
import { apiErrorText } from "../i18n/apiError";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import { Category, SavedEntry, apiGetSavedContent, apiGetCategories } from "../services/api";
import { categoryIcon } from "../utils/categoryIcon";
import { useSafeAreaInsets, stackBottomPadding } from "../utils/safeArea";

/**
 * Saved content list (HE-33).
 *
 * One screen for both roles, rendered by the thin routes
 * app/elder/saved.tsx and the Youth Saved tab - the `role` prop only decides
 * which HE-27 detail route a card opens, and `variant` switches between the
 * pushed stack route (back button, neutral tone) and the Saved tab (title
 * only, warm tone).
 *
 * The list refetches on every focus rather than caching: coming back from
 * the detail screen after un-saving (or logging out and in as someone else)
 * must show what the server holds for the signed-in account right now.
 */
export function SavedContentScreen({
  role,
  variant = "stack",
}: {
  role: "elder" | "youth";
  variant?: "stack" | "tab";
}) {
  const router = useRouter();
  const detailPath =
    role === "elder" ? "/elder/content-detail" : "/youth/content-detail";
  const isTab = variant === "tab";
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { t, language } = useAppSettings();
  // Built-in labels follow the app language; admin-renamed ones pass through.
  const categoryLabel = useCategoryLabel(categories);

  // First focus shows the loading state; a focus after Detail/Back refreshes
  // silently so the list stays put instead of flashing.
  const loadedOnceRef = useRef(false);

  const loadCategories = useCallback(async () => {
    try {
      const result = await apiGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data as Category[]);
      }
    } catch {
      // Labels stay on the stored key until they can be fetched.
    }
  }, []);

  const fetchSaved = useCallback(async (isRefresh = false) => {
    const silent = loadedOnceRef.current;
    if (isRefresh) setRefreshing(true);
    else if (!silent) setLoading(true);
    setError(null);

    try {
      const result = await apiGetSavedContent();

      if (result.success && Array.isArray(result.data)) {
        setEntries(result.data as SavedEntry[]);
      } else {
        if (/authentication|signed out/i.test(result.message)) {
          router.replace("/login");
          return;
        }
        setError(
          apiErrorText(result, language) || t("content.savedLoadFailed")
        );
      }
    } catch {
      setError(t("common.connectionError"));
    } finally {
      loadedOnceRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, t, language]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      fetchSaved();
    }, [fetchSaved, loadCategories])
  );

  const handleRefresh = () => {
    loadCategories();
    fetchSaved(true);
  };

  const renderEmpty = () => (
    <View style={styles.centered}>
      <AppText variant="title">🔖</AppText>
      <AppText variant="body" color={colors.text.secondary} align="center">
        {t("content.savedEmpty")}
      </AppText>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isTab && { backgroundColor: colors.warm.background },
      ]}
    >
      <AppHeader
        title={isTab ? t("nav.saved") : t("home.savedContent")}
        onBack={isTab ? undefined : () => router.back()}
      />

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("content.savedLoading")}
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
            onPress={() => fetchSaved()}
            variant="outline"
            size="sm"
            accessibilityLabel={t("content.savedRetryA11y")}
          />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={entries}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const content = item.content;
            if (!content) return null;

            return (
              <ContentPreviewCard
                imageUrl={content.imageUrl}
                fallbackIcon={categoryIcon(content.category)}
                categoryLabel={categoryLabel(content.category)}
                title={content.title}
                excerpt={content.content}
                contributor={content.creator?.name}
                contributorImage={content.creator?.profileImage}
                warm={isTab}
                onPress={() =>
                  router.push({
                    pathname: detailPath,
                    params: { id: content._id },
                  })
                }
              />
            );
          }}
          ListEmptyComponent={renderEmpty()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          contentContainerStyle={[
            entries.length === 0 ? styles.emptyList : styles.listContent,
            // Bottom edge: the tab bar owns it in the Saved tab; the pushed
            // /saved route has no tab bar, so this screen clears the home
            // indicator instead.
            isTab
              ? null
              : { paddingBottom: stackBottomPadding(insets, spacing.xxxxl) },
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
  centered: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    // paddingBottom is supplied inline from the insets.
    gap: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
});
