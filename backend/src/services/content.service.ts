import CulturalContent, {
  ContentCategory,
  ICulturalContentDocument,
} from "../models/culturalContent.model";
import User from "../models/user.model";

const VALID_CATEGORIES: ContentCategory[] = [
  "Story",
  "Proverb",
  "Recipe",
  "Tradition",
  "Song",
  "Dialect Word",
];

interface CreateContentData {
  title: string;
  content: string;
  category: ContentCategory;
  imageUrl?: string;
  createdBy: string;
}

interface CreateContentResult {
  success: boolean;
  message: string;
  content?: ICulturalContentDocument;
}

export async function createContent(
  data: CreateContentData
): Promise<CreateContentResult> {
  const { title, content, category, imageUrl, createdBy } = data;

  if (!title?.trim()) {
    return { success: false, message: "Title is required" };
  }

  if (!content?.trim()) {
    return { success: false, message: "Content is required" };
  }

  if (!category) {
    return { success: false, message: "Category is required" };
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return {
      success: false,
      message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
    };
  }

  try {
    const newContent = await CulturalContent.create({
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: imageUrl || null,
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
    };
  }
}

// ---- Update Content ----

interface UpdateContentData {
  contentId: string;
  userId: string;
  title?: string;
  content?: string;
  category?: ContentCategory;
  imageUrl?: string;
}

interface UpdateContentResult {
  success: boolean;
  message: string;
  content?: ICulturalContentDocument;
}

export async function updateContent(
  data: UpdateContentData
): Promise<UpdateContentResult> {
  const { contentId, userId, title, content, category, imageUrl } = data;

  const existing = await CulturalContent.findById(contentId);
  if (!existing) {
    return { success: false, message: "Content not found" };
  }

  if (existing.createdBy.toString() !== userId) {
    return { success: false, message: "Not authorized to edit this content" };
  }

  if (title !== undefined) {
    if (!title.trim()) {
      return { success: false, message: "Title is required" };
    }
    existing.title = title.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      return { success: false, message: "Content is required" };
    }
    existing.content = content.trim();
  }

  if (category !== undefined) {
    if (!VALID_CATEGORIES.includes(category)) {
      return {
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      };
    }
    existing.category = category;
  }

  if (imageUrl !== undefined) {
    existing.imageUrl = imageUrl || null;
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

interface DeleteContentResult {
  success: boolean;
  message: string;
}

export async function deleteContent(
  contentId: string,
  userId: string
): Promise<DeleteContentResult> {
  const existing = await CulturalContent.findById(contentId);
  if (!existing) {
    return { success: false, message: "Content not found" };
  }

  if (existing.createdBy.toString() !== userId) {
    return { success: false, message: "Not authorized to delete this content" };
  }

  await CulturalContent.findByIdAndDelete(contentId);

  return {
    success: true,
    message: "Content deleted successfully",
  };
}

// ---- Get My Content ----

interface GetMyContentResult {
  success: boolean;
  message: string;
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
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
  };
}

interface GetAllContentResult {
  success: boolean;
  message: string;
  content?: ContentWithCreator[];
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

    if (category && VALID_CATEGORIES.includes(category as ContentCategory)) {
      query.category = category;
    }

    const items = await CulturalContent.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name")
      .lean();

    const content: ContentWithCreator[] = items.map((item) => {
      const creator = item.createdBy as unknown as { _id: string; name: string };
      return {
        _id: item._id.toString(),
        title: item.title,
        content: item.content,
        category: item.category,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        creator: {
          id: creator?._id?.toString() || "",
          name: creator?.name || "Unknown",
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
    };
  }
}

// ---- Get Content By ID ----

interface GetContentByIdResult {
  success: boolean;
  message: string;
  content?: ContentWithCreator;
}

export async function getContentById(
  contentId: string
): Promise<GetContentByIdResult> {
  try {
    const item = await CulturalContent.findById(contentId)
      .populate("createdBy", "name")
      .lean();

    if (!item) {
      return { success: false, message: "Content not found" };
    }

    const creator = item.createdBy as unknown as { _id: string; name: string };

    const content: ContentWithCreator = {
      _id: item._id.toString(),
      title: item.title,
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      creator: {
        id: creator?._id?.toString() || "",
        name: creator?.name || "Unknown",
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
    };
  }
}
