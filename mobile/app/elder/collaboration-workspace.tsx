import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  AppText,
  AppHeader,
  AppButton,
  CollaborationWorkspace,
  WorkspaceData,
  ContributionData,
} from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import {
  apiGetCollaborationWorkspace,
  apiGetContributionsByCollaboration,
  apiReviewContribution,
} from "../../src/services/api";

export default function ElderCollaborationWorkspaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchWorkspace = async () => {
    if (!id) {
      setError("No collaboration specified");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [workspaceResult, contributionsResult] = await Promise.all([
        apiGetCollaborationWorkspace(id),
        apiGetContributionsByCollaboration(id),
      ]);

      if (workspaceResult.success && workspaceResult.data) {
        setData(workspaceResult.data as WorkspaceData);
      } else {
        setError(workspaceResult.message || "Failed to load workspace");
        return;
      }

      if (contributionsResult.success && Array.isArray(contributionsResult.data)) {
        setContributions(contributionsResult.data as ContributionData[]);
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  // Refresh contributions when screen regains focus
  useFocusEffect(
    useCallback(() => {
      if (id && data) {
        apiGetContributionsByCollaboration(id).then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setContributions(result.data as ContributionData[]);
          }
        });
      }
    }, [id, data])
  );

  const handleApprove = async (contributionId: string) => {
    setReviewing(true);
    setReviewError(null);
    try {
      const result = await apiReviewContribution(contributionId, "approved");
      if (result.success) {
        setContributions((prev) =>
          prev.map((c) =>
            c._id === contributionId
              ? { ...c, status: "approved" as const }
              : c
          )
        );
      } else {
        setReviewError(result.message || "Failed to approve contribution");
      }
    } catch {
      setReviewError("Could not connect to the server");
    } finally {
      setReviewing(false);
    }
  };

  const handleRequestChanges = async (contributionId: string, feedback: string) => {
    setReviewing(true);
    setReviewError(null);
    try {
      const result = await apiReviewContribution(
        contributionId,
        "changes_requested",
        feedback
      );
      if (result.success) {
        setContributions((prev) =>
          prev.map((c) =>
            c._id === contributionId
              ? { ...c, status: "changes_requested" as const, feedback }
              : c
          )
        );
      } else {
        setReviewError(result.message || "Failed to request changes");
      }
    } catch {
      setReviewError("Could not connect to the server");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Collaboration" onBack={() => router.back()} />

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            Loading workspace...
          </AppText>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>
            {error}
          </AppText>
          <AppButton
            label="Back to Requests"
            onPress={() => router.replace("/elder/incoming-requests")}
            variant="outline"
            size="sm"
            style={styles.backButton}
          />
        </View>
      )}

      {!loading && !error && !data && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            Workspace not available.
          </AppText>
          <AppButton
            label="Back to Requests"
            onPress={() => router.replace("/elder/incoming-requests")}
            variant="outline"
            size="sm"
            style={styles.backButton}
          />
        </View>
      )}

      {!loading && !error && data && (
        <>
          {reviewError && (
            <View style={styles.reviewError}>
              <AppText variant="body" color={colors.error.main}>
                {reviewError}
              </AppText>
            </View>
          )}
          <CollaborationWorkspace
            data={data}
            role="elder"
            contributions={contributions}
            onApproveContribution={handleApprove}
            onRequestChangesContribution={handleRequestChanges}
            reviewing={reviewing}
          />
        </>
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
  backButton: {
    marginTop: spacing.sm,
  },
  reviewError: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    alignItems: "center",
  },
});
