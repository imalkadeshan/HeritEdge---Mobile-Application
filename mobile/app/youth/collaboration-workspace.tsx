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
} from "../../src/services/api";

export default function YouthCollaborationWorkspaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Refresh contributions when screen regains focus (returning from add/edit)
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

  const handleAddContribution = () => {
    if (id) {
      router.push({ pathname: "/youth/add-contribution", params: { collaborationId: id } });
    }
  };

  const handleEditContribution = (contribution: ContributionData) => {
    if (id) {
      router.push({
        pathname: "/youth/add-contribution",
        params: { collaborationId: id, contributionId: contribution._id },
      });
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
            onPress={() => router.replace("/youth/outgoing-requests")}
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
            onPress={() => router.replace("/youth/outgoing-requests")}
            variant="outline"
            size="sm"
            style={styles.backButton}
          />
        </View>
      )}

      {!loading && !error && data && (
        <CollaborationWorkspace
          data={data}
          role="youth"
          contributions={contributions}
          onAddContribution={handleAddContribution}
          onEditContribution={handleEditContribution}
        />
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
});
