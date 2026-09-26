import { Response } from "express";
import {
  sendCollaborationRequest,
  getOutgoingRequests,
  getIncomingRequests,
  decideOnRequest,
  getAcceptedCollaboration,
} from "../services/collaboration.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function sendRequest(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.userRole !== "youth") {
      res.status(403).json({ success: false, message: "Only youth can send collaboration requests" });
      return;
    }

    const { contentId, message } = req.body;

    if (!contentId) {
      res.status(400).json({ success: false, message: "Content ID is required" });
      return;
    }

    if (!message?.trim()) {
      res.status(400).json({ success: false, message: "Message is required" });
      return;
    }

    const result = await sendCollaborationRequest({
      contentId,
      fromUser: req.userId,
      message,
    });

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("already")
          ? 409
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Send collaboration request controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getOutgoing(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getOutgoingRequests(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get outgoing requests controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getIncoming(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getIncomingRequests(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get incoming requests controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function acceptOrReject(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.userRole !== "elder") {
      res.status(403).json({ success: false, message: "Only elders can accept or reject requests" });
      return;
    }

    const id = req.params.id as string;
    const { decision } = req.body;

    if (!decision || !["accepted", "rejected"].includes(decision)) {
      res.status(400).json({
        success: false,
        message: 'Decision must be either "accepted" or "rejected"',
      });
      return;
    }

    const result = await decideOnRequest(id, req.userId, decision);

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("Not authorized")
          ? 403
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Accept or reject controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getWorkspace(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;
    const result = await getAcceptedCollaboration(id, req.userId);

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("Not authorized")
          ? 403
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get workspace controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}
