import Notification from "../models/notification.model";

interface ListResult {
  success: boolean;
  message: string;
  notifications?: Array<{
    _id: string;
    type: string;
    message: string;
    relatedId: string;
    relatedModel: string;
    read: boolean;
    createdAt: Date;
  }>;
}

export async function getNotifications(
  userId: string
): Promise<ListResult> {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      message: "Notifications fetched successfully",
      notifications: notifications.map((n) => ({
        _id: n._id.toString(),
        type: n.type,
        message: n.message,
        relatedId: n.relatedId.toString(),
        relatedModel: n.relatedModel,
        read: n.read,
        createdAt: n.createdAt,
      })),
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      message: "Failed to fetch notifications. Please try again.",
    };
  }
}

interface UnreadCountResult {
  success: boolean;
  message: string;
  count?: number;
}

export async function getUnreadCount(
  userId: string
): Promise<UnreadCountResult> {
  try {
    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    return {
      success: true,
      message: "Unread count fetched successfully",
      count,
    };
  } catch (error) {
    console.error("Get unread count error:", error);
    return {
      success: false,
      message: "Failed to fetch unread count. Please try again.",
    };
  }
}

interface MarkReadResult {
  success: boolean;
  message: string;
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<MarkReadResult> {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return { success: false, message: "Notification not found" };
    }

    if (notification.userId.toString() !== userId) {
      return {
        success: false,
        message: "Not authorized to modify this notification",
      };
    }

    notification.read = true;
    await notification.save();

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Mark as read error:", error);
    return {
      success: false,
      message: "Failed to mark notification as read. Please try again.",
    };
  }
}

export async function markAllAsRead(
  userId: string
): Promise<MarkReadResult> {
  try {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    console.error("Mark all as read error:", error);
    return {
      success: false,
      message: "Failed to mark notifications as read. Please try again.",
    };
  }
}
