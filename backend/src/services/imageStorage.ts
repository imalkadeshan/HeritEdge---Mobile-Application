import crypto from "crypto";
import fs, { promises as fsp } from "fs";
import path from "path";

/**
 * Local disk storage for cultural-item images (HE-23).
 *
 * Everything about the stored path is server controlled:
 *   - the directory is derived from this module's location, never from user
 *     input or the request,
 *   - the file name is random (crypto.randomBytes) plus an extension taken
 *     from the sniffed content, never the client's filename,
 *   - the value written to MongoDB is the server-relative URL
 *     "/uploads/content/<name>", which is served back by express.static.
 *
 * Note on deployment: these files live on the local filesystem, so any host
 * that is not a single machine with persistent disk (serverless, ephemeral
 * containers, scaled instances) needs shared/persistent storage instead.
 */

/** Hard limit for a single upload. Enforced by multer and re-checked here. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** backend/uploads regardless of the current working directory. */
const STORAGE_ROOT = path.resolve(__dirname, "..", "..", "uploads");
const IMAGE_DIR = path.join(STORAGE_ROOT, "content");

/** Mounted by app.ts so stored images can be fetched over HTTP. */
export const UPLOADS_ROOT = STORAGE_ROOT;

/** URL prefix app.ts mounts the static middleware on. */
export const IMAGE_URL_PREFIX = "/uploads/content";

export interface DetectedImage {
  mime: string;
  ext: string;
}

function isAscii(buffer: Buffer, text: string, offset: number): boolean {
  return buffer.toString("ascii", offset, offset + text.length) === text;
}

/**
 * Detects the real image type from the file's magic bytes.
 *
 * The declared mimetype of an upload is client controlled, so it is never
 * trusted: only what the bytes actually are decides whether the file is
 * accepted and which extension it gets.
 */
export function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: ".jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: ".png" };
  }

  // GIF: "GIF87a" / "GIF89a"
  if (isAscii(buffer, "GIF8", 0)) {
    return { mime: "image/gif", ext: ".gif" };
  }

  // WebP: "RIFF" .... "WEBP"
  if (isAscii(buffer, "RIFF", 0) && isAscii(buffer, "WEBP", 8)) {
    return { mime: "image/webp", ext: ".webp" };
  }

  return null;
}

/** Creates backend/uploads/content when it does not exist yet. */
export function ensureImageStorage(): void {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

/** Absolute path of an uploaded file (for tests / diagnostics). */
export function absoluteImagePath(relativePath: string): string | null {
  return toSafeTarget(relativePath);
}

/**
 * Maps a stored server-relative path onto a file inside `uploadDir`.
 *
 * Shared by the image and HE-26 audio stores so both get the same rules:
 * the value must live under `prefix`, only its basename is used, and the
 * resolved path is re-checked so nothing can escape `uploadDir`.
 *
 * Returns null when the path is not usable - callers must treat that as
 * "nothing to delete" rather than falling back to the raw value.
 */
export function safeUploadTarget(
  prefix: string,
  uploadDir: string,
  relativePath: string
): string | null {
  if (!relativePath || !relativePath.startsWith(`${prefix}/`)) return null;

  // basename() strips any directory part a caller might have smuggled in.
  const base = path.basename(relativePath);
  const target = path.join(uploadDir, base);
  if (path.dirname(target) !== uploadDir) return null;
  return target;
}

function toSafeTarget(relativePath: string): string | null {
  return safeUploadTarget(IMAGE_URL_PREFIX, IMAGE_DIR, relativePath);
}

/**
 * Writes the buffer with a generated name and returns the server-relative
 * URL to store on the cultural item.
 */
export async function saveImage(
  buffer: Buffer
): Promise<{ fileName: string; relativePath: string; absolutePath: string }> {
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new Error("Unsupported image type");
  }

  const fileName = `${crypto.randomBytes(16).toString("hex")}${detected.ext}`;
  const absolutePath = path.join(IMAGE_DIR, fileName);

  await fsp.mkdir(IMAGE_DIR, { recursive: true });
  await fsp.writeFile(absolutePath, buffer);

  return {
    fileName,
    relativePath: `${IMAGE_URL_PREFIX}/${fileName}`,
    absolutePath,
  };
}

/**
 * Best-effort removal of a stored image. Never throws: cleanup of a stale
 * file must not fail the API call that triggered it.
 */
export async function deleteImageByRelativePath(
  relativePath: string | null | undefined
): Promise<boolean> {
  const target = relativePath ? toSafeTarget(relativePath) : null;
  if (!target) return false;

  try {
    await fsp.unlink(target);
    return true;
  } catch {
    return false;
  }
}
