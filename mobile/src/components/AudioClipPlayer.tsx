import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useAppSettings } from "../context/AppSettingsContext";
import { formatDuration } from "../utils/contentAudio";

interface AudioClipPlayerProps {
  /** Absolute URL (remote) or local file/blob URI of the recording. */
  uri: string;
  /**
   * Shown next to the player and used in accessibility labels. Falls back to
   * the localized default media label ("Recording") when not supplied.
   */
  title?: string;
}

/**
 * Play/pause control for one recording (HE-26).
 *
 * - a stored path is checked for reachability first, so a missing or broken
 *   file shows a clear error instead of a dead button,
 * - loading, playing and error states are all visible, and a playback
 *   failure never hides the content around it,
 * - the single button exposes an accessibility label that reads its state.
 */
export function AudioClipPlayer({ uri, title }: AudioClipPlayerProps) {
  const { t, language } = useAppSettings();
  const mediaTitle = title || t("content.recording");
  // English templates read the media noun in lower case ("this recording");
  // Sinhala has no case folding, so its label passes through unchanged.
  const mediaNoun = language === "en" ? mediaTitle.toLowerCase() : mediaTitle;
  const isRemote = /^https?:/i.test(uri);

  const [check, setCheck] = useState<"checking" | "ready" | "error">(
    isRemote ? "checking" : "ready"
  );
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!isRemote) {
      setCheck("ready");
      return;
    }

    let cancelled = false;
    setCheck("checking");
    setPlaybackError(null);

    (async () => {
      try {
        const response = await fetch(uri, {
          method: "GET",
          headers: { Range: "bytes=0-1" },
        });
        if (cancelled) return;

        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        // A reachable file that answers with something that is not our audio
        // (an error page, a redirect body) counts as missing too.
        if (!response.ok || contentType.startsWith("text/html")) {
          setCheck("error");
          return;
        }
        setCheck("ready");
      } catch {
        if (!cancelled) setCheck("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri, attempt, isRemote]);

  // Never leave the user staring at "Loading" forever.
  useEffect(() => {
    if (status.isLoaded) {
      setTimedOut(false);
      return;
    }
    if (check !== "ready") return;

    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [check, status.isLoaded]);

  const retry = useCallback(() => {
    setPlaybackError(null);
    setTimedOut(false);
    setAttempt((value) => value + 1);
    try {
      player.replace(uri);
    } catch {
      // The reachability check below is what decides the visible state.
    }
  }, [player, uri]);

  const toggle = useCallback(async () => {
    try {
      if (status.playing) {
        player.pause();
        return;
      }

      const atEnd =
        status.duration > 0 && status.currentTime >= status.duration - 0.05;
      if (status.didJustFinish || atEnd) {
        // expo-audio does not rewind on its own: replay needs seekTo(0).
        await player.seekTo(0);
      }

      player.play();
      setPlaybackError(null);
    } catch {
      setPlaybackError(t("content.audioPlayFailed", { title: mediaNoun }));
    }
  }, [player, status, mediaNoun, t]);

  const failed = check === "error" || (timedOut && !status.isLoaded);

  if (check === "checking") {
    return (
      <View
        style={styles.container}
        accessibilityLabel={t("content.audioLoadingA11y", {
          title: mediaTitle,
        })}
      >
        <ActivityIndicator size="small" color={colors.primary.main} />
        <AppText variant="caption" color={colors.text.secondary}>
          {t("content.audioChecking", { title: mediaNoun })}
        </AppText>
      </View>
    );
  }

  if (failed) {
    return (
      <View style={styles.container}>
        <AppText variant="caption" color={colors.error.main}>
          {timedOut && !status.isLoaded
            ? t("content.audioTimeout", { title: mediaNoun })
            : t("content.audioMissing", { title: mediaNoun })}
        </AppText>
        <AppButton
          label={t("content.audioRetry", { title: mediaNoun })}
          variant="outline"
          size="sm"
          onPress={retry}
        />
      </View>
    );
  }

  if (!status.isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <AppText variant="caption" color={colors.text.secondary}>
          {t("content.audioPreparing", { title: mediaNoun })}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppButton
          label={status.playing ? t("content.pause") : t("content.play")}
          variant="secondary"
          size="sm"
          onPress={toggle}
          accessibilityLabel={
            status.playing
              ? t("content.pauseA11y", { title: mediaNoun })
              : t("content.playA11y", { title: mediaNoun })
          }
          accessibilityRole="button"
        />
        <AppText variant="caption" color={colors.text.secondary}>
          {formatDuration(status.currentTime)}
          {status.duration > 0 ? ` / ${formatDuration(status.duration)}` : ""}
        </AppText>
      </View>
      {status.isBuffering && (
        <AppText variant="caption" color={colors.text.tertiary}>
          {t("content.buffering")}
        </AppText>
      )}
      {playbackError && (
        <AppText variant="caption" color={colors.error.main}>
          {playbackError}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
