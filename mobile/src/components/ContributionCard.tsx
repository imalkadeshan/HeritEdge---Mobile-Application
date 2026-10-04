import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { AppCard } from "./AppCard";
import { AppButton } from "./AppButton";
import { AppInput } from "./AppInput";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useAppSettings } from "../context/AppSettingsContext";
import { TranslationKey } from "../i18n/translations";
import { translateBuiltin } from "../i18n/format";

export type ContributionType = "translation" | "explanation" | "transcription" | "context";
export type ContributionStatus = "pending_review" | "changes_requested" | "approved";

export interface ContributionData {
  _id: string;
  type: ContributionType;
  text: string;
  language: string;
  status: ContributionStatus;
  feedback: string;
  submittedBy: string | { _id: string; name: string };
  createdAt: string;
}

/**
 * Type labels are the shared `contribType.*` keys (resolved through
 * translateBuiltin so the stored English `type` value is never rewritten);
 * only the descriptions live here.
 */
const TYPE_DESC_KEYS: Record<ContributionType, TranslationKey> = {
  translation: "collab.typeDesc.translation",
  explanation: "collab.typeDesc.explanation",
  transcription: "collab.typeDesc.transcription",
  context: "collab.typeDesc.context",
};

const STATUS_STYLES: Record<
  ContributionStatus,
  { bg: string; text: string; labelKey: TranslationKey }
> = {
  pending_review: {
    bg: "#FFF8E1",
    text: "#F9A825",
    labelKey: "collab.status.pending_review",
  },
  changes_requested: {
    bg: "#FFF3E0",
    text: "#E65100",
    labelKey: "collab.status.changes_requested",
  },
  approved: {
    bg: "#E8F5E9",
    text: "#2E7D32",
    labelKey: "collab.status.approved",
  },
};

function getAuthorName(
  submittedBy: string | { _id: string; name: string }
): string | null {
  if (typeof submittedBy === "object" && submittedBy !== null && "name" in submittedBy) {
    return submittedBy.name;
  }
  return null;
}

interface ContributionCardProps {
  contribution: ContributionData;
  role: "youth" | "elder";
  onEdit?: (contribution: ContributionData) => void;
  onApprove?: (contributionId: string) => void;
  onRequestChanges?: (contributionId: string, feedback: string) => void;
  reviewing?: boolean;
  showReviewActions?: boolean;
}

export function ContributionCard({
  contribution,
  role,
  onEdit,
  onApprove,
  onRequestChanges,
  reviewing = false,
  showReviewActions = true,
}: ContributionCardProps) {
  const { t, language } = useAppSettings();
  const typeLabel = translateBuiltin(language, "contribType", contribution.type);
  const typeDescKey = TYPE_DESC_KEYS[contribution.type];
  const statusStyle = STATUS_STYLES[contribution.status];
  const isEditable =
    role === "youth" &&
    (contribution.status === "changes_requested" ||
      contribution.status === "pending_review");
  const isReviewable =
    showReviewActions && role === "elder" && contribution.status === "pending_review";

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackInvalid, setFeedbackInvalid] = useState(false);

  const handleRequestChanges = () => {
    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setFeedbackInvalid(true);
      return;
    }
    setFeedbackInvalid(false);
    onRequestChanges?.(contribution._id, trimmed);
  };

  const handleApprove = () => {
    onApprove?.(contribution._id);
  };

  return (
    <AppCard style={styles.card}>
      {/* Header: Type + Status */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <AppText variant="caption" color={colors.primary.contrast}>
            {typeLabel}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <AppText variant="caption" color={statusStyle.text}>
            {t(statusStyle.labelKey)}
          </AppText>
        </View>
      </View>

      {/* Type Description */}
      <AppText variant="caption" color={colors.text.tertiary}>
        {t(typeDescKey)}
      </AppText>

      {/* Author (elder view only) */}
      {role === "elder" && (
        <AppText variant="caption" color={colors.text.secondary}>
          {t("collab.submittedBy", {
            name: getAuthorName(contribution.submittedBy) ?? t("profile.roleYouth"),
          })}
        </AppText>
      )}

      {/* Language (if present) */}
      {contribution.language ? (
        <View style={styles.languageRow}>
          <AppText variant="caption" color={colors.text.secondary}>
            {t("collab.language", { language: contribution.language })}
          </AppText>
        </View>
      ) : null}

      {/* Text Content */}
      <AppText variant="body" color={colors.text.primary}>
        {contribution.text}
      </AppText>

      {/* Elder Feedback (for changes_requested — shown to both roles) */}
      {contribution.status === "changes_requested" && contribution.feedback ? (
        <View style={styles.feedbackBlock}>
          <AppText variant="label" color={colors.warning.dark}>
            {t("collab.elderFeedback")}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.feedbackText}>
            {contribution.feedback}
          </AppText>
        </View>
      ) : null}

      {/* Elder Review Actions (pending_review only) */}
      {isReviewable && (
        <View style={styles.reviewSection}>
          <AppInput
            label={t("collab.feedbackLabel")}
            value={feedbackText}
            onChangeText={(text: string) => {
              setFeedbackText(text);
              setFeedbackInvalid(false);
            }}
            placeholder={t("collab.feedbackPlaceholder")}
            multiline
            numberOfLines={3}
            style={styles.feedbackInput}
            error={feedbackInvalid ? t("collab.feedbackRequired") : undefined}
          />
          <View style={styles.reviewButtons}>
            <View style={styles.reviewBtn}>
              <AppButton
                label={t("collab.approve")}
                variant="primary"
                size="md"
                fullWidth
                onPress={handleApprove}
                disabled={reviewing}
                loading={reviewing}
              />
            </View>
            <View style={styles.reviewBtn}>
              <AppButton
                label={t("collab.requestChanges")}
                variant="outline"
                size="md"
                fullWidth
                onPress={handleRequestChanges}
                disabled={reviewing}
                loading={reviewing}
              />
            </View>
          </View>
        </View>
      )}

      {/* Edit Button (youth only, for editable contributions) */}
      {isEditable && onEdit ? (
        <View style={styles.editRow}>
          <AppText
            variant="label"
            color={colors.primary.main}
            onPress={() => onEdit(contribution)}
          >
            {contribution.status === "changes_requested"
              ? t("collab.reviseResubmit")
              : t("common.edit")}
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Same defect class as the workspace card: two flex children that cannot
    // shrink, so a long Sinhala status label plus a long type label could push
    // the second badge past the card edge. Wrapping lets the badges drop to a
    // second line instead of clipping.
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  typeBadge: {
    minWidth: 0,
    flexShrink: 1,
    maxWidth: "100%",
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  statusBadge: {
    minWidth: 0,
    flexShrink: 1,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  feedbackBlock: {
    backgroundColor: colors.background.warm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  feedbackText: {
    fontStyle: "italic",
  },
  reviewSection: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  feedbackInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  reviewButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  reviewBtn: {
    flex: 1,
  },
  editRow: {
    alignItems: "flex-end",
    paddingTop: spacing.xs,
  },
});
