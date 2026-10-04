import crypto from "crypto";
import fs, { promises as fsp } from "fs";
import path from "path";
import { safeUploadTarget } from "./imageStorage";

/**
 * Local disk storage for cultural-item recordings (HE-26).
 *
 * Deliberately mirrors backend/src/services/imageStorage.ts - same generated
 * names, same server-relative stored path, same basename containment checks
 * (reused through safeUploadTarget) - but writes into its own directory so
 * audio and images can be bounded, inspected and cleaned up independently.
 *
 * Deployment note (same as images): files live on the local filesystem, so a
 * host without persistent disk (serverless, ephemeral containers, multiple
 * instances) needs shared/persistent storage instead.
 */

/** Hard limit for a single recording. Enforced by multer and re-checked here. */
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_MB = Math.floor(MAX_AUDIO_BYTES / (1024 * 1024));

const STORAGE_ROOT = path.resolve(__dirname, "..", "..", "uploads");
/** uploads/audio, sibling of uploads/content, both under the /uploads mount. */
const AUDIO_DIR = path.join(STORAGE_ROOT, "audio");

/** Mounted by app.ts (alongside uploads/content) so recordings can be fetched. */
export const AUDIO_STORAGE_ROOT = STORAGE_ROOT;

/** URL prefix app.ts serves recordings from. */
export const AUDIO_URL_PREFIX = "/uploads/audio";

export interface DetectedAudio {
  mime: string;
  ext: string;
}

function isAscii(buffer: Buffer, text: string, offset: number): boolean {
  return buffer.toString("ascii", offset, offset + text.length) === text;
}

/**
 * Detects the real audio container from the file's magic bytes.
 *
 * The client's filename and mimetype are both attacker controlled, so neither
 * decides anything here. Only containers the app itself can produce (see
 * RecordingPresets in expo-audio) are accepted:
 *
 *   - ISO base media file format (".m4a"/".mp4"/".3gp"): AAC in MPEG-4, which
 *     is what expo-audio's HIGH_QUALITY preset writes on Android and iOS.
 *   - WebM: what the same preset records with MediaRecorder in the browser.
 *   - Ogg: what Firefox's MediaRecorder produces.
 */
export function detectAudioType(buffer: Buffer): DetectedAudio | null {
  if (buffer.length < 12) return null;

  // ISO-BMFF: size (4 bytes) then "ftyp" at offset 4.
  if (isAscii(buffer, "ftyp", 4)) {
    return { mime: "audio/mp4", ext: ".m4a" };
  }

  // WebM / Matroska: EBML header 1A 45 DF A3.
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { mime: "audio/webm", ext: ".webm" };
  }

  // Ogg: "OggS".
  if (isAscii(buffer, "OggS", 0)) {
    return { mime: "audio/ogg", ext: ".ogg" };
  }

  return null;
}

/**
 * Explicit content type for a stored recording path, so what the API serves
 * always matches the container that was stored. Returns null for anything
 * this module did not write, leaving the static handler's own lookup in charge.
 */
export function audioContentType(relativePath: string): string | null {
  const safe = safeUploadTarget(AUDIO_URL_PREFIX, AUDIO_DIR, relativePath);
  if (!safe) return null;

  switch (path.extname(safe).toLowerCase()) {
    case ".m4a":
    case ".m4b":
    case ".mp4":
    case ".mp4a":
      return "audio/mp4";
    case ".webm":
      return "audio/webm";
    case ".ogg":
    case ".oga":
      return "audio/ogg";
    default:
      return null;
  }
}

/** Creates uploads/audio when it does not exist yet. */
export function ensureAudioStorage(): void {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/** Absolute path of a stored recording (for tests / diagnostics). */
export function absoluteAudioPath(relativePath: string): string | null {
  return safeUploadTarget(AUDIO_URL_PREFIX, AUDIO_DIR, relativePath);
}

/**
 * Writes the buffer with a generated name and returns the server-relative
 * URL to store on the cultural item.
 */
export async function saveAudio(
  buffer: Buffer
): Promise<{ fileName: string; relativePath: string; absolutePath: string }> {
  const detected = detectAudioType(buffer);
  if (!detected) {
    throw new Error("Unsupported audio type");
  }

  const fileName = `${crypto.randomBytes(16).toString("hex")}${detected.ext}`;
  const absolutePath = path.join(AUDIO_DIR, fileName);

  await fsp.mkdir(AUDIO_DIR, { recursive: true });
  await fsp.writeFile(absolutePath, buffer);

  return {
    fileName,
    relativePath: `${AUDIO_URL_PREFIX}/${fileName}`,
    absolutePath,
  };
}

/**
 * Best-effort removal of a stored recording. Never throws: cleanup of a stale
 * file must not fail the API call that triggered it.
 */
export async function deleteAudioByRelativePath(
  relativePath: string | null | undefined
): Promise<boolean> {
  const target = relativePath ? safeUploadTarget(AUDIO_URL_PREFIX, AUDIO_DIR, relativePath) : null;
  if (!target) return false;

  try {
    await fsp.unlink(target);
    return true;
  } catch {
    return false;
  }
}
