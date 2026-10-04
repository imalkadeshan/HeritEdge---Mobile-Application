import { Types } from "mongoose";
import ContentCategoryModel, {
  IContentCategoryDocument,
} from "../models/contentCategory.model";
import CulturalContent from "../models/culturalContent.model";

/**
 * The six categories that already exist on stored cultural items.
 * Their keys are the exact strings CulturalContent.category holds today, so
 * seeding them keeps every existing item valid. Keys are immutable; only
 * `label` is editable by an admin.
 */
export const DEFAULT_CATEGORIES: ReadonlyArray<{ key: string; label: string }> = [
  { key: "Story", label: "Story" },
  { key: "Proverb", label: "Proverb" },
  { key: "Recipe", label: "Recipe" },
  { key: "Tradition", label: "Tradition" },
  { key: "Song", label: "Song" },
  { key: "Dialect Word", label: "Dialect Word" },
];

export interface CategoryResult {
  success: boolean;
  message: string;
  code?: string;
  category?: IContentCategoryDocument;
}

export interface CategoryListResult {
  success: boolean;
  message: string;
  code?: string;
  categories?: IContentCategoryDocument[];
}

/** Case-insensitive key comparison so "story" and "Story" are one category. */
function sameKey(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Idempotent seed. Inserts only categories that do not exist yet and never
 * touches labels or `active` flags of categories that are already there, so
 * re-running (or restarting the server) cannot duplicate or resurrect data.
 */
export async function seedDefaultCategories(): Promise<number> {
  const existing = await ContentCategoryModel.find().select("key").lean();
  const missing = DEFAULT_CATEGORIES.filter(
    (seed) => !existing.some((cat) => sameKey(cat.key, seed.key))
  );

  if (missing.length === 0) {
    return 0;
  }

  await ContentCategoryModel.insertMany(
    missing.map((seed) => ({ ...seed, active: true })),
    { ordered: false }
  ).catch((error: unknown) => {
    // A concurrent seed may have inserted the same keys; the unique index on
    // `key` makes that a duplicate-key error, which is safe to ignore here.
    const code = (error as { code?: number } | null)?.code;
    if (code !== 11000) throw error;
  });

  return missing.length;
}

/** Look up a category by key regardless of its active flag. */
export async function findCategoryByKey(
  key: string
): Promise<{ key: string; active: boolean } | null> {
  const trimmed = key?.trim();
  if (!trimmed) return null;

  const all = await ContentCategoryModel.find().select("key active").lean();
  const match = all.find((cat) => sameKey(cat.key, trimmed));

  return match ? { key: match.key, active: match.active } : null;
}

export async function listActiveCategories(): Promise<IContentCategoryDocument[]> {
  return ContentCategoryModel.find({ active: true })
    .sort({ createdAt: 1 })
    .select("key label active");
}

export async function listAllCategories(): Promise<IContentCategoryDocument[]> {
  return ContentCategoryModel.find().sort({ active: -1, createdAt: 1 });
}

/** Returns true when any category (active or not) already uses this key. */
export async function categoryKeyExists(key: string): Promise<boolean> {
  return (await findCategoryByKey(key)) !== null;
}

export async function createCategory(
  key: string,
  label: string
): Promise<CategoryResult> {
  const trimmedKey = key?.trim();
  const trimmedLabel = label?.trim();

  if (!trimmedKey) {
    return {
      success: false,
      message: "Category key is required",
      code: "CATEGORY_KEY_REQUIRED",
    };
  }

  if (!trimmedLabel) {
    return {
      success: false,
      message: "Category label is required",
      code: "CATEGORY_LABEL_REQUIRED",
    };
  }

  if (await categoryKeyExists(trimmedKey)) {
    return {
      success: false,
      message: `Category key "${trimmedKey}" already exists`,
      code: "CATEGORY_DUPLICATE",
    };
  }

  try {
    const category = await ContentCategoryModel.create({
      key: trimmedKey,
      label: trimmedLabel,
      active: true,
    });

    return {
      success: true,
      message: "Category created successfully",
      category,
    };
  } catch (error) {
    if ((error as { code?: number } | null)?.code === 11000) {
      return {
        success: false,
        message: `Category key "${trimmedKey}" already exists`,
        code: "CATEGORY_DUPLICATE",
      };
    }

    console.error("Create category error:", error);
    return {
      success: false,
      message: "Failed to create category. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

export async function updateCategoryLabel(
  categoryId: string,
  label: string
): Promise<CategoryResult> {
  const trimmedLabel = label?.trim();

  if (!trimmedLabel) {
    return {
      success: false,
      message: "Category label is required",
      code: "CATEGORY_LABEL_REQUIRED",
    };
  }

  const category = await ContentCategoryModel.findById(categoryId);

  if (!category) {
    return { success: false, message: "Category not found", code: "NOT_FOUND" };
  }

  category.label = trimmedLabel;

  try {
    await category.save();
  } catch (error) {
    console.error("Update category label error:", error);
    return {
      success: false,
      message: "Failed to update category. Please try again.",
      code: "SERVER_ERROR",
    };
  }

  return {
    success: true,
    message: "Category label updated successfully",
    category,
  };
}

export interface CategoryDeleteResult {
  success: boolean;
  message: string;
  code?: string;
  /** The removed category, so the client can confirm what disappeared. */
  category?: IContentCategoryDocument;
}

/**
 * Permanently removes one category.
 *
 * Three rules, all of them about never losing data silently:
 *
 * 1. A category may only go when *no* CulturalContent document stores its key.
 *    The count deliberately ignores the category's own active flag and every
 *    other filter, so content sitting in a deactivated category still blocks
 *    the delete - deactivating is a separate, reversible decision and must not
 *    become a loophole that orphans existing items. Nothing is cascaded,
 *    rewritten or reassigned.
 * 2. Seeded defaults (the keys `seedDefaultCategories` re-creates on every
 *    boot) can never be deleted, otherwise a "successful" delete would be
 *    silently undone at the next restart. They can be deactivated instead.
 * 3. A malformed or unknown id is a 404, not a 500 - there is nothing to act
 *    on, and the caller learns the category does not exist.
 */
export async function deleteCategory(
  categoryId: string
): Promise<CategoryDeleteResult> {
  const notFound: CategoryDeleteResult = {
    success: false,
    message: "Category not found",
    code: "NOT_FOUND",
  };

  // `isValid` also accepts 12-character strings that are not real ids;
  // findById simply fails to match those, which lands on the same 404.
  if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
    return notFound;
  }

  const category = await ContentCategoryModel.findById(categoryId);

  if (!category) {
    return notFound;
  }

  if (DEFAULT_CATEGORIES.some((seed) => sameKey(seed.key, category.key))) {
    return {
      success: false,
      message:
        "This is a built-in default category. It cannot be deleted, only deactivated.",
      code: "CATEGORY_DEFAULT",
    };
  }

  const usageCount = await CulturalContent.countDocuments({
    category: category.key,
  });

  if (usageCount > 0) {
    return {
      success: false,
      message:
        "This category is used by cultural content. Deactivate it instead.",
      code: "CATEGORY_IN_USE",
    };
  }

  const deleted = await ContentCategoryModel.findByIdAndDelete(categoryId);

  if (!deleted) {
    // Another admin deleted the same category between the two reads.
    return notFound;
  }

  return {
    success: true,
    message: "Category deleted successfully",
    category: deleted,
  };
}

export async function setCategoryStatus(
  categoryId: string,
  active: boolean
): Promise<CategoryResult> {
  const category = await ContentCategoryModel.findById(categoryId);

  if (!category) {
    return { success: false, message: "Category not found", code: "NOT_FOUND" };
  }

  category.active = active;

  try {
    await category.save();
  } catch (error) {
    console.error("Update category status error:", error);
    return {
      success: false,
      message: "Failed to update category. Please try again.",
      code: "SERVER_ERROR",
    };
  }

  return {
    success: true,
    message: active
      ? "Category reactivated successfully"
      : "Category deactivated successfully",
    category,
  };
}
