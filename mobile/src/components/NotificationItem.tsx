import { View, TouchableOpacity, TouchableOpacityProps, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";

export type NotificationType =
  | "collaboration_request_received"
  | "collaboration_accepted"
  | "collaboration_rejected"
  | "contribution_submitted"
  | "contribution_approved"
  | "contribution_changes_requested";

export interface NotificationData {
  _id: string;
  type: NotificationType;
  message: string;
  relatedId: string;
  relatedModel: string;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<
  NotificationType,
  { icon: string; color: string; bg: string }
> = {
  collaboration_request_received: { icon: "📩", color: "#7B1FA2", bg: "#F3E5F5" },
  collaboration_accepted: { icon: "✓", color: "#2E7D32", bg: "#E8F5E9" },
  collaboration_rejected: { icon: "✕", color: "#D32F2F", bg: "#FFEBEE" },
  contribution_submitted: { icon: "📝", color: "#0288D1", bg: "#E1F5FE" },
  contribution_approved: { icon: "✓", color: "#2E7D32", bg: "#E8F5E9" },
  contribution_changes_requested: { icon: "✏️", color: "#E65100", bg: "#FFF3E0" },
};

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

interface NotificationItemProps extends TouchableOpacityProps {
  notification: NotificationData;
}

export function NotificationItem({ notification, style, ...props }: NotificationItemProps) {
  const meta = TYPE_META[notification.type];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unread,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
        <AppText variant="body">{meta.icon}</AppText>
      </View>

      <View style={styles.content}>
        <AppText
          variant={notification.read ? "bodySmall" : "body"}
          color={colors.text.primary}
          numberOfLines={3}
        >
          {notification.message}
        </AppText>
        <AppText variant="caption" color={colors.text.tertiary}>
          {getRelativeTime(notification.createdAt)}
        </AppText>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  unread: {
    backgroundColor: colors.background.warm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
    marginTop: spacing.xs,
  },
});
