import mongoose from "mongoose";
import SavedContent from "../models/savedContent.model";
import CulturalContent from "../models/culturalContent.model";

// ---- Save Content ----

interface SaveResult {
  success: boolean;
  message: string;
  code?: string;
  /** True only when this call created the row; false when it already existed. */
  created?: boolean;
}

export async function saveContent(
  userId: string,
  contentId: string
): Promise<SaveResult> {
  // HE-27 convention: a malformed id is "not found", never a CastError 500.
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  // Saving requires the content to still exist; saving a deleted item would
  // create a saved-list entry that can never render.
  const content = await CulturalContent.findById(contentId).select("_id");
  if (!content) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    const result = await SavedContent.updateOne(
      { userId, contentId },
      { $setOnInsert: { userId, contentId } },
      { upsert: true }
    );

    const created = (result.upsertedCount ?? 0) === 1;
    return {
      success: true,
      message: created ? "Content saved" : "Content already saved",
      created,
    };
  } catch (error) {
    // Two saves of the same pair racing each other: the loser's upsert trips
    // the unique index, which means the row the winner wrote is exactly what
    // was being asked for.
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: number }).code === 11000
    ) {
      return { success: true, message: "Content already saved", created: false };
    }

    console.error("Save content error:", error);
    return {
      success: false,
      message: "Failed to save content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Unsave Content ----

interface UnsaveResult {
  success: boolean;
  message: string;
  code?: string;
}

export async function unsaveContent(
  userId: string,
  contentId: string
): Promise<UnsaveResult> {
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  const content = await CulturalContent.findById(contentId).select("_id");
  if (!content) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    // Scoped to userId: one user can never remove another user's saved row.
    // Deleting zero rows (already unsaved) is still success, so repeating the
    // action is safe.
    await SavedContent.deleteOne({ userId, contentId });
    return { success: true, message: "Content removed from saved" };
  } catch (error) {
    console.error("Unsave content error:", error);
    return {
      success: false,
      message: "Failed to remove saved content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Saved State (single item) ----

interface SavedStateResult {
  success: boolean;
  message: string;
  code?: string;
  saved?: boolean;
}

export async function getSavedState(
  userId: string,
  contentId: string
): Promise<SavedStateResult> {
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  const content = await CulturalContent.findById(contentId).select("_id");
  if (!content) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    const record = await SavedContent.exists({ userId, contentId });
    return {
      success: true,
      message: "Saved state fetched successfully",
      saved: !!record,
    };
  } catch (error) {
    console.error("Get saved state error:", error);
    return {
      success: false,
      message: "Failed to fetch saved state. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Saved List ----

export interface SavedContentItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
    /** Public photo path so saved-card avatars need no extra fetch. */
    profileImage: string | null;
  };
}

export interface SavedEntry {
  _id: string;
  contentId: string;
  savedAt: Date;
  content: SavedContentItem;
}

interface GetSavedListResult {
  success: boolean;
  message: string;
  code?: string;
  saved?: SavedEntry[];
}

export async function getSavedContent(
  userId: string
): Promise<GetSavedListResult> {
  try {
    // Newest first, so the list opens on what was saved most recently.
    const records = await SavedContent.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (records.length === 0) {
      return { success: true, message: "Saved content fetched", saved: [] };
    }

    const contentIds = records.map((record) => record.contentId);

    // Content that has since been deleted resolves to nothing here (and the
    // delete cascade removes the rows too), so it drops out of the list
    // instead of rendering as a hole.
    const items = await CulturalContent.find({ _id: { $in: contentIds } })
      .populate("createdBy", "name profileImage")
      .lean();

    const byId = new Map<string, SavedContentItem>();
    for (const item of items) {
      const creator = item.createdBy as unknown as {
        _id: string;
        name: string;
        profileImage?: string | null;
      };
      byId.set(item._id.toString(), {
        _id: item._id.toString(),
        title: item.title,
        content: item.content,
        category: item.category,
        imageUrl: item.imageUrl,
        audioUrl: item.audioUrl ?? null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: {
          id: creator?._id?.toString() || "",
          name: creator?.name || "Unknown",
          profileImage: creator?.profileImage ?? null,
        },
      });
    }

    const saved: SavedEntry[] = [];
    for (const record of records) {
      const content = byId.get(record.contentId.toString());
      if (!content) continue;
      saved.push({
        _id: record._id.toString(),
        contentId: content._id,
        savedAt: record.createdAt,
        content,
      });
    }

    return { success: true, message: "Saved content fetched", saved };
  } catch (error) {
    console.error("Get saved content error:", error);
    return {
      success: false,
      message: "Failed to fetch saved content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}
