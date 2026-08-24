import { View, StyleSheet, ScrollView, TextInput } from "react-native";
import { AppText, AppCard } from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { useUser } from "../../../src/context/UserContext";

const CATEGORIES = [
  { label: "Stories", icon: "📖", selected: true },
  { label: "Songs", icon: "🎵", selected: false },
  { label: "Recipes", icon: "🍽️", selected: false },
  { label: "Traditions", icon: "🏛️", selected: false },
  { label: "Proverbs", icon: "💬", selected: false },
  { label: "Local Words", icon: "📝", selected: false },
];

export default function YouthHomeScreen() {
  const { currentUser } = useUser();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
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
            />
            <AppText variant="body">⚙️</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="subheading">Explore Categories</AppText>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => (
              <View
                key={cat.label}
                style={[styles.chip, cat.selected && styles.chipSelected]}
              >
                <AppText
                  variant="caption"
                  color={cat.selected ? colors.primary.contrast : colors.text.primary}
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

          <AppCard style={styles.featuredCard}>
            <View style={styles.imagePlaceholder}>
              <AppText variant="title">🏺</AppText>
            </View>
            <View style={styles.featuredContent}>
              <View style={styles.tag}>
                <AppText variant="caption" color={colors.primary.main}>
                  TRADITIONS
                </AppText>
              </View>
              <AppText variant="subheading">The Art of Terracotta Crafting</AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                Discover the deep history of Sinhalese heritage pottery and clay
                modelling that passed down generations.
              </AppText>
              <View style={styles.sharedBy}>
                <View style={styles.sharedAvatar}>
                  <AppText variant="caption" color={colors.primary.contrast}>
                    SP
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.text.secondary}>
                  Shared by Sunil Perera
                </AppText>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.featuredCard}>
            <View style={styles.imagePlaceholder}>
              <AppText variant="title">🍽️</AppText>
            </View>
            <View style={styles.featuredContent}>
              <View style={styles.tag}>
                <AppText variant="caption" color={colors.primary.main}>
                  RECIPES
                </AppText>
              </View>
              <AppText variant="subheading">Harvest Festival Recipes</AppText>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                Authentic, ancestral harvest foods prepared in Northern Bihar
                during rural seasonal celebrations.
              </AppText>
              <View style={styles.sharedBy}>
                <View style={styles.sharedAvatar}>
                  <AppText variant="caption" color={colors.primary.contrast}>
                    DR
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.text.secondary}>
                  Shared by Dadi Rukmani
                </AppText>
              </View>
            </View>
          </AppCard>
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
