import { Response } from "express";
import {
  listActiveCategories,
  listAllCategories,
  createCategory,
  updateCategoryLabel,
  setCategoryStatus,
  deleteCategory,
} from "../services/category.service";
import {
  validateCategoryKey,
  validateCategoryLabel,
} from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";

function isDuplicateKeyError(error: unknown): boolean {
  return (error as { code?: number } | null)?.code === 11000;
}

// ---- Public list (active categories only) ----

export async function listActive(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const categories = await listActiveCategories();

    res.json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("List categories controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

// ---- Admin list (active + inactive) ----

export async function listAll(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const categories = await listAllCategories();

    res.json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("List all categories controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

// ---- Create ----

export async function create(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { key, label } = req.body ?? {};
    const rawKey = typeof key === "string" ? key : "";
    // Label is optional at creation time and defaults to the key.
    const rawLabel = typeof label === "string" && label.trim() ? label : rawKey;

    const keyCheck = validateCategoryKey(rawKey);
    if (!keyCheck.valid) {
      res.status(400).json({ success: false, message: keyCheck.error, code: keyCheck.code });
      return;
    }

    const labelCheck = validateCategoryLabel(rawLabel);
    if (!labelCheck.valid) {
      res.status(400).json({ success: false, message: labelCheck.error, code: labelCheck.code });
      return;
    }

    const result = await createCategory(rawKey, rawLabel);

    if (!result.success) {
      const status = result.message.includes("already exists") ? 409 : 400;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res
        .status(409)
        .json({ success: false, message: "Category key already exists", code: "CATEGORY_DUPLICATE" });
      return;
    }

    console.error("Create category controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

// ---- Edit label ----

export async function updateLabel(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { label } = req.body ?? {};

    const labelCheck = validateCategoryLabel(typeof label === "string" ? label : "");
    if (!labelCheck.valid) {
      res.status(400).json({ success: false, message: labelCheck.error, code: labelCheck.code });
      return;
    }

    const result = await updateCategoryLabel(id, String(label));

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Update category label controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

// ---- Delete ----

export async function remove(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await deleteCategory(id);

    if (!result.success) {
      // The service decides what the refusal is: an id we cannot act on is a
      // 404, a category that must stay (in use, or a seeded default) is a 409
      // so the client can tell "gone" from "not allowed".
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "CATEGORY_IN_USE" || result.code === "CATEGORY_DEFAULT"
            ? 409
            : 400;
      res
        .status(status)
        .json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Delete category controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

// ---- Deactivate / reactivate ----

export async function updateStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { active } = req.body ?? {};

    if (typeof active !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Active must be a boolean (true to reactivate, false to deactivate)", code: "CATEGORY_STATUS_INVALID",
      });
      return;
    }

    const result = await setCategoryStatus(id, active);

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Update category status controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}
