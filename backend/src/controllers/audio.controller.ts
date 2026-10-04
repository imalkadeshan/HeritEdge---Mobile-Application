import { Response } from "express";
import mongoose from "mongoose";
import multer, { MulterError } from "multer";
import CulturalContent, {
  ICulturalContentDocument,
} from "../models/culturalContent.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  MAX_AUDIO_BYTES,
  MAX_AUDIO_MB,
  detectAudioType,
  deleteAudioByRelativePath,
  saveAudio,
} from "../services/audioStorage";

/**
 * Audio attach/replace/remove for cultural content (HE-26).
 *
 * Same shape as controllers/image.controller.ts on purpose:
 *   - behind `authenticate`, so an anonymous request never reaches the parser,
 *   - ownership is checked from MongoDB BEFORE the multipart body is read, so
 *     a non-owner gets 403 without any file being stored,
 *   - JSON create/update can never write an arbitrary audioUrl,
 *   - bytes are validated (container magic numbers) and size-checked
 *     server-side, the file name is generated, the path is server-relative.
 */

class UnsupportedMediaTypeError extends Error {}

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AUDIO_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const declared = (file.mimetype || "").toLowerCase();
    if (!declared.startsWith("audio/")) {
      callback(new UnsupportedMediaTypeError("Only audio files are allowed"));
      return;
    }
    callback(null, true);
  },
});

function respondUploadError(res: Response, error: unknown): void {
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: `Audio is too large. Maximum size is ${MAX_AUDIO_MB} MB.`,
        code: "AUDIO_TOO_LARGE",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "The audio could not be read. Please record it again.",
      code: "AUDIO_INVALID",
    });
    return;
  }

  if (error instanceof UnsupportedMediaTypeError) {
    res
      .status(400)
      .json({ success: false, message: error.message, code: "AUDIO_INVALID" });
    return;
  }

  // Malformed or truncated multipart bodies surface as busboy parse errors
  // rather than MulterErrors - a bad request, never a server fault. Same
  // mapping as the image endpoint.
  if (
    error instanceof Error &&
    /malformed (part|mime) header|unexpected end of (form|input)/i.test(
      error.message
    )
  ) {
    res.status(400).json({
      success: false,
      message: 'No audio received. Send the file in the "audio" field.',
      code: "AUDIO_MISSING",
    });
    return;
  }

  console.error("Audio upload error:", error);
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
        message: "Not authorized to change the audio of this content",
        code: "FORBIDDEN",
      };
    }

    return { status: 200, content: existing };
  } catch (error) {
    console.error("Find content for audio error:", error);
    return {
      status: 500,
      message: "Something went wrong. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- POST /api/content/:id/audio ----

export async function uploadContentAudio(
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

  uploadAudio.single("audio")(req, res, async (error) => {
    if (error) {
      respondUploadError(res, error);
      return;
    }

    const file = req.file;

    if (!file || !file.buffer || file.buffer.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No audio received. Send the file in the "audio" field.',
        code: "AUDIO_MISSING",
      });
      return;
    }

    if (file.buffer.length > MAX_AUDIO_BYTES) {
      res.status(413).json({
        success: false,
        message: `Audio is too large. Maximum size is ${MAX_AUDIO_MB} MB.`,
        code: "AUDIO_TOO_LARGE",
      });
      return;
    }

    // Trust the bytes, not the client's mimetype or filename.
    if (!detectAudioType(file.buffer)) {
      res.status(400).json({
        success: false,
        message:
          "The uploaded file is not a supported recording (M4A/MP4, WebM or Ogg).",
        code: "AUDIO_INVALID",
      });
      return;
    }

    try {
      const previous = ownership.content.audioUrl;
      const saved = await saveAudio(file.buffer);

      ownership.content.audioUrl = saved.relativePath;
      ownership.content.updatedAt = new Date();

      try {
        await ownership.content.save();
      } catch (saveError) {
        await deleteAudioByRelativePath(saved.relativePath);
        throw saveError;
      }

      // Replaced: drop the old recording so it does not become an orphan.
      if (previous && previous !== saved.relativePath) {
        await deleteAudioByRelativePath(previous);
      }

      res.json({
        success: true,
        message: "Audio uploaded successfully",
        content: ownership.content,
      });
    } catch (uploadError) {
      console.error("Save uploaded audio error:", uploadError);
      res
        .status(500)
        .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
    }
  });
}

// ---- DELETE /api/content/:id/audio ----

export async function removeContentAudio(
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

  const previous = ownership.content.audioUrl;

  if (!previous) {
    res.json({
      success: true,
      message: "This content has no audio",
      content: ownership.content,
    });
    return;
  }

  ownership.content.audioUrl = null;
  ownership.content.updatedAt = new Date();

  try {
    await ownership.content.save();
  } catch (error) {
    console.error("Clear audio error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
    return;
  }

  await deleteAudioByRelativePath(previous);

  res.json({
    success: true,
    message: "Audio removed successfully",
    content: ownership.content,
  });
}
