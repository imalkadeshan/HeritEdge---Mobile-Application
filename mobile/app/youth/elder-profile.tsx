import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppText, AppHeader, AppCard } from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { apiGetElderById, apiGetAllContent } from "../../src/services/api";

interface ElderData {
  id: string;
  name: string;
  bio: string;
  language: string;
  community: string;
  culturalInterests: string[];
  profileImage: string | null;
}

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  Story: "📖",
  Proverb: "💬",
  Recipe: "🍽️",
  Tradition: "🏛️",
  Song: "🎵",
  "Dialect Word": "📝",
};

export default function ElderProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [elder, setElder] = useState<ElderData | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [elderRes, contentRes] = await Promise.all([
          apiGetElderById(id),
          apiGetAllContent(undefined, undefined),
        ]);
        if (!cancelled) {
          if (elderRes.success && elderRes.data) {
            setElder(elderRes.data as ElderData);
          } else {
            setError(elderRes.message || "Elder not found");
            return;
          }
          if (contentRes.success && Array.isArray(contentRes.data)) {
            const allContent = contentRes.data as ContentItem[];
            setContent(allContent.filter((c) => {
              const creator = (c as unknown as { creator?: { id: string } }).creator;
              return creator?.id === id;
            }));
          }
        }
      } catch {
        if (!cancelled) setError("Could not connect to the server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Elder Profile" onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>Loading profile...</AppText>
        </View>
      </View>
    );
  }

  if (error || !elder) {
    return (
      <View style={styles.container}>
        <AppHeader title="Elder Profile" onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>{error || "Elder not found"}</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={elder.name} onBack={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <AppText variant="title" color={colors.primary.contrast}>
              {elder.name?.charAt(0).toUpperCase() || "?"}
            </AppText>
          </View>
        </View>

        <View style={styles.infoSection}>
          {elder.bio ? (
            <AppText variant="body" color={colors.text.secondary}>{elder.bio}</AppText>
          ) : null}

          <View style={styles.detailRow}>
            {elder.language ? (
              <View style={styles.detailItem}>
                <AppText variant="caption" color={colors.text.tertiary}>Language</AppText>
                <AppText variant="body">{elder.language}</AppText>
              </View>
            ) : null}
            {elder.community ? (
              <View style={styles.detailItem}>
                <AppText variant="caption" color={colors.text.tertiary}>Community</AppText>
                <AppText variant="body">{elder.community}</AppText>
              </View>
            ) : null}
          </View>

          {elder.culturalInterests.length > 0 ? (
            <View style={styles.interestsSection}>
              <AppText variant="caption" color={colors.text.tertiary}>Interests</AppText>
              <View style={styles.interestsRow}>
                {elder.culturalInterests.map((interest) => (
                  <View key={interest} style={styles.interestTag}>
                    <AppText variant="caption">{interest}</AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.contentSection}>
          <AppText variant="subheading">Cultural Items</AppText>
          {content.length === 0 ? (
            <AppText variant="body" color={colors.text.secondary}>
              No cultural items available from this elder yet.
            </AppText>
          ) : (
            content.map((item) => (
              <AppCard
                key={item._id}
                style={styles.contentCard}
                onPress={() =>
                  router.push({
                    pathname: "/youth/collaboration-request",
                    params: {
                      contentId: item._id,
                      contentTitle: item.title,
                      elderId: elder.id,
                      elderName: elder.name,
                    },
                  })
                }
              >
                <View style={styles.contentHeader}>
                  <View style={styles.tag}>
                    <AppText variant="caption" color={colors.primary.main}>
                      {item.category}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.primary.main}>Request ›</AppText>
                </View>
                <AppText variant="subheading">{item.title}</AppText>
                <AppText variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
                  {item.content}
                </AppText>
              </AppCard>
            ))
          )}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxxl,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background.warm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    padding: spacing.xxl,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  detailItem: {
    gap: spacing.xxs,
  },
  interestsSection: {
    gap: spacing.sm,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  interestTag: {
    backgroundColor: colors.background.warm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  contentSection: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  contentCard: {
    gap: spacing.sm,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
});
