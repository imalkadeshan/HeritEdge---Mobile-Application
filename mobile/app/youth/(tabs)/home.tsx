import { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, TextInput, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText, AppCard } from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { useUser } from "../../../src/context/UserContext";
import { apiGetAllContent } from "../../../src/services/api";

const CATEGORIES = [
  { label: "All", icon: "📚", value: undefined },
  { label: "Stories", icon: "📖", value: "Story" },
  { label: "Songs", icon: "🎵", value: "Song" },
  { label: "Recipes", icon: "🍽️", value: "Recipe" },
  { label: "Traditions", icon: "🏛️", value: "Tradition" },
  { label: "Proverbs", icon: "💬", value: "Proverb" },
  { label: "Local Words", icon: "📝", value: "Dialect Word" },
];

const CATEGORY_ICONS: Record<string, string> = {
  Story: "📖",
  Proverb: "💬",
  Recipe: "🍽️",
  Tradition: "🏛️",
  Song: "🎵",
  "Dialect Word": "📝",
};

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
  };
}

export default function YouthHomeScreen() {
  const { currentUser } = useUser();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContent = async (search?: string, category?: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (search !== undefined || category !== undefined) setSearching(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await apiGetAllContent(search, category);
      if (result.success && Array.isArray(result.data)) {
        setContent(result.data as ContentItem[]);
      } else {
        setError(result.message || "Failed to load content");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchContent(text.trim() || undefined, selectedCategory);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchContent(undefined, selectedCategory);
  };

  const handleCategorySelect = (value: string | undefined) => {
    setSelectedCategory(value);
    fetchContent(searchQuery.trim() || undefined, value);
  };

  useFocusEffect(
    useCallback(() => {
      fetchContent();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchContent(searchQuery.trim() || undefined, selectedCategory, true)}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <AppText variant="heading">
                Namaste, {currentUser?.name?.split(" ")[0] || "Youth"}
              </AppText>
              <AppText variant="body" color={colors.text.secondary}>
                Explore and preserve your cultural heritage.
              </AppText>
            </View>
            <View style={styles.avatar}>
              <AppText variant="caption" color={colors.primary.contrast}>
                {currentUser?.name?.charAt(0).toUpperCase() || "?"}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <AppText variant="body" color={colors.text.tertiary}>🔍</AppText>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cultural knowledge..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={() => {
                if (searchQuery.trim()) fetchContent(searchQuery.trim());
              }}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <AppText
                variant="body"
                color={colors.text.tertiary}
                onPress={handleClearSearch}
              >
                ✕
              </AppText>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="subheading">Explore Categories</AppText>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => (
              <View
                key={cat.label}
                style={[styles.chip, selectedCategory === cat.value && styles.chipSelected]}
              >
                <AppText
                  variant="caption"
                  color={selectedCategory === cat.value ? colors.primary.contrast : colors.text.primary}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  {cat.icon} {cat.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="subheading">Featured Knowledge</AppText>
            <AppText variant="bodySmall" color={colors.primary.main}>
              See All
            </AppText>
          </View>

          {loading && (
            <AppText variant="body" color={colors.text.secondary}>
              Loading content...
            </AppText>
          )}

          {error && (
            <AppText variant="body" color={colors.error.main}>
              {error}
            </AppText>
          )}

          {searching && (
            <AppText variant="body" color={colors.text.secondary}>
              Searching...
            </AppText>
          )}

          {!loading && !error && !searching && content.length === 0 && searchQuery.trim() && (
            <AppText variant="body" color={colors.text.secondary}>
              No results found for "{searchQuery}". Try a different search.
            </AppText>
          )}

          {!loading && !error && !searching && content.length === 0 && !searchQuery.trim() && selectedCategory && (
            <AppText variant="body" color={colors.text.secondary}>
              No {selectedCategory.toLowerCase()} content available yet.
            </AppText>
          )}

          {!loading && !error && !searching && content.length === 0 && !searchQuery.trim() && !selectedCategory && (
            <AppText variant="body" color={colors.text.secondary}>
              No cultural content available yet. Check back later!
            </AppText>
          )}

          {content.map((item) => (
            <AppCard
              key={item._id}
              style={styles.featuredCard}
              onPress={() =>
                router.push({
                  pathname: "/youth/content-detail",
                  params: { id: item._id },
                })
              }
            >
              {item.imageUrl ? (
                <View style={styles.imagePlaceholder}>
                  <AppText variant="title">🖼️</AppText>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <AppText variant="title">
                    {CATEGORY_ICONS[item.category] || "📄"}
                  </AppText>
                </View>
              )}
              <View style={styles.featuredContent}>
                <View style={styles.tag}>
                  <AppText variant="caption" color={colors.primary.main}>
                    {item.category.toUpperCase()}
                  </AppText>
                </View>
                <AppText variant="subheading">{item.title}</AppText>
                <AppText variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
                  {item.content}
                </AppText>
                <View style={styles.sharedBy}>
                  <View style={styles.sharedAvatar}>
                    <AppText variant="caption" color={colors.primary.contrast}>
                      {item.creator?.name?.charAt(0).toUpperCase() || "?"}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.text.secondary}>
                    Shared by {item.creator?.name || "Unknown"}
                  </AppText>
                </View>
              </View>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="subheading">Knowledge Holders</AppText>
            <AppText variant="bodySmall" color={colors.primary.main}>
              Find More
            </AppText>
          </View>

          <AppCard style={styles.holderCard}>
            <View style={styles.holderAvatar}>
              <AppText variant="caption" color={colors.primary.contrast}>
                SP
              </AppText>
            </View>
            <View style={styles.holderInfo}>
              <AppText variant="label">Sunil Perera</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                Folk Songs, Traditional Farming · Sinhala
              </AppText>
            </View>
            <AppText variant="body" color={colors.text.tertiary}>›</AppText>
          </AppCard>

          <AppCard style={styles.holderCard}>
            <View style={styles.holderAvatar}>
              <AppText variant="caption" color={colors.primary.contrast}>
                DR
              </AppText>
            </View>
            <View style={styles.holderInfo}>
              <AppText variant="label">Dadi Rukmani</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                Oral History, Traditional Recipes · Maithili
              </AppText>
            </View>
            <AppText variant="body" color={colors.text.tertiary}>›</AppText>
          </AppCard>

          <AppCard style={styles.holderCard}>
            <View style={styles.holderAvatar}>
              <AppText variant="caption" color={colors.primary.contrast}>
                AJ
              </AppText>
            </View>
            <View style={styles.holderInfo}>
              <AppText variant="label">Anand Jha</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                Bhojpuri Proverbs, Local Legends · Bho...
              </AppText>
            </View>
            <AppText variant="body" color={colors.text.tertiary}>›</AppText>
          </AppCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxxxl,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    paddingHorizontal: spacing.xxl,
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
  section: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.primary,
  },
  chipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  featuredCard: {
    padding: 0,
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.background.warm,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    alignSelf: "flex-start",
  },
  sharedBy: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sharedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  holderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  holderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  holderInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
});
