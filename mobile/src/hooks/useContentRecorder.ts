import { useCallback, useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { PickedAudio } from "../services/api";
import { useAppSettings } from "../context/AppSettingsContext";
import {
  MAX_RECORDING_SECONDS,
  audioNameForUri,
  audioTypeForUri,
  durationFromSeconds,
} from "../utils/contentAudio";

/**
 * Recording state shared by the Elder create/edit screens (HE-26).
 *
 * Wraps expo-audio's recorder (SDK 54 docs: prepareToRecordAsync -> record ->
 * stop, uri available on the recorder afterwards) with the two things the UI
 * always needs: a clear "something is busy" flag so taps cannot double-fire,
 * and an error/permission message that never depends on a native alert
 * (Alert.alert is a no-op on web in this project).
 */
export interface ContentRecorder {
  /** True while the microphone is live. */
  isRecording: boolean;
  /** Seconds captured so far in the current take. */
  elapsedSeconds: number;
  /** True while preparing/stopping - buttons should be disabled. */
  busy: boolean;
  /** The take waiting to be previewed or uploaded, if any. */
  recording: PickedAudio | null;
  permissionDenied: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  discard: () => void;
  clearError: () => void;
}

export function useContentRecorder(): ContentRecorder {
  const { t } = useAppSettings();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recording, setRecording] = useState<PickedAudio | null>(null);

  const isRecording = Boolean(state.isRecording);
  const elapsedSeconds = Math.floor((state.durationMillis || 0) / 1000);

  const start = useCallback(async () => {
    if (busy || state.isRecording) return;

    setError(null);
    setPermissionDenied(false);

    try {
      // Requested when recording starts, never on mount (SDK 54 guidance).
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setPermissionDenied(true);
        setError(t("elder.recorderPermission"));
        return;
      }

      setBusy(true);
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      // A new take replaces whatever was previewed before.
      setRecording(null);
    } catch {
      setError(t("elder.recorderStartFailed"));
    } finally {
      setBusy(false);
    }
  }, [busy, state.isRecording, recorder, t]);

  const stop = useCallback(async () => {
    if (!state.isRecording || busy) return;

    setBusy(true);
    try {
      await recorder.stop();

      const uri = recorder.uri;
      const status = recorder.getStatus();
      const durationSeconds = durationFromSeconds(
        (status?.durationMillis || 0) / 1000
      );

      if (!uri) {
        setError(t("elder.recorderSaveFailed"));
        return;
      }

      if (
        typeof durationSeconds === "number" &&
        durationSeconds > MAX_RECORDING_SECONDS
      ) {
        setError(
          t("elder.recorderTooLong", {
            minutes: Math.round(MAX_RECORDING_SECONDS / 60),
          })
        );
        return;
      }

      setRecording({
        uri,
        name: audioNameForUri(uri),
        type: audioTypeForUri(uri),
        durationSeconds,
      });
    } catch {
      setError(t("elder.recorderStopFailed"));
    } finally {
      setBusy(false);
    }
  }, [busy, state.isRecording, recorder, t]);

  const discard = useCallback(() => {
    setRecording(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isRecording,
    elapsedSeconds,
    busy,
    recording,
    permissionDenied,
    error,
    start,
    stop,
    discard,
    clearError,
  };
}
