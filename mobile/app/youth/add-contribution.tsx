import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  AppText,
  AppHeader,
  AppButton,
  AppInput,
  SelectionChip,
  AppCard,
} from "../../src/components";
import { ContributionType } from "../../src/components/ContributionCard";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import {
  apiGetCollaborationWorkspace,
  apiGetContributionsByCollaboration,
  apiCreateContribution,
  apiUpdateContribution,
} from "../../src/services/api";

const CONTRIBUTION_TYPES: {
  value: ContributionType;
  label: string;
  description: string;
}[] = [
  {
    value: "translation",
    label: "Translation",
    description: "Translate the content into another language",
  },
  {
    value: "explanation",
    label: "Explanation",
    description: "Explain the meaning or interpretation of content",
  },
  {
    value: "transcription",
    label: "Transcription",
    description: "Convert spoken language into written form",
  },
  {
    value: "context",
    label: "Context",
    description: "Add cultural or historical background information",
  },
];

export default function AddContributionScreen() {
  const router = useRouter();
  const { collaborationId, contributionId } = useLocalSearchParams<{
    collaborationId: string;
    contributionId?: string;
  }>();

  const isEditMode = !!contributionId;

  const [contentId, setContentId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ContributionType | null>(null);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [typeLocked, setTypeLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!collaborationId) {
        setError("No collaboration specified");
        setLoading(false);
        return;
      }

      try {
        // Fetch workspace to get contentId
        const workspaceResult = await apiGetCollaborationWorkspace(collaborationId);
        if (!workspaceResult.success || !workspaceResult.data) {
          setError(workspaceResult.message || "Failed to load workspace");
          setLoading(false);
          return;
        }

        const workspace = workspaceResult.data as { contentId: { _id: string } };
        setContentId(workspace.contentId._id);

        // If editing, fetch contributions to find the one we're editing
        if (contributionId) {
          const contribsResult = await apiGetContributionsByCollaboration(collaborationId);
          if (contribsResult.success && Array.isArray(contribsResult.data)) {
            const contribs = contribsResult.data as {
              _id: string;
              type: ContributionType;
              text: string;
              language: string;
            }[];
            const existing = contribs.find((c) => c._id === contributionId);
            if (existing) {
              setSelectedType(existing.type);
              setText(existing.text);
              setLanguage(existing.language || "");
              setTypeLocked(true);
            } else {
              setError("Contribution not found");
            }
          }
        }
      } catch {
        setError("Could not connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collaborationId, contributionId]);

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Please select a contribution type");
      return;
    }
    if (!text.trim()) {
      setError("Please enter your contribution text");
      return;
    }
    if (!contentId || !collaborationId) {
      setError("Workspace data not loaded. Please try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let result;
      if (isEditMode && contributionId) {
        result = await apiUpdateContribution(contributionId, {
          text: text.trim(),
          language: language.trim() || undefined,
        });
      } else {
        result = await apiCreateContribution({
          collaborationRequestId: collaborationId,
          contentId,
          type: selectedType,
          text: text.trim(),
          language: language.trim() || undefined,
        });
      }

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "Failed to submit contribution");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <AppHeader
          title={isEditMode ? "Contribution Updated" : "Contribution Submitted"}
          onBack={() => router.back()}
        />
        <View style={styles.centered}>
          <View style={styles.successIcon}>
            <AppText variant="title" color={colors.primary.contrast}>
              {isEditMode ? "✓" : "✓"}
            </AppText>
          </View>
          <AppText variant="title" style={styles.successTitle}>
            {isEditMode ? "Changes Submitted!" : "Contribution Submitted!"}
          </AppText>
          <AppText variant="body" color={colors.text.secondary} style={styles.successMessage}>
            {isEditMode
              ? "Your revised contribution has been sent for review."
              : "Your contribution has been sent to the Elder for review."}
          </AppText>
          <AppButton
            label="Back to Workspace"
            onPress={() => router.back()}
            style={styles.successButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={isEditMode ? "Revise Contribution" : "Add Contribution"}
        onBack={() => router.back()}
      />

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            Loading...
          </AppText>
        </View>
      )}

      {!loading && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Type Selection */}
          <View style={styles.section}>
            <AppText variant="subheading">Contribution Type</AppText>
            <AppText variant="body" color={colors.text.secondary}>
              {isEditMode
                ? "Type cannot be changed after submission."
                : "Select what kind of contribution you are making:"}
            </AppText>
            <View style={styles.typeGrid}>
              {CONTRIBUTION_TYPES.map((type) => (
                <SelectionChip
                  key={type.value}
                  label={type.label}
                  selected={selectedType === type.value}
                  onPress={() => {
                    if (!typeLocked) {
                      setSelectedType(type.value);
                      setError(null);
                    }
                  }}
                  style={[
                    styles.typeChip,
                    typeLocked && styles.typeChipDisabled,
                  ]}
                />
              ))}
            </View>
            {selectedType && (
              <AppCard style={styles.typeDescriptionCard}>
                <AppText variant="body" color={colors.text.secondary}>
                  {CONTRIBUTION_TYPES.find((t) => t.value === selectedType)?.description}
                </AppText>
              </AppCard>
            )}
          </View>

          {/* Text Input */}
          <View style={styles.section}>
            <AppInput
              label="Contribution Text"
              value={text}
              onChangeText={(val: string) => {
                setText(val);
                setError(null);
              }}
              placeholder={
                selectedType === "translation"
                  ? "Enter your translation..."
                  : selectedType === "explanation"
                    ? "Enter your explanation..."
                    : selectedType === "transcription"
                      ? "Enter your transcription..."
                      : selectedType === "context"
                        ? "Enter context information..."
                        : "Enter your contribution..."
              }
              multiline
              numberOfLines={6}
              style={styles.textInput}
            />
          </View>

          {/* Language Input */}
          <View style={styles.section}>
            <AppInput
              label="Language (optional)"
              value={language}
              onChangeText={(val: string) => setLanguage(val)}
              placeholder="e.g., Sinhala, English, Tamil"
            />
          </View>

          {/* Error Display */}
          {error && (
            <AppText variant="body" color={colors.error.main} style={styles.errorText}>
              {error}
            </AppText>
          )}

          {/* Submit Button */}
          <AppButton
            label={
              submitting
                ? "Submitting..."
                : isEditMode
                  ? "Submit Revision"
                  : "Submit Contribution"
            }
            onPress={handleSubmit}
            disabled={submitting || !selectedType || !text.trim()}
            loading={submitting}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
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
    flex: 1,
    padding: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeChip: {
    minWidth: 120,
  },
  typeChipDisabled: {
    opacity: 0.6,
  },
  typeDescriptionCard: {
    backgroundColor: colors.background.warm,
    marginTop: spacing.xs,
  },
  textInput: {
    height: 140,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  errorText: {
    textAlign: "center",
  },
  submitButton: {
    marginTop: spacing.md,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success.main,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    textAlign: "center",
  },
  successMessage: {
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  successButton: {
    marginTop: spacing.lg,
  },
});
