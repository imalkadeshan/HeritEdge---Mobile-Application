import { Response } from "express";
import mongoose from "mongoose";
import multer, { MulterError } from "multer";
import CulturalContent, {
  ICulturalContentDocument,
} from "../models/culturalContent.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  MAX_IMAGE_BYTES,
  deleteImageByRelativePath,
  detectImageType,
  saveImage,
} from "../services/imageStorage";

/**
 * Image attach/replace/remove for cultural content (HE-23).
 *
 * Security properties:
 *   - the route is behind `authenticate`, so an anonymous request never
 *     reaches the parser,
 *   - ownership is checked from MongoDB BEFORE the multipart body is read, so
 *     a non-owner gets 403 without any file being stored,
 *   - the only accepted source of imageUrl is this endpoint: JSON bodies can
 *     no longer write an arbitrary URL onto an item,
 *   - bytes are validated (magic numbers) and size-checked server-side, the
 *     stored file name is generated, and the path is server-relative.
 */

class UnsupportedMediaTypeError extends Error {}

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const declared = (file.mimetype || "").toLowerCase();
    if (!declared.startsWith("image/")) {
      callback(new UnsupportedMediaTypeError("Only image files are allowed"));
      return;
    }
    callback(null, true);
  },
});

/**
 * Maps multer/parse failures onto the shared 4xx/5xx JSON responses.
 * Exported so the profile-photo controller returns the exact same errors.
 */
export function respondUploadError(res: Response, error: unknown): void {
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: `Image is too large. Maximum size is ${Math.floor(
          MAX_IMAGE_BYTES / (1024 * 1024)
        )} MB.`,
        code: "IMAGE_TOO_LARGE",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "The image could not be read. Please choose another file.",
      code: "IMAGE_INVALID",
    });
    return;
  }

  if (error instanceof UnsupportedMediaTypeError) {
    res
      .status(400)
      .json({ success: false, message: error.message, code: "IMAGE_INVALID" });
    return;
  }

  // Malformed or truncated multipart bodies surface as busboy parse errors
  // rather than MulterErrors - that is a bad request from the client, never a
  // server fault.
  if (
    error instanceof Error &&
    /malformed (part|mime) header|unexpected end of (form|input)/i.test(
      error.message
    )
  ) {
    res.status(400).json({
      success: false,
      message: 'No image received. Send the file in the "image" field.',
      code: "IMAGE_MISSING",
    });
    return;
  }

  console.error("Image upload error:", error);
  res
    .status(500)
    .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
}

/**
 * Finds the item and confirms the caller owns it. Runs before multer so an
 * unauthorised request never has its file accepted.
 */
async function findOwnedContent(
  contentId: string,
  userId: string
): Promise<
  | { status: 200; content: ICulturalContentDocument }
  | { status: 404 | 403 | 500; message: string; code: string }
> {
  if (!mongoose.isValidObjectId(contentId)) {
    return { status: 404, message: "Content not found", code: "NOT_FOUND" };
  }

  try {
    const existing = await CulturalContent.findById(contentId);

    if (!existing) {
      return { status: 404, message: "Content not found", code: "NOT_FOUND" };
    }

    if (existing.createdBy.toString() !== userId) {
      return {
        status: 403,
        message: "Not authorized to change the image of this content",
        code: "FORBIDDEN",
      };
    }

    return { status: 200, content: existing };
  } catch (error) {
    console.error("Find content for image error:", error);
    return {
      status: 500,
      message: "Something went wrong. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- POST /api/content/:id/image ----

export async function uploadContentImage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
    return;
  }

  const contentId = req.params.id as string;
  const ownership = await findOwnedContent(contentId, req.userId);

  if (ownership.status !== 200) {
    res
      .status(ownership.status)
      .json({
        success: false,
        message: ownership.message,
        code: ownership.code,
      });
    return;
  }

  uploadImage.single("image")(req, res, async (error) => {
    if (error) {
      respondUploadError(res, error);
      return;
    }

    const file = req.file;

    if (!file || !file.buffer || file.buffer.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No image received. Send the file in the "image" field.',
        code: "IMAGE_MISSING",
      });
      return;
    }

    if (file.buffer.length > MAX_IMAGE_BYTES) {
      res.status(413).json({
        success: false,
        message: `Image is too large. Maximum size is ${Math.floor(
          MAX_IMAGE_BYTES / (1024 * 1024)
        )} MB.`,
        code: "IMAGE_TOO_LARGE",
      });
      return;
    }

    // Trust the bytes, not the client's mimetype.
    if (!detectImageType(file.buffer)) {
      res.status(400).json({
        success: false,
        message:
          "The uploaded file is not a supported image (JPEG, PNG, GIF or WebP).",
        code: "IMAGE_INVALID",
      });
      return;
    }

    try {
      const previous = ownership.content.imageUrl;
      const saved = await saveImage(file.buffer);

      ownership.content.imageUrl = saved.relativePath;
      ownership.content.updatedAt = new Date();

      try {
        await ownership.content.save();
      } catch (saveError) {
        await deleteImageByRelativePath(saved.relativePath);
        throw saveError;
      }

      // Replaced or removed: drop the old file so it does not become an
      // orphan on disk.
      if (previous && previous !== saved.relativePath) {
        await deleteImageByRelativePath(previous);
      }

      res.json({
        success: true,
        message: "Image uploaded successfully",
        content: ownership.content,
      });
    } catch (uploadError) {
      console.error("Save uploaded image error:", uploadError);
      res
        .status(500)
        .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
    }
  });
}

// ---- DELETE /api/content/:id/image ----

export async function removeContentImage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
    return;
  }

  const contentId = req.params.id as string;
  const ownership = await findOwnedContent(contentId, req.userId);

  if (ownership.status !== 200) {
    res
      .status(ownership.status)
      .json({
        success: false,
        message: ownership.message,
        code: ownership.code,
      });
    return;
  }

  const previous = ownership.content.imageUrl;

  if (!previous) {
    res.json({
      success: true,
      message: "This content has no image",
      content: ownership.content,
    });
    return;
  }

  ownership.content.imageUrl = null;
  ownership.content.updatedAt = new Date();

  try {
    await ownership.content.save();
  } catch (error) {
    console.error("Clear image error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
    return;
  }

  await deleteImageByRelativePath(previous);

  res.json({
    success: true,
    message: "Image removed successfully",
    content: ownership.content,
  });
}
