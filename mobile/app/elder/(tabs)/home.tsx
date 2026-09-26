import { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AppText, AppCard, AppButton } from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { borderRadius } from "../../../src/theme/layout";
import { useUser } from "../../../src/context/UserContext";
import { apiGetMyContent, apiGetIncomingRequests, apiGetUnreadCount } from "../../../src/services/api";

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IncomingRequest {
  _id: string;
  contentId: { _id: string; title: string; category: string } | string;
  fromUser: { name: string } | string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function ElderHomeScreen() {
  const { currentUser } = useUser();
  const router = useRouter();
  const [myContent, setMyContent] = useState<ContentItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        try {
          const [contentResult, requestsResult, notiCountResult] = await Promise.all([
            apiGetMyContent(),
            apiGetIncomingRequests(),
            apiGetUnreadCount(),
          ]);
          if (!cancelled) {
            if (contentResult.success && Array.isArray(contentResult.data)) {
              setMyContent(contentResult.data as ContentItem[]);
            }
            if (requestsResult.success && Array.isArray(requestsResult.data)) {
              const reqs = requestsResult.data as IncomingRequest[];
              setIncomingRequests(reqs);
              setPendingCount(reqs.filter((r) => r.status === "pending").length);
            }
            if (notiCountResult.success && typeof notiCountResult.data === "number") {
              setUnreadNotiCount(notiCountResult.data);
            }
          }
        } catch {}
      }
      load();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const statCount = myContent.length;

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
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => router.push("/elder/notifications")}
                activeOpacity={0.7}
              >
                <AppText variant="body">🔔</AppText>
                {unreadNotiCount > 0 && (
                  <View style={styles.notiBadge}>
                    <AppText variant="caption" color={colors.primary.contrast}>
                      {unreadNotiCount > 99 ? "99+" : unreadNotiCount}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
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
            <AppText variant="heading">{statCount}</AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              Contributions
            </AppText>
          </AppCard>

          <AppCard
            style={styles.statCard}
            onPress={() => router.push("/elder/incoming-requests")}
          >
            <View style={styles.statHeader}>
              <AppText variant="label">To Review</AppText>
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <AppText variant="caption" color={colors.primary.contrast}>
                    {pendingCount}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="heading" color={colors.primary.main}>
              {pendingCount} waiting
            </AppText>
          </AppCard>
        </View>

        <View style={styles.shareSection}>
          <AppButton
            label="+ Share Knowledge"
            onPress={() => router.push("/elder/create-content")}
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <AppText variant="subheading">Your Recent Activity</AppText>

          {myContent.length === 0 ? (
            <AppText variant="body" color={colors.text.secondary}>
              No content yet. Tap "Share Knowledge" to create your first entry.
            </AppText>
          ) : (
            myContent.map((item) => (
              <AppCard
                key={item._id}
                style={styles.activityCard}
                onPress={() =>
                  router.push({
                    pathname: "/elder/edit-content",
                    params: {
                      id: item._id,
                      title: item.title,
                      content: item.content,
                      category: item.category,
                    },
                  })
                }
              >
                <View style={styles.activityHeader}>
                  <View style={styles.tag}>
                    <AppText variant="caption" color={colors.primary.main}>
                      {item.category}
                    </AppText>
                  </View>
                </View>
                <AppText variant="subheading">{item.title}</AppText>
              </AppCard>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="subheading">Collaboration Requests</AppText>
            <AppText
              variant="bodySmall"
              color={colors.primary.main}
              onPress={() => router.push("/elder/incoming-requests")}
            >
              View All
            </AppText>
          </View>

          {incomingRequests.length === 0 ? (
            <AppText variant="body" color={colors.text.secondary}>
              No collaboration requests yet.
            </AppText>
          ) : (
            incomingRequests.slice(0, 3).map((req) => {
              const youthName =
                typeof req.fromUser === "object" && req.fromUser?.name
                  ? req.fromUser.name
                  : "Youth";
              const contentTitle =
                typeof req.contentId === "object" && req.contentId?.title
                  ? req.contentId.title
                  : "a cultural item";
              return (
                <AppCard key={req._id} style={styles.collabCard}>
                  <View style={styles.collabHeader}>
                    <View style={styles.collabAvatar}>
                      <AppText variant="caption" color={colors.primary.contrast}>
                        {youthName.charAt(0).toUpperCase()}
                      </AppText>
                    </View>
                    <View style={styles.collabInfo}>
                      <AppText variant="label">{youthName}</AppText>
                      <AppText variant="caption" color={colors.text.secondary}>
                        Wants to collaborate on {contentTitle}
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            req.status === "accepted"
                              ? "#E8F5E9"
                              : req.status === "rejected"
                                ? "#FFEBEE"
                                : "#FFF8E1",
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        color={
                          req.status === "accepted"
                            ? "#2E7D32"
                            : req.status === "rejected"
                              ? "#D32F2F"
                              : "#F9A825"
                        }
                      >
                        {req.status === "accepted"
                          ? "Accepted"
                          : req.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="bodySmall" color={colors.text.secondary} style={styles.quote}>
                    "{req.message}"
                  </AppText>
                </AppCard>
              );
            })
          )}
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
  notiBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxs,
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
  badge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
});
