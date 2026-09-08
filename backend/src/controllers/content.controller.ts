import { Response } from "express";
import {
  createContent,
  updateContent,
  deleteContent,
  getMyContent,
  getAllContent,
  getContentById,
} from "../services/content.service";
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

    const { title, content, category, imageUrl } = req.body;

    if (!title?.trim()) {
      res.status(400).json({ success: false, message: "Title is required" });
      return;
    }

    if (!content?.trim()) {
      res.status(400).json({ success: false, message: "Content is required" });
      return;
    }

    if (!category) {
      res.status(400).json({ success: false, message: "Category is required" });
      return;
    }

    const result = await createContent({
      title,
      content,
      category,
      imageUrl,
      createdBy: req.userId,
    });

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Create content controller error:", error);
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
    const { title, content, category, imageUrl } = req.body;

    const result = await updateContent({
      contentId: id,
      userId: req.userId,
      title,
      content,
      category,
      imageUrl,
    });

    if (!result.success) {
      const status = result.message.includes("Not authorized")
        ? 403
        : result.message.includes("not found")
          ? 404
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Update content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function remove(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;

    const result = await deleteContent(id, req.userId);

    if (!result.success) {
      const status = result.message.includes("Not authorized")
        ? 403
        : result.message.includes("not found")
          ? 404
          : 400;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Delete content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getMine(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const result = await getMyContent(req.userId);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get my content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getAll(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const result = await getAllContent(search, category);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get all content controller error:", error);
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
    const result = await getContentById(id);

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get content by id controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}
