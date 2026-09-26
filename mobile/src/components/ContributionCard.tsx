import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { AppCard } from "./AppCard";
import { AppButton } from "./AppButton";
import { AppInput } from "./AppInput";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";

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

const TYPE_LABELS: Record<ContributionType, { label: string; description: string }> = {
  translation: {
    label: "Translation",
    description: "Translating content into another language",
  },
  explanation: {
    label: "Explanation",
    description: "Providing meaning or interpretation of content",
  },
  transcription: {
    label: "Transcription",
    description: "Converting spoken language into written form",
  },
  context: {
    label: "Context",
    description: "Adding cultural or historical background information",
  },
};

const STATUS_STYLES: Record<
  ContributionStatus,
  { bg: string; text: string; label: string }
> = {
  pending_review: {
    bg: "#FFF8E1",
    text: "#F9A825",
    label: "Pending Review",
  },
  changes_requested: {
    bg: "#FFF3E0",
    text: "#E65100",
    label: "Changes Requested",
  },
  approved: {
    bg: "#E8F5E9",
    text: "#2E7D32",
    label: "Approved",
  },
};

function getAuthorName(submittedBy: string | { _id: string; name: string }): string {
  if (typeof submittedBy === "object" && submittedBy !== null && "name" in submittedBy) {
    return submittedBy.name;
  }
  return "Youth";
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
  const typeInfo = TYPE_LABELS[contribution.type];
  const statusStyle = STATUS_STYLES[contribution.status];
  const isEditable =
    role === "youth" &&
    (contribution.status === "changes_requested" ||
      contribution.status === "pending_review");
  const isReviewable =
    showReviewActions && role === "elder" && contribution.status === "pending_review";

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const handleRequestChanges = () => {
    const trimmed = feedbackText.trim();
    if (!trimmed) {
      setFeedbackError("Feedback is required when requesting changes");
      return;
    }
    setFeedbackError("");
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
            {typeInfo.label}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <AppText variant="caption" color={statusStyle.text}>
            {statusStyle.label}
          </AppText>
        </View>
      </View>

      {/* Type Description */}
      <AppText variant="caption" color={colors.text.tertiary}>
        {typeInfo.description}
      </AppText>

      {/* Author (elder view only) */}
      {role === "elder" && (
        <AppText variant="caption" color={colors.text.secondary}>
          Submitted by {getAuthorName(contribution.submittedBy)}
        </AppText>
      )}

      {/* Language (if present) */}
      {contribution.language ? (
        <View style={styles.languageRow}>
          <AppText variant="caption" color={colors.text.secondary}>
            Language: {contribution.language}
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
            Elder Feedback
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
            label="Feedback for Youth (required for changes)"
            value={feedbackText}
            onChangeText={(text: string) => {
              setFeedbackText(text);
              setFeedbackError("");
            }}
            placeholder="Explain what changes are needed..."
            multiline
            numberOfLines={3}
            style={styles.feedbackInput}
            error={feedbackError || undefined}
          />
          <View style={styles.reviewButtons}>
            <View style={styles.reviewBtn}>
              <AppButton
                label="Approve"
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
                label="Request Changes"
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
            {contribution.status === "changes_requested" ? "Revise & Resubmit" : "Edit"}
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
  },
  typeBadge: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  statusBadge: {
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
