import { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText, AppHeader, AppButton, NotificationItem } from "../../src/components";
import { NotificationData } from "../../src/components/NotificationItem";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { useUser } from "../../src/context/UserContext";
import {
  apiGetNotifications,
  apiGetUnreadCount,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiGetContributionById,
} from "../../src/services/api";

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUser } = useUser();
  const role = currentUser?.role;

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [notiResult, countResult] = await Promise.all([
        apiGetNotifications(),
        apiGetUnreadCount(),
      ]);
      if (notiResult.success && Array.isArray(notiResult.data)) {
        setNotifications(notiResult.data as NotificationData[]);
      } else {
        setError(notiResult.message || "Failed to load notifications");
      }
      if (countResult.success && typeof countResult.data === "number") {
        setUnreadCount(countResult.data);
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
      fetchAll();
    }, [])
  );

  const handleItemPress = async (notif: NotificationData) => {
    if (processingId) return;
    setProcessingId(notif._id);

    try {
      // Mark as read
      if (!notif.read) {
        const result = await apiMarkNotificationRead(notif._id);
        if (result.success) {
          setNotifications((prev) =>
            prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }

      // Navigate based on notification type
      if (notif.type === "collaboration_request_received") {
        // Youth shouldn't receive this, but handle gracefully
        router.push("/youth/outgoing-requests");
      } else if (notif.type === "collaboration_accepted") {
        if (role === "youth") {
          router.push({
            pathname: "/youth/collaboration-workspace",
            params: { id: notif.relatedId },
          });
        } else {
          router.push({
            pathname: "/elder/collaboration-workspace",
            params: { id: notif.relatedId },
          });
        }
      } else if (notif.type === "collaboration_rejected") {
        if (role === "youth") {
          router.push("/youth/outgoing-requests");
        } else {
          router.push("/elder/incoming-requests");
        }
      } else if (
        notif.type === "contribution_submitted" ||
        notif.type === "contribution_approved" ||
        notif.type === "contribution_changes_requested"
      ) {
        // relatedId is Contribution._id; resolve to collaboration workspace
        const contribResult = await apiGetContributionById(notif.relatedId);
        if (contribResult.success && contribResult.data) {
          const collabId = (contribResult.data as { collaborationRequestId: string }).collaborationRequestId;
          router.push({
            pathname: "/youth/collaboration-workspace",
            params: { id: collabId },
          });
        } else {
          router.push("/youth/outgoing-requests");
        }
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const result = await apiMarkAllNotificationsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Notifications" onBack={() => router.back()} />

      {loading && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            Loading notifications...
          </AppText>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>
            {error}
          </AppText>
          <AppButton
            label="Retry"
            onPress={() => fetchAll()}
            variant="outline"
            size="sm"
          />
        </View>
      )}

      {!loading && !error && notifications.length === 0 && (
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.tertiary}>
            No notifications yet.
          </AppText>
        </View>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          {unreadCount > 0 && (
            <View style={styles.markAllBar}>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {unreadCount} unread
              </AppText>
              <AppButton
                label={markingAll ? "Marking..." : "Mark All Read"}
                onPress={handleMarkAllRead}
                variant="ghost"
                size="sm"
                disabled={markingAll}
              />
            </View>
          )}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <NotificationItem
                notification={item}
                onPress={() => handleItemPress(item)}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAll(true)}
                tintColor={colors.primary.main}
              />
            }
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
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  markAllBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
});
