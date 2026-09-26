import { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText, AppHeader, AppCard, AppButton } from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { apiGetOutgoingRequests } from "../../src/services/api";

interface OutgoingRequest {
  _id: string;
  contentId: { _id: string; title: string; category: string } | string;
  toElder: { name: string } | string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FFF8E1", text: "#F9A825", label: "Pending" },
  accepted: { bg: "#E8F5E9", text: "#2E7D32", label: "Accepted" },
  rejected: { bg: "#FFEBEE", text: "#D32F2F", label: "Rejected" },
};

export default function OutgoingRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<OutgoingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await apiGetOutgoingRequests();
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data as OutgoingRequest[]);
      } else {
        setError(result.message || "Failed to load requests");
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const getElderName = (req: OutgoingRequest): string => {
    if (typeof req.toElder === "object" && req.toElder?.name) return req.toElder.name;
    return "Elder";
  };

  const getContentTitle = (req: OutgoingRequest): string => {
    if (typeof req.contentId === "object" && req.contentId?.title) return req.contentId.title;
    return "Cultural Item";
  };

  const getContentCategory = (req: OutgoingRequest): string => {
    if (typeof req.contentId === "object" && req.contentId?.category) return req.contentId.category;
    return "";
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Requests" onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRequests(true)}
            tintColor={colors.primary.main}
          />
        }
      >
        {loading && (
          <View style={styles.centered}>
            <AppText variant="body" color={colors.text.secondary}>Loading requests...</AppText>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <AppText variant="body" color={colors.error.main}>{error}</AppText>
          </View>
        )}

        {!loading && !error && requests.length === 0 && (
          <View style={styles.centered}>
            <AppText variant="body" color={colors.text.secondary}>
              You haven't sent any collaboration requests yet.
            </AppText>
          </View>
        )}

        {!loading && !error && requests.map((req) => {
          const statusStyle = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
          return (
            <AppCard key={req._id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.elderAvatar}>
                  <AppText variant="caption" color={colors.primary.contrast}>
                    {getElderName(req).charAt(0).toUpperCase()}
                  </AppText>
                </View>
                <View style={styles.requestInfo}>
                  <AppText variant="label">{getElderName(req)}</AppText>
                  <AppText variant="caption" color={colors.text.secondary}>
                    {getContentTitle(req)}
                    {getContentCategory(req) ? ` · ${getContentCategory(req)}` : ""}
                  </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <AppText variant="caption" color={statusStyle.text}>
                    {statusStyle.label}
                  </AppText>
                </View>
              </View>
              <AppText variant="bodySmall" color={colors.text.secondary} style={styles.message}>
                "{req.message}"
              </AppText>
              {req.status === "accepted" && (
                <AppButton
                  label="Open Workspace"
                  onPress={() =>
                    router.push(`/youth/collaboration-workspace?id=${req._id}`)
                  }
                  size="sm"
                />
              )}
            </AppCard>
          );
        })}
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
    padding: spacing.xxl,
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  requestCard: {
    gap: spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  elderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  requestInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  message: {
    fontStyle: "italic",
  },
});
