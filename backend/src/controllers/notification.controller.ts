import { Response } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notification.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function list(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getNotifications(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("List notifications controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function unreadCount(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getUnreadCount(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Unread count controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function markRead(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;
    const result = await markAsRead(id, req.userId);

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("Not authorized")
          ? 403
          : 500;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Mark read controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function markAllRead(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await markAllAsRead(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Mark all read controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}
