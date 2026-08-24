import { View, StyleSheet, ScrollView } from "react-native";
import { AppText, AppCard, AppButton } from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { useUser } from "../../../src/context/UserContext";

export default function ElderHomeScreen() {
  const { currentUser } = useUser();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <AppText variant="subheading">HeritEdge</AppText>
            <View style={styles.headerIcons}>
              <View style={styles.iconCircle}>
                <AppText variant="body">🔔</AppText>
              </View>
              <View style={styles.avatarSmall}>
                <AppText variant="caption" color={colors.primary.contrast}>
                  {currentUser?.name?.charAt(0).toUpperCase() || "?"}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.greeting}>
          <AppText variant="heading">
            Good morning, {currentUser?.name?.split(" ")[0] || "Elder"}
          </AppText>
          <AppText variant="body" color={colors.text.secondary}>
            Your cultural knowledge matters
          </AppText>
        </View>

        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <AppText variant="label">My Space</AppText>
              <View style={styles.statIconOrange} />
            </View>
            <AppText variant="heading">12</AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              Contributions
            </AppText>
          </AppCard>

          <AppCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <AppText variant="label">To Review</AppText>
              <AppText variant="body">🔔</AppText>
            </View>
            <AppText variant="heading" color={colors.primary.main}>
              3 waiting
            </AppText>
          </AppCard>
        </View>

        <View style={styles.shareSection}>
          <AppButton
            label="+ Share Knowledge"
            onPress={() => {}}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <AppText variant="subheading">Your Recent Activity</AppText>

          <AppCard style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.tag}>
                <AppText variant="caption" color={colors.primary.main}>
                  Traditions
                </AppText>
              </View>
              <View style={styles.publishedBadge}>
                <AppText variant="caption" color={colors.success.main}>
                  PUBLISHED
                </AppText>
              </View>
            </View>
            <AppText variant="subheading">The Art of Terracotta</AppText>
            <View style={styles.activityFooter}>
              <View style={styles.dot} />
              <AppText variant="caption" color={colors.text.secondary}>
                2 youth contributions attached
              </AppText>
            </View>
          </AppCard>

          <AppCard style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.tag}>
                <AppText variant="caption" color={colors.primary.main}>
                  Recipes
                </AppText>
              </View>
              <View style={styles.draftBadge}>
                <AppText variant="caption" color={colors.text.tertiary}>
                  DRAFT
                </AppText>
              </View>
            </View>
            <AppText variant="subheading">Traditional Monsoon Dishes</AppText>
          </AppCard>
        </View>

        <View style={styles.section}>
          <AppText variant="subheading">Collaboration Requests</AppText>

          <AppCard style={styles.collabCard}>
            <View style={styles.collabHeader}>
              <View style={styles.collabAvatar}>
                <AppText variant="caption" color={colors.primary.contrast}>
                  PS
                </AppText>
              </View>
              <View style={styles.collabInfo}>
                <AppText variant="label">Priya Sharma</AppText>
                <AppText variant="caption" color={colors.text.secondary}>
                  Wants to help translate your story
                </AppText>
              </View>
            </View>
            <AppText variant="bodySmall" color={colors.text.secondary} style={styles.quote}>
              "I would love to help translate your terracotta pottery story into English..."
            </AppText>
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
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    gap: spacing.xs,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIconOrange: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
  },
  shareSection: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  activityCard: {
    gap: spacing.sm,
  },
  activityHeader: {
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
  publishedBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  draftBadge: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  activityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
  },
  collabCard: {
    gap: spacing.md,
  },
  collabHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  collabAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  collabInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  quote: {
    fontStyle: "italic",
  },
});
