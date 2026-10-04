import { PickedAudio } from "../services/api";

/**
 * Audio helpers for HE-26 (recording + upload validation).
 *
 * The values here mirror backend/src/services/audioStorage.ts so a recording
 * that the app can produce is always one the server accepts, and a recording
 * that would be rejected is caught before it is sent.
 */

/** Mirrors MAX_AUDIO_BYTES on the server. */
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_MB = Math.floor(MAX_AUDIO_BYTES / (1024 * 1024));

/**
 * Recording cap. At the HIGH_QUALITY preset (128 kbit/s) ten minutes is
 * about 9.6 MB, i.e. just inside the upload limit, so a recording that is
 * allowed to finish is always one the server will accept on size.
 */
export const MAX_RECORDING_SECONDS = 600;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 0 → "0:00", 75 → "1:15". */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Content type for a local recording. The extension expo-audio writes is the
 * only thing that decides this - never the platform guess - because the same
 * value is what the server's file filter sees.
 */
export function audioTypeForUri(uri: string): string {
  if (/\.webm($|\?)/i.test(uri)) return "audio/webm";
  if (/\.(ogg|oga)($|\?)/i.test(uri)) return "audio/ogg";
  if (/\.mp3($|\?)/i.test(uri)) return "audio/mpeg";
  // Default matches RecordingPresets.HIGH_QUALITY: .m4a on Android/iOS, and
  // audio/webm for MediaRecorder on the web (blob URLs carry no extension).
  if (/^(blob|data):/i.test(uri)) return "audio/webm";
  return "audio/mp4";
}

/** Upload-safe filename for a local recording (the server ignores it, but
 * the multipart part still needs a name with a sensible extension). */
export function audioNameForUri(uri: string): string {
  const type = audioTypeForUri(uri);
  const extension =
    type === "audio/webm"
      ? "webm"
      : type === "audio/ogg"
        ? "ogg"
        : type === "audio/mpeg"
          ? "mp3"
          : "m4a";
  return `recording.${extension}`;
}

export function durationFromSeconds(seconds: number | undefined): number | undefined {
  return typeof seconds === "number" && isFinite(seconds)
    ? Math.max(0, Math.round(seconds))
    : undefined;
}

/** Human label used in confirm dialogs and hints. */
export function describeRecording(audio: PickedAudio): string {
  const duration = audio.durationSeconds
    ? ` (${formatDuration(audio.durationSeconds)})`
    : "";
  return `recording${duration}`;
}
