import mongoose from "mongoose";
import CulturalContent from "../models/culturalContent.model";
import ContentCategoryModel from "../models/contentCategory.model";
import SavedContent from "../models/savedContent.model";
import CollaborationRequest from "../models/collaborationRequest.model";
import Contribution from "../models/contribution.model";
import { findCategoryByKey } from "./category.service";
import { updateContent, deleteContent } from "./content.service";

// ---- HE-35 admin cultural-content management ----
//
// Read/modify access to ANY Elder's item, gated by the admin-only routes.
// Three rules shape everything here:
//   1. `createdBy` is attribution, never a target - no endpoint rewrites it.
//   2. Writes reuse content.service (the same validation an Elder gets), so
//      admin edits can never be looser than the owner's own edit.
//   3. Responses only ever carry the fields listed in the interfaces below.

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
/** Keeps one request from pulling the whole collection. */
export const MAX_LIMIT = 50;
export const MAX_SEARCH_LENGTH = 100;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Creator attribution attached to every admin view of an item. */
export interface AdminContentCreator {
  id: string;
  name: string;
  email: string;
  role: "elder" | "youth" | "admin" | null;
  /** Public photo path for the creator avatar (no other fields leak). */
  profileImage: string | null;
}

/** The only item shape this service ever returns (deliberate whitelist). */
export interface AdminContentItem {
  id: string;
  title: string;
  content: string;
  /** Immutable category key stored on the item. */
  category: string;
  /** Current display label of that category (falls back to the key). */
  categoryLabel: string;
  imageUrl: string | null;
  audioUrl: string | null;
  creator: AdminContentCreator;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ContentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListContentQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export interface ListContentResult {
  success: boolean;
  message: string;
  code?: string;
  content?: AdminContentItem[];
  pagination?: ContentPagination;
  /** Category filter the server cannot honour (controller answers 400). */
  invalidCategory?: boolean;
}

type PopulatedCreator = {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  role?: string | null;
  profileImage?: string | null;
};

/**
 * Case-insensitive key -> label map for every category, active or not, so an
 * item in a deactivated category still shows its real label.
 */
async function loadCategoryLabels(): Promise<Map<string, string>> {
  const docs = await ContentCategoryModel.find()
    .select("key label")
    .lean();

  const labels = new Map<string, string>();
  for (const doc of docs) {
    labels.set(doc.key.trim().toLowerCase(), doc.label);
  }
  return labels;
}

function toCreator(raw: unknown): AdminContentCreator {
  const creator = (raw ?? {}) as Partial<PopulatedCreator>;
  return {
    id: creator._id ? creator._id.toString() : "",
    name: creator.name || "Unknown",
    email: creator.email || "",
    role: (creator.role as AdminContentCreator["role"]) ?? null,
    profileImage: creator.profileImage ?? null,
  };
}

function toItem(
  doc: {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    category: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: unknown;
  },
  labels: Map<string, string>
): AdminContentItem {
  const key = doc.category?.trim() ?? "";
  return {
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    category: key,
    categoryLabel: labels.get(key.toLowerCase()) ?? key,
    imageUrl: doc.imageUrl ?? null,
    audioUrl: doc.audioUrl ?? null,
    creator: toCreator(doc.createdBy),
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

export async function listContent(
  query: ListContentQuery
): Promise<ListContentResult> {
  const { page, limit, search, category } = query;

  try {
    const filter: Record<string, unknown> = {};

    if (category?.trim()) {
      const knownCategory = await findCategoryByKey(category);
      if (!knownCategory) {
        // Same HE-29 rule as Browse: an unknown filter fails loudly instead
        // of silently returning every category.
        return {
          success: false,
          message: `Unknown category "${category.trim()}". Choose one of the available categories.`,
          code: "CONTENT_CATEGORY_UNKNOWN",
          invalidCategory: true,
        };
      }
      filter.category = knownCategory.key;
    }

    if (search) {
      // Literal text: moderators must be able to search for "C++" and "a.b".
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const skip = (page - 1) * limit;

    const [labels, total, docs] = await Promise.all([
      loadCategoryLabels(),
      CulturalContent.countDocuments(filter),
      CulturalContent.find(filter)
        .populate("createdBy", "name email role profileImage")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const content = docs.map((doc) => toItem(doc, labels));
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Content fetched successfully",
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("List content error:", error);
    return {
      success: false,
      message: "Failed to fetch content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Detail ----

export interface AdminApprovedContribution {
  id: string;
  submittedBy: { id: string; name: string };
  type: string;
  text: string;
  language: string;
  status: string;
  createdAt: Date | null;
}

export interface AdminContentStats {
  savedCount: number;
  collaborationRequestCount: number;
  contributionCount: number;
  approvedContributionCount: number;
}

export interface AdminContentDetail {
  item: AdminContentItem;
  stats: AdminContentStats;
  approvedContributions: AdminApprovedContribution[];
}

export interface ContentDetailResult {
  success: boolean;
  message: string;
  code?: string;
  detail?: AdminContentDetail;
}

export async function getContentDetail(
  contentId: string
): Promise<ContentDetailResult> {
  // Malformed ids read as "not found", never as a CastError 500 (HE-27 rule
  // applied to the admin route too).
  if (!mongoose.isValidObjectId(contentId)) {
    return { success: false, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    const [item, labels, savedCount, collaborationRequestCount, contributionCount, approved] =
      await Promise.all([
        CulturalContent.findById(contentId)
          .populate("createdBy", "name email role profileImage")
          .lean(),
        loadCategoryLabels(),
        SavedContent.countDocuments({ contentId }),
        CollaborationRequest.countDocuments({ contentId }),
        Contribution.countDocuments({ contentId }),
        Contribution.find({ contentId, status: "approved" })
          .populate("submittedBy", "name")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    if (!item) {
      return { success: false, message: "Content not found", code: "NOT_FOUND" };
    }

    const approvedContributions: AdminApprovedContribution[] = approved.map(
      (doc) => ({
        id: doc._id.toString(),
        submittedBy: {
          id: toCreator(doc.submittedBy).id,
          name: toCreator(doc.submittedBy).name,
        },
        type: doc.type,
        text: doc.text,
        language: doc.language,
        status: doc.status,
        createdAt: doc.createdAt ?? null,
      })
    );

    return {
      success: true,
      message: "Content fetched successfully",
      detail: {
        item: toItem(item, labels),
        stats: {
          savedCount,
          collaborationRequestCount,
          contributionCount,
          approvedContributionCount: approvedContributions.length,
        },
        approvedContributions,
      },
    };
  } catch (error) {
    console.error("Get content detail error:", error);
    return {
      success: false,
      message: "Failed to fetch content. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Edit ----

interface AdminEditData {
  contentId: string;
  title?: string;
  content?: string;
  category?: string;
}

/**
 * Admin edit: same validation as the Elder's own edit (trimmed fields,
 * HE-36 category rules), with only the ownership check skipped. The caller
 * passes just title/content/category - everything else in the body was
 * already dropped by the controller, so createdBy, imageUrl, audioUrl and
 * every other privileged field are unreachable from here.
 */
export function updateContentAsAdmin(data: AdminEditData) {
  return updateContent({ ...data, userId: "", isAdmin: true });
}

// ---- Delete ----

/**
 * Admin delete: the shared deletion path (owner and admin run the identical
 * cleanup policy), with only the ownership check skipped. The response
 * carries the ContentCleanupReport so the caller sees exactly what was
 * removed and which steps, if any, failed.
 */
export function deleteContentAsAdmin(contentId: string) {
  return deleteContent(contentId, "", { isAdmin: true });
}
