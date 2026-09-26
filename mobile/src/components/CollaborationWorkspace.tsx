import { View, StyleSheet, ScrollView } from "react-native";
import { AppText, AppCard, AppButton } from "./";
import { ContributionCard, ContributionData } from "./ContributionCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";

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
  fromUser: { _id: string; name: string };
  toElder: { _id: string; name: string };
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

const CATEGORY_LABELS: Record<string, string> = {
  story: "Story",
  song: "Song",
  craft: "Craft",
  ritual: "Ritual",
  recipe: "Recipe",
  tradition: "Tradition",
  language: "Language",
  other: "Other",
};

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
  const elderName = data.toElder?.name || "Elder";
  const youthName = data.fromUser?.name || "Youth";
  const content = data.contentId;
  const pendingReviewContributions = contributions.filter(
    (c) => c.status === "pending_review"
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Participants Banner */}
      <View style={styles.participantsBanner}>
        <View style={styles.participant}>
          <View style={[styles.avatar, styles.elderAvatar]}>
            <AppText variant="caption" color={colors.primary.contrast}>
              {elderName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <AppText variant="label">{elderName}</AppText>
          <AppText variant="caption" color={colors.text.tertiary}>Elder</AppText>
        </View>
        <View style={styles.connectionLine}>
          <View style={styles.line} />
          <View style={styles.statusDot} />
          <View style={styles.line} />
        </View>
        <View style={styles.participant}>
          <View style={[styles.avatar, styles.youthAvatar]}>
            <AppText variant="caption" color={colors.primary.contrast}>
              {youthName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <AppText variant="label">{youthName}</AppText>
          <AppText variant="caption" color={colors.text.tertiary}>Youth</AppText>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
        <AppText variant="caption" color="#2E7D32">
          Collaboration Accepted
        </AppText>
      </View>

      {/* Original Content Card */}
      <View style={styles.section}>
        <AppText variant="subheading">Original Cultural Item</AppText>
        <AppCard style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <AppText variant="title">{content.title}</AppText>
            <View style={styles.categoryBadge}>
              <AppText variant="caption" color={colors.primary.contrast}>
                {CATEGORY_LABELS[content.category] || content.category}
              </AppText>
            </View>
          </View>

          {content.description ? (
            <AppText variant="body" color={colors.text.secondary}>
              {content.description}
            </AppText>
          ) : null}

          {content.culturalBackground ? (
            <View style={styles.fieldBlock}>
              <AppText variant="label">Cultural Background</AppText>
              <AppText variant="body" color={colors.text.secondary}>
                {content.culturalBackground}
              </AppText>
            </View>
          ) : null}

          {content.tags && content.tags.length > 0 ? (
            <View style={styles.fieldBlock}>
              <AppText variant="label">Tags</AppText>
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
        <AppText variant="subheading">Collaboration Message</AppText>
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
            {role === "elder" ? "Youth Contributions" : "Your Contributions"}
          </AppText>
          {role === "youth" && onAddContribution ? (
            <AppButton
              label="+ Add"
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
                ? "No contributions submitted yet."
                : "No contributions yet. Start by adding a translation, explanation, transcription, or context."}
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
          <AppText variant="subheading">Review Queue</AppText>
          {pendingReviewContributions.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppText variant="body" color={colors.text.tertiary} style={styles.emptyText}>
                Nothing awaiting review.
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
    paddingBottom: spacing.xxxxl,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  categoryBadge: {
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
