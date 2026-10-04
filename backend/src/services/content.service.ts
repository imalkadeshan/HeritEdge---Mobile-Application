import mongoose from "mongoose";
import CulturalContent, {
  ICulturalContentDocument,
} from "../models/culturalContent.model";
import User from "../models/user.model";
import SavedContent from "../models/savedContent.model";
import CollaborationRequest from "../models/collaborationRequest.model";
import Contribution from "../models/contribution.model";
import Notification from "../models/notification.model";
import { findCategoryByKey } from "./category.service";
import { deleteImageByRelativePath } from "./imageStorage";
import { deleteAudioByRelativePath } from "./audioStorage";

/**
 * Categories are validated against the ContentCategory collection rather than
 * a hard-coded list, so a category added by an admin works everywhere without
 * a code change.
 *
 * imageUrl and audioUrl are never taken from a request body: both are attached
 * only by the ownership-checked upload endpoints (see
 * controllers/image.controller.ts and controllers/audio.controller.ts).
 */
interface CreateContentData {
  title: string;
  content: string;
  category: string;
  createdBy: string;
}

interface CreateContentResult {
  success: boolean;
  message: string;
  code?: string;
  content?: ICulturalContentDocument;
}

export async function createContent(
  data: CreateContentData
): Promise<CreateContentResult> {
  const { title, content, category, createdBy } = data;

  if (!title?.trim()) {
    return { success: false, message: "Title is required", code: "CONTENT_TITLE_REQUIRED" };
  }

  if (!content?.trim()) {
    return { success: false, message: "Content is required", code: "CONTENT_BODY_REQUIRED" };
  }

  if (!category?.trim()) {
    return { success: false, message: "Category is required", code: "CONTENT_CATEGORY_REQUIRED" };
  }

  const requestedKey = category.trim();
  const knownCategory = await findCategoryByKey(requestedKey);

  if (!knownCategory) {
    return {
      success: false,
      message: `Unknown category "${requestedKey}". Choose one of the available categories.`,
      code: "CONTENT_CATEGORY_UNKNOWN",
    };
  }

  if (!knownCategory.active) {
    return {
      success: false,
      message: `Category "${requestedKey}" is deactivated and cannot be assigned to new content.`,
      code: "CONTENT_CATEGORY_INACTIVE",
    };
  }

  try {
    const newContent = await CulturalContent.create({
      title: title.trim(),
      content: content.trim(),
      category: knownCategory.key,
      imageUrl: null,
      audioUrl: null,
      createdBy,
    });

    return {
      success: true,
      message: "Content created successfully",
      content: newContent,
    };
  } catch (error) {
    console.error("Create content error:", error);
    return {
      success: false,
      message: "Failed to create content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Update Content ----

interface UpdateContentData {
  contentId: string;
  userId: string;
  title?: string;
  content?: string;
  category?: string;
  /**
   * HE-35: set only by the admin-only routes, which are already gated by
   * `requireRole("admin")`. It skips the createdBy ownership check so an
   * admin can moderate any Elder's item; createdBy itself is never changed.
   * The shared /api/content routes never set it, so they stay owner-only.
   */
  isAdmin?: boolean;
}

export interface UpdateContentResult {
  success: boolean;
  message: string;
  code?: string;
  content?: ICulturalContentDocument;
}

export async function updateContent(
  data: UpdateContentData
): Promise<UpdateContentResult> {
  const { contentId, userId, title, content, category, isAdmin } = data;

  // Same HE-27 guard as getContentById: a malformed id reads as "not found"
  // instead of a CastError-driven 400/500.
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  const existing = await CulturalContent.findById(contentId);
  if (!existing) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  // Owners may edit their own item; an admin may edit anyone's (HE-35).
  // Everyone else - including another Elder - is refused.
  if (!isAdmin && existing.createdBy.toString() !== userId) {
    return { success: false, message: "Not authorized to edit this content", code: "FORBIDDEN" };
  }

  if (title !== undefined) {
    if (!title.trim()) {
      return { success: false, message: "Title is required", code: "CONTENT_TITLE_REQUIRED" };
    }
    existing.title = title.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      return { success: false, message: "Content is required", code: "CONTENT_BODY_REQUIRED" };
    }
    existing.content = content.trim();
  }

  if (category !== undefined) {
    const requestedKey = category.trim();

    if (!requestedKey) {
      return { success: false, message: "Category is required", code: "CONTENT_CATEGORY_REQUIRED" };
    }

    // Deactivated-category rule: content may KEEP the (now deactivated)
    // category it already has, so it stays editable, but it can only be
    // moved to a category that is currently active. New/moved items can
    // never end up on a deactivated category.
    const keepingCurrentCategory =
      requestedKey.toLowerCase() === existing.category.trim().toLowerCase();

    if (!keepingCurrentCategory) {
      const knownCategory = await findCategoryByKey(requestedKey);

      if (!knownCategory) {
        return {
          success: false,
          message: `Unknown category "${requestedKey}". Choose one of the available categories.`,
          code: "CONTENT_CATEGORY_UNKNOWN",
        };
      }

      if (!knownCategory.active) {
        return {
          success: false,
          message: `Category "${knownCategory.key}" is deactivated and cannot be assigned to content.`,
          code: "CONTENT_CATEGORY_INACTIVE",
        };
      }

      existing.category = knownCategory.key;
    }
  }

  existing.updatedAt = new Date();
  await existing.save();

  return {
    success: true,
    message: "Content updated successfully",
    content: existing,
  };
}

// ---- Delete Content ----

/**
 * HE-35 deletion-cleanup policy: what was actually removed from the database
 * (and disk) alongside the CulturalContent document. Every field reports the
 * real outcome of its own step - `failures` names the steps that did not run,
 * so a response can never claim a full cleanup that did not happen.
 */
export interface ContentCleanupReport {
  /** HE-33: SavedContent rows pointing at this item. */
  savedRows: number;
  /** CollaborationRequest rows (pending or accepted) for this item. */
  collaborationRequests: number;
  /** Contribution rows (any review status) for this item. */
  contributions: number;
  /** Notifications that referenced the removed requests/contributions. */
  notifications: number;
  imageFile: "removed" | "absent" | "failed";
  audioFile: "removed" | "absent" | "failed";
  failures: string[];
}

export interface DeleteContentResult {
  success: boolean;
  message: string;
  code?: string;
  cleanup?: ContentCleanupReport;
}

/**
 * Everything that references a content id is removed with it, in one place,
 * so owner deletes (Elder) and admin moderation deletes (HE-35) follow the
 * exact same policy:
 *
 *   1. SavedContent rows        - otherwise saved lists keep dead links (HE-33).
 *   2. CollaborationRequests    - workspace/requests lists populate contentId;
 *                                 a dangling id breaks those reads.
 *   3. Contributions            - approved-contributions reads query by
 *                                 contentId and would otherwise return orphans.
 *   4. Notifications            - the collaboration/contribution notifications
 *                                 above point at the rows just deleted.
 *   5. Image + audio files      - otherwise deleting content strands files.
 *
 * Each step is independent: a failure is recorded and the remaining steps
 * still run. The document itself is already deleted before this is called.
 */
async function cleanupDeletedContent(
  contentId: string,
  imageUrl: string | null,
  audioUrl: string | null
): Promise<ContentCleanupReport> {
  const report: ContentCleanupReport = {
    savedRows: 0,
    collaborationRequests: 0,
    contributions: 0,
    notifications: 0,
    imageFile: imageUrl ? "failed" : "absent",
    audioFile: audioUrl ? "failed" : "absent",
    failures: [],
  };

  // 1. Saved rows (HE-33).
  try {
    const result = await SavedContent.deleteMany({ contentId });
    report.savedRows = result.deletedCount ?? 0;
  } catch (error) {
    console.error("Failed to clear saved references:", error);
    report.failures.push("Saved content rows could not be removed");
  }

  // 2. Collaboration requests - collect the ids first so their
  //    notifications can be cleared too.
  let collaborationIds: mongoose.Types.ObjectId[] = [];
  try {
    const docs = await CollaborationRequest.find({ contentId })
      .select("_id")
      .lean();
    collaborationIds = docs.map((doc) => doc._id);

    const result = await CollaborationRequest.deleteMany({ contentId });
    report.collaborationRequests = result.deletedCount ?? 0;
  } catch (error) {
    console.error("Failed to clear collaboration requests:", error);
    report.failures.push("Collaboration requests could not be removed");
    collaborationIds = [];
  }

  // 3. Contributions (all statuses: pending_review, changes_requested,
  //    approved) - nothing may point at content that no longer exists.
  let contributionIds: mongoose.Types.ObjectId[] = [];
  try {
    const docs = await Contribution.find({ contentId })
      .select("_id")
      .lean();
    contributionIds = docs.map((doc) => doc._id);

    const result = await Contribution.deleteMany({ contentId });
    report.contributions = result.deletedCount ?? 0;
  } catch (error) {
    console.error("Failed to clear contributions:", error);
    report.failures.push("Contributions could not be removed");
    contributionIds = [];
  }

  // 4. Notifications that referenced the rows removed above.
  try {
    const or: Record<string, unknown>[] = [];
    if (collaborationIds.length > 0) {
      or.push({
        relatedModel: "CollaborationRequest",
        relatedId: { $in: collaborationIds },
      });
    }
    if (contributionIds.length > 0) {
      or.push({
        relatedModel: "Contribution",
        relatedId: { $in: contributionIds },
      });
    }

    if (or.length > 0) {
      const result = await Notification.deleteMany({ $or: or });
      report.notifications = result.deletedCount ?? 0;
    }
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    report.failures.push("Notifications could not be removed");
  }

  // 5. Stored files - deleteImageByRelativePath/deleteAudioByRelativePath
  //    return false when the unlink fails (or the path escapes storage), so
  //    the outcome is reported instead of swallowed.
  if (imageUrl) {
    const removed = await deleteImageByRelativePath(imageUrl);
    report.imageFile = removed ? "removed" : "failed";
    if (!removed) {
      report.failures.push("Image file could not be removed");
    }
  }
  if (audioUrl) {
    const removed = await deleteAudioByRelativePath(audioUrl);
    report.audioFile = removed ? "removed" : "failed";
    if (!removed) {
      report.failures.push("Audio file could not be removed");
    }
  }

  return report;
}

export async function deleteContent(
  contentId: string,
  userId: string,
  options: { isAdmin?: boolean } = {}
): Promise<DeleteContentResult> {
  // HE-27: a stale/malformed link must 404, never throw a CastError.
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  const existing = await CulturalContent.findById(contentId);
  if (!existing) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  // Owners delete their own item; an admin may delete any item (HE-35).
  // createdBy itself is never rewritten - attribution survives the edit
  // history of the record until the record is gone.
  if (!options.isAdmin && existing.createdBy.toString() !== userId) {
    return { success: false, message: "Not authorized to delete this content", code: "FORBIDDEN" };
  }

  const imageUrl = existing.imageUrl;
  const audioUrl = existing.audioUrl;
  await CulturalContent.findByIdAndDelete(contentId);

  const cleanup = await cleanupDeletedContent(contentId, imageUrl, audioUrl);

  return {
    success: true,
    message: "Content deleted successfully",
    cleanup,
  };
}

// ---- Get My Content ----

interface GetMyContentResult {
  success: boolean;
  message: string;
  code?: string;
  content?: ICulturalContentDocument[];
}

export async function getMyContent(
  userId: string
): Promise<GetMyContentResult> {
  try {
    const content = await CulturalContent.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    return {
      success: true,
      message: "Content fetched successfully",
      content,
    };
  } catch (error) {
    console.error("Get my content error:", error);
    return {
      success: false,
      message: "Failed to fetch content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Get All Content (Browse) ----

interface ContentWithCreator {
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
    /** Public photo path so avatars render without a second request. */
    profileImage: string | null;
  };
}

interface GetAllContentResult {
  success: boolean;
  message: string;
  code?: string;
  content?: ContentWithCreator[];
  /** Set when the caller asked to filter by a category that does not exist,
   *  so the controller can answer 400 instead of 500 (HE-29). */
  invalidCategory?: boolean;
}

export async function getAllContent(
  search?: string,
  category?: string
): Promise<GetAllContentResult> {
  try {
    const query: Record<string, unknown> = {};

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { content: regex }];
    }

    if (category?.trim()) {
      const knownCategory = await findCategoryByKey(category);
      if (!knownCategory) {
        // HE-29: a filter the server cannot honour must fail loudly. Ignoring
        // the key would answer with the complete list under a category the
        // client never asked for.
        return {
          success: false,
          message: `Unknown category "${category.trim()}". Choose one of the available categories.`,
          code: "CONTENT_CATEGORY_UNKNOWN",
          invalidCategory: true,
        };
      }
      // Filtering resolves the key against every category, active or not, so
      // content in a deactivated category stays listable when asked for
      // (HE-36 deactivation policy); GET /categories just stops offering it.
      query.category = knownCategory.key;
    }

    const items = await CulturalContent.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profileImage")
      .lean();

    const content: ContentWithCreator[] = items.map((item) => {
      const creator = item.createdBy as unknown as {
        _id: string;
        name: string;
        profileImage?: string | null;
      };
      return {
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
      };
    });

    return {
      success: true,
      message: "Content fetched successfully",
      content,
    };
  } catch (error) {
    console.error("Get all content error:", error);
    return {
      success: false,
      message: "Failed to fetch content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Get Content By ID ----

interface GetContentByIdResult {
  success: boolean;
  message: string;
  code?: string;
  content?: ContentWithCreator;
}

export async function getContentById(
  contentId: string
): Promise<GetContentByIdResult> {
  // A malformed id never reaches the driver: without this it would raise a
  // CastError and surface as a 500, while the detail screen needs a clean
  // "not found" for an invalid or stale link (HE-27).
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    const item = await CulturalContent.findById(contentId)
      .populate("createdBy", "name profileImage")
      .lean();

    if (!item) {
      return { success: false, message: "Content not found", code: "NOT_FOUND" };
    }

    const creator = item.createdBy as unknown as {
      _id: string;
      name: string;
      profileImage?: string | null;
    };

    const content: ContentWithCreator = {
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
    };

    return {
      success: true,
      message: "Content fetched successfully",
      content,
    };
  } catch (error) {
    console.error("Get content by id error:", error);
    return {
      success: false,
      message: "Failed to fetch content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}
