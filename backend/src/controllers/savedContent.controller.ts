import { Response } from "express";
import {
  saveContent,
  unsaveContent,
  getSavedState,
  getSavedContent,
} from "../services/savedContent.service";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * HE-33: saving is a per-user action, so every handler derives the owner
 * from the authenticated token (req.userId) and never from the request
 * body. Both roles may save - there is no requireRole gate here.
 */
export async function list(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
      return;
    }

    const result = await getSavedContent(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("List saved content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

export async function save(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
      return;
    }

    // req.body is undefined when the request carries no body at all, so the
    // read is optional-chained: a bare POST still answers 400, never 500.
    const contentId = req.body?.contentId;

    if (!contentId || typeof contentId !== "string" || !contentId.trim()) {
      res.status(400).json({ success: false, message: "Content ID is required", code: "CONTENT_ID_REQUIRED" });
      return;
    }

    const result = await saveContent(req.userId, contentId.trim());

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    // 201 when the row was created, 200 when this user had already saved it -
    // both are successes, the distinction just tells the client what changed.
    res.status(result.created ? 201 : 200).json({ ...result, saved: true });
  } catch (error) {
    console.error("Save content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
      return;
    }

    const contentId = req.params.contentId as string;
    const result = await unsaveContent(req.userId, contentId);

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json({ ...result, saved: false });
  } catch (error) {
    console.error("Unsave content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

export async function state(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
      return;
    }

    const contentId = req.params.contentId as string;
    const result = await getSavedState(req.userId, contentId);

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get saved state controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}
