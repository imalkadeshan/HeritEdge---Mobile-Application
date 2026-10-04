import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { AppText, AppCard, AppButton, UserAvatar } from "./";
import { ContributionCard, ContributionData } from "./ContributionCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useAppSettings } from "../context/AppSettingsContext";
import { Category, apiGetCategories } from "../services/api";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import { useSafeAreaInsets, stackBottomPadding } from "../utils/safeArea";

export interface WorkspaceData {
  _id: string;
  contentId: {
    _id: string;
    title: string;
    category: string;
    description: string;
    culturalBackground?: string;
    tags?: string[];
    creator?: string;
  };
  fromUser: { _id: string; name: string; profileImage?: string | null };
  toElder: { _id: string; name: string; profileImage?: string | null };
  message: string;
  status: "accepted";
  createdAt: string;
}

interface Props {
  data: WorkspaceData;
  role: "youth" | "elder";
  contributions?: ContributionData[];
  onAddContribution?: () => void;
  onEditContribution?: (contribution: ContributionData) => void;
  onApproveContribution?: (contributionId: string) => void;
  onRequestChangesContribution?: (contributionId: string, feedback: string) => void;
  reviewing?: boolean;
}

export default function CollaborationWorkspace({
  data,
  role,
  contributions = [],
  onAddContribution,
  onEditContribution,
  onApproveContribution,
  onRequestChangesContribution,
  reviewing = false,
}: Props) {
  const { t } = useAppSettings();
  const insets = useSafeAreaInsets();
  const elderName = data.toElder?.name || t("profile.roleElder");
  const youthName = data.fromUser?.name || t("profile.roleYouth");
  const content = data.contentId;

  // Display labels come from the categories API: built-in defaults follow the
  // app language, admin-renamed and custom labels always pass through.
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryLabel = useCategoryLabel(categories);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await apiGetCategories();
      if (active && result.success && Array.isArray(result.data)) {
        setCategories(result.data as Category[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const pendingReviewContributions = contributions.filter(
    (c) => c.status === "pending_review"
  );

  return (
    <ScrollView
      style={styles.scroll}
      // A pushed screen with no tab bar above it, so this owns the bottom
      // edge: the last card clears the home indicator exactly once.
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: stackBottomPadding(insets, spacing.xxxxl) },
      ]}
    >
      {/* Participants Banner */}
      <View style={styles.participantsBanner}>
        <View style={styles.participant}>
          <UserAvatar
            name={elderName}
            profileImage={data.toElder?.profileImage}
            size={48}
            style={[styles.avatar, styles.elderAvatar]}
            textVariant="caption"
          />
          <AppText variant="label">{elderName}</AppText>
          <AppText variant="caption" color={colors.text.tertiary}>
            {t("profile.roleElder")}
          </AppText>
        </View>
        <View style={styles.connectionLine}>
          <View style={styles.line} />
          <View style={styles.statusDot} />
          <View style={styles.line} />
        </View>
        <View style={styles.participant}>
          <UserAvatar
            name={youthName}
            profileImage={data.fromUser?.profileImage}
            size={48}
            style={[styles.avatar, styles.youthAvatar]}
            textVariant="caption"
          />
          <AppText variant="label">{youthName}</AppText>
          <AppText variant="caption" color={colors.text.tertiary}>
            {t("profile.roleYouth")}
          </AppText>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
        <AppText variant="caption" color="#2E7D32">
          {t("collab.collabAccepted")}
        </AppText>
      </View>

      {/* Original Content Card */}
      <View style={styles.section}>
        <AppText variant="subheading">{t("collab.originalItem")}</AppText>
        <AppCard style={styles.contentCard}>
          <View style={styles.contentHeader}>
            {/* Category badge sits ABOVE the title. As a row, a long
                user-authored title and the badge are both non-shrinking flex
                children, so the badge was pushed past the card edge; stacked,
                each child gets the full card content width and wraps. */}
            <View style={styles.categoryBadge}>
              <AppText variant="caption" color={colors.primary.contrast}>
                {categoryLabel(content.category)}
              </AppText>
            </View>
            <AppText variant="title" style={styles.contentTitle}>
              {content.title}
            </AppText>
          </View>

          {content.description ? (
            <AppText variant="body" color={colors.text.secondary}>
              {content.description}
            </AppText>
          ) : null}

          {content.culturalBackground ? (
            <View style={styles.fieldBlock}>
              <AppText variant="label">{t("profile.culturalBackground")}</AppText>
              <AppText variant="body" color={colors.text.secondary}>
                {content.culturalBackground}
              </AppText>
            </View>
          ) : null}

          {content.tags && content.tags.length > 0 ? (
            <View style={styles.fieldBlock}>
              <AppText variant="label">{t("collab.tags")}</AppText>
              <View style={styles.tagsRow}>
                {content.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <AppText variant="caption" color={colors.text.secondary}>
                      {tag}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </AppCard>
      </View>

      {/* Collaboration Message */}
      <View style={styles.section}>
        <AppText variant="subheading">{t("collab.collabMessage")}</AppText>
        <AppCard style={styles.messageCard}>
          <AppText variant="body" color={colors.text.secondary} style={styles.quote}>
            &ldquo;{data.message}&rdquo;
          </AppText>
        </AppCard>
      </View>

      {/* Contributions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subheading">
            {role === "elder" ? t("collab.youthContributions") : t("collab.yourContributions")}
          </AppText>
          {role === "youth" && onAddContribution ? (
            <AppButton
              label={t("collab.add")}
              variant="primary"
              size="sm"
              onPress={onAddContribution}
            />
          ) : null}
        </View>

        {contributions.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <AppText variant="body" color={colors.text.tertiary} style={styles.emptyText}>
              {role === "elder"
                ? t("collab.emptyContributionsElder")
                : t("collab.emptyContributionsYouth")}
            </AppText>
          </AppCard>
        ) : (
          contributions.map((contrib) => (
            <ContributionCard
              key={contrib._id}
              contribution={contrib}
              role={role}
              onEdit={onEditContribution}
              showReviewActions={false}
            />
          ))
        )}
      </View>

      {/* Elder Review Queue */}
      {role === "elder" && (
        <View style={styles.section}>
          <AppText variant="subheading">{t("collab.reviewQueue")}</AppText>
          {pendingReviewContributions.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppText variant="body" color={colors.text.tertiary} style={styles.emptyText}>
                {t("collab.nothingToReview")}
              </AppText>
            </AppCard>
          ) : (
            pendingReviewContributions.map((contrib) => (
              <ContributionCard
                key={contrib._id}
                contribution={contrib}
                role={role}
                onApprove={onApproveContribution}
                onRequestChanges={onRequestChangesContribution}
                reviewing={reviewing}
              />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    // paddingBottom is supplied inline from the insets.
    gap: spacing.lg,
  },
  participantsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  participant: {
    alignItems: "center",
    gap: spacing.xxs,
    minWidth: 80,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  elderAvatar: {
    backgroundColor: colors.primary.dark,
  },
  youthAvatar: {
    backgroundColor: colors.primary.main,
  },
  connectionLine: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    maxWidth: 60,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.surface.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentCard: {
    gap: spacing.md,
  },
  contentHeader: {
    // A column, not a row: one consistent gap between the badge and the title,
    // and both stay inside the card's horizontal padding.
    gap: spacing.sm,
  },
  contentTitle: {
    // React Native defaults flexShrink to 0, which is what let the title
    // demand more width than the card had. These let it wrap inside it.
    minWidth: 0,
    flexShrink: 1,
  },
  categoryBadge: {
    // Hugs the leading edge, and a long custom label wraps at the card's
    // content width instead of overflowing it - no fixed width or height, so
    // Sinhala and Large text are never clipped.
    alignSelf: "flex-start",
    maxWidth: "100%",
    minWidth: 0,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  messageCard: {
    gap: spacing.sm,
  },
  quote: {
    fontStyle: "italic",
  },
  emptyCard: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});
