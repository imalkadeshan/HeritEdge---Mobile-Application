import * as ImagePicker from "expo-image-picker";
import { PickedImage } from "../services/api";
import { TranslationKey } from "../i18n/translations";

/**
 * Image picking for cultural content (HE-23).
 *
 * The picked value is only a local preview/upload handle: the URI of a device
 * file is never written to the database. The server answers the upload with
 * the relative path that gets stored instead.
 */

/** Mirrors MAX_IMAGE_BYTES in backend/src/services/imageStorage.ts. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_MB = Math.floor(MAX_IMAGE_BYTES / (1024 * 1024));

/**
 * Localizable picker failure: callers render `t(error.key, error.params)`
 * (keys live under `content.pick*`). Returning a descriptor instead of a
 * sentence keeps the util language-free.
 */
export interface PickContentImageError {
  key: TranslationKey;
  params?: Record<string, string | number>;
}

export interface PickContentImageResult {
  image?: PickedImage;
  canceled?: boolean;
  error?: PickContentImageError;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fallbackName(uri: string): string {
  const clean = uri.split("?")[0].split("#")[0];
  const last = clean.substring(clean.lastIndexOf("/") + 1);
  return last && last.includes(".") ? last : "photo.jpg";
}

/**
 * Opens the system image picker and returns a validated, upload-ready image.
 * Returns `{ canceled: true }` when the user closes the picker without
 * choosing anything, or a human-readable `error` when validation fails.
 */
export async function pickContentImage(): Promise<PickContentImageResult> {
  // Always granted on web; on device this shows the system permission prompt
  // the first time (see expo-image-picker docs for SDK 54).
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: { key: "content.pickPermissionDenied" } };
  }

  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
  } catch {
    return { error: { key: "content.pickOpenFailed" } };
  }

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  const webFile = (asset as { file?: File }).file ?? null;
  const fileSize = asset.fileSize ?? (webFile ? webFile.size : undefined);

  if (fileSize === 0) {
    return { error: { key: "content.pickEmptyFile" } };
  }

  if (typeof fileSize === "number" && fileSize > MAX_IMAGE_BYTES) {
    return {
      error: {
        key: "content.pickTooLarge",
        params: { size: formatBytes(fileSize), max: MAX_IMAGE_MB },
      },
    };
  }

  return {
    image: {
      uri: asset.uri,
      name: asset.fileName || fallbackName(asset.uri),
      type: asset.mimeType || "image/jpeg",
      fileSize,
      webFile,
    },
  };
}
