import { Response } from "express";
import {
  createContribution,
  updateContribution,
  reviewContribution,
  getContributionsByCollaboration,
  getContributionById,
  getApprovedContributionsByContent,
} from "../services/contribution.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function create(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.userRole !== "youth") {
      res.status(403).json({ success: false, message: "Only youth can create contributions" });
      return;
    }

    const { collaborationRequestId, contentId, type, text, language } = req.body;

    if (!collaborationRequestId) {
      res.status(400).json({ success: false, message: "Collaboration request ID is required" });
      return;
    }

    if (!contentId) {
      res.status(400).json({ success: false, message: "Content ID is required" });
      return;
    }

    if (!type) {
      res.status(400).json({ success: false, message: "Contribution type is required" });
      return;
    }

    if (!text?.trim()) {
      res.status(400).json({ success: false, message: "Text is required" });
      return;
    }

    const result = await createContribution({
      collaborationRequestId,
      contentId,
      submittedBy: req.userId,
      type,
      text,
      language,
    });

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("Not authorized") || result.message.includes("Only the")
          ? 403
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Create contribution controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function update(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;
    const { text, language } = req.body;

    const result = await updateContribution(id, req.userId, { text, language });

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
    console.error("Update contribution controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function review(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (req.userRole !== "elder") {
      res.status(403).json({ success: false, message: "Only elders can review contributions" });
      return;
    }

    const id = req.params.id as string;
    const { decision, feedback } = req.body;

    if (!decision || !["approved", "changes_requested"].includes(decision)) {
      res.status(400).json({
        success: false,
        message: 'Decision must be either "approved" or "changes_requested"',
      });
      return;
    }

    const result = await reviewContribution(id, req.userId, decision, feedback);

    if (!result.success) {
      const status = result.message.includes("not found")
        ? 404
        : result.message.includes("Not authorized") || result.message.includes("Only the")
          ? 403
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Review contribution controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;
    const result = await getContributionById(id, req.userId);

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
    console.error("Get contribution by ID controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getByCollaboration(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const collaborationRequestId = req.params.collaborationRequestId as string;

    if (!collaborationRequestId) {
      res.status(400).json({ success: false, message: "Collaboration request ID is required" });
      return;
    }

    const result = await getContributionsByCollaboration(
      collaborationRequestId,
      req.userId
    );

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
    console.error("Get contributions by collaboration controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getApprovedByContent(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const contentId = req.params.contentId as string;

    if (!contentId) {
      res.status(400).json({ success: false, message: "Content ID is required" });
      return;
    }

    const result = await getApprovedContributionsByContent(contentId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get approved contributions controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}
