import { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AppText,
  AppHeader,
  AppInput,
  AppButton,
  SelectionChip,
  AudioClipPlayer,
} from "../../src/components";
import { useSafeAreaInsets, stackBottomPadding } from "../../src/utils/safeArea";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { useAppSettings } from "../../src/context/AppSettingsContext";
import { apiErrorText } from "../../src/i18n/apiError";
import {
  Category,
  PickedAudio,
  PickedImage,
  apiCreateContent,
  apiGetCategories,
  apiUpdateContent,
  apiUploadContentAudio,
  apiUploadContentImage,
} from "../../src/services/api";
import { pickContentImage, MAX_IMAGE_MB } from "../../src/utils/contentImage";
import { MAX_AUDIO_MB, formatDuration } from "../../src/utils/contentAudio";
import { useContentRecorder } from "../../src/hooks/useContentRecorder";
import { useCategoryLabel } from "../../src/hooks/useCategoryLabel";

interface CreateContentForm {
  title: string;
  content: string;
  category: string | null;
}

export default function CreateContentScreen() {
  const router = useRouter();
  const { t, language } = useAppSettings();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<CreateContentForm>({
    title: "",
    content: "",
    category: null,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // HE-23 image flow
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // HE-26 audio flow. The take stays local until the content exists, exactly
  // like the photo: a failed upload must never look like a failed save.
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUploading, setUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState<number | null>(null);
  const recorder = useContentRecorder();
  const categoryLabel = useCategoryLabel(categories);
  /** The take waiting to be uploaded, if any. */
  const pendingAudio = recorder.recording;

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const result = await apiGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        setCategoriesError(
          apiErrorText(result, language) || t("home.errorCategories")
        );
      }
    } catch {
      setCategoriesError(t("common.connectionError"));
    } finally {
      setCategoriesLoading(false);
    }
  }, [t, language]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateField = <K extends keyof CreateContentForm>(
    field: K,
    value: CreateContentForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = t("elder.titleRequired");
    if (!form.content.trim()) next.content = t("elder.contentRequired");
    if (!form.category) next.category = t("elder.selectCategory");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePickImage = async () => {
    setPickError(null);
    const selection = await pickContentImage();

    if (selection.canceled) return;
    if (selection.error) {
      setPickError(t(selection.error.key, selection.error.params));
      return;
    }
    if (selection.image) {
      setPicked(selection.image);
      setImageError(null);
      setNotice(null);
    }
  };

  const handleRemovePickedImage = () => {
    setPicked(null);
    setPickError(null);
    setImageError(null);
  };

  /**
   * The item already exists when this runs, so a failed upload never loses
   * the content - it only reports the missing image.
   */
  const uploadPickedImage = async (contentId: string): Promise<boolean> => {
    if (!picked) return true;

    setUploading(true);
    setUploadProgress(0);
    setImageError(null);

    try {
      const result = await apiUploadContentImage(
        contentId,
        picked,
        setUploadProgress
      );

      if (result.success) {
        setPicked(null);
        return true;
      }

      setImageError(
        apiErrorText(result, language) || t("elder.imageUploadFailed")
      );
      return false;
    } catch {
      setImageError(t("elder.imageUploadConnection"));
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  /**
   * Same contract as the photo: the take is kept (so it can be retried)
   * unless the server confirmed the upload.
   */
  const uploadAudio = async (
    contentId: string,
    audio: PickedAudio
  ): Promise<boolean> => {
    setUploadingAudio(true);
    setAudioProgress(0);
    setAudioError(null);

    try {
      const result = await apiUploadContentAudio(contentId, audio, setAudioProgress);

      if (result.success) {
        recorder.discard();
        return true;
      }

      setAudioError(
        apiErrorText(result, language) || t("elder.audioUploadFailed")
      );
      return false;
    } catch {
      setAudioError(t("elder.audioUploadConnection"));
      return false;
    } finally {
      setUploadingAudio(false);
      setAudioProgress(null);
    }
  };

  const handleStartRecording = async () => {
    setAudioError(null);
    await recorder.start();
  };

  const handleStopRecording = async () => {
    await recorder.stop();
  };

  const handleDiscardRecording = () => {
    recorder.discard();
    setAudioError(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!form.category) return;
    if (recorder.isRecording || recorder.busy) {
      setAudioError(t("elder.stopBeforeSubmit"));
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setNotice(null);

    try {
      let contentId = createdId;
      let createdNow = false;
      const audioToUpload = pendingAudio;

      // Create first: the media uploads need the item's id (HE-23 step 8).
      if (!contentId) {
        const result = await apiCreateContent({
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
        });

        if (!result.success) {
          if (result.message.includes("Authentication")) {
            router.replace("/login");
            return;
          }
          setSubmitError(
            apiErrorText(result, language) || t("elder.createSaveFailed")
          );
          return;
        }

        contentId =
          (result.data as { _id?: string } | null | undefined)?._id || "";

        if (!contentId) {
          setSubmitError(t("elder.createSavedNoId"));
          return;
        }

        setCreatedId(contentId);
        createdNow = true;
      }

      const wanted: string[] = [];
      if (picked) wanted.push("photo");
      if (audioToUpload) wanted.push("audio");

      if (wanted.length === 0) {
        router.back();
        return;
      }

      // Retry path: the item already exists, so any text edited since the
      // first attempt has to be written back before the uploads.
      if (!createdNow && contentId) {
        const sync = await apiUpdateContent(contentId, {
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category,
        });

        if (!sync.success) {
          setSubmitError(
            apiErrorText(sync, language) || t("elder.createUpdateFailed")
          );
          return;
        }
      }

      const failed: string[] = [];
      if (picked) {
        const ok = await uploadPickedImage(contentId);
        if (!ok) failed.push("photo");
      }
      if (audioToUpload) {
        const ok = await uploadAudio(contentId, audioToUpload);
        if (!ok) failed.push("audio");
      }

      if (failed.length === 0) {
        router.back();
        return;
      }

      const savedTitle = form.title.trim();
      setNotice(
        failed.length > 1
          ? t("elder.createNoticeBoth", { title: savedTitle })
          : failed[0] === "photo"
            ? t("elder.createNoticePhoto", { title: savedTitle })
            : t("elder.createNoticeAudio", { title: savedTitle })
      );
    } catch {
      setSubmitError(t("common.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const hasPendingMedia = Boolean(picked || pendingAudio);
  const anyUploading = uploading || audioUploading;

  const footerLabel = uploading && uploadProgress !== null
    ? t("elder.uploadingPhotoPct", { percent: Math.round(uploadProgress * 100) })
    : audioUploading && audioProgress !== null
      ? t("elder.uploadingAudioPct", { percent: Math.round(audioProgress * 100) })
      : anyUploading
        ? t("elder.uploading")
        : loading
          ? t("elder.saving")
          : createdId
            ? hasPendingMedia
              ? t("elder.uploadMedia")
              : t("common.done")
            : t("elder.shareKnowledge");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppHeader title={t("elder.createTitle")} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="subheading" style={styles.heading}>
          {t("elder.createHeading")}
        </AppText>
        <AppText variant="body" color={colors.text.secondary}>
          {t("elder.createSubtitle")}
        </AppText>

        {submitError && (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.error.main}>
              {submitError}
            </AppText>
          </View>
        )}

        {notice && (
          <View style={styles.noticeBanner}>
            <AppText variant="bodySmall" color={colors.warning.main}>
              {notice}
            </AppText>
            <View style={styles.noticeActions}>
              {hasPendingMedia && (
                <AppButton
                  label={anyUploading ? t("elder.retrying") : t("elder.retryUpload")}
                  variant="secondary"
                  size="sm"
                  onPress={handleSubmit}
                  loading={anyUploading}
                  disabled={anyUploading || loading}
                  accessibilityLabel={t("elder.retryUploadA11y")}
                />
              )}
              <AppButton
                label={t("elder.finishWithoutMedia")}
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
                disabled={anyUploading || loading}
                accessibilityLabel={t("elder.finishWithoutMediaA11y")}
              />
            </View>
          </View>
        )}

        <View style={styles.form}>
          <AppInput
            label={t("elder.fieldTitle")}
            placeholder={t("elder.fieldTitlePlaceholder")}
            value={form.title}
            onChangeText={(text) => updateField("title", text)}
            error={errors.title}
          />

          <AppInput
            label={t("elder.fieldContent")}
            placeholder={t("elder.fieldContentPlaceholder")}
            value={form.content}
            onChangeText={(text) => updateField("content", text)}
            multiline
            numberOfLines={6}
            style={styles.contentInput}
            error={errors.content}
          />

          <View style={styles.section}>
            <AppText variant="label">{t("elder.categoryHeading")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("elder.categoryHint")}
            </AppText>
            {categoriesLoading ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t("home.loadingCategories")}
              </AppText>
            ) : categoriesError ? (
              <View style={styles.categoryErrorBlock}>
                <AppText variant="caption" color={colors.error.main}>
                  {categoriesError}
                </AppText>
                <AppButton
                  label={t("common.retry")}
                  variant="ghost"
                  size="sm"
                  onPress={loadCategories}
                />
              </View>
            ) : (
              <View style={styles.chipsRow}>
                {categories.map((cat) => (
                  <SelectionChip
                    key={cat._id}
                    label={categoryLabel(cat.key)}
                    selected={form.category === cat.key}
                    onPress={() =>
                      updateField(
                        "category",
                        form.category === cat.key ? null : cat.key
                      )
                    }
                  />
                ))}
                {categories.length === 0 && (
                  <AppText variant="caption" color={colors.text.secondary}>
                    {t("elder.noCategories")}
                  </AppText>
                )}
              </View>
            )}
            {errors.category && (
              <AppText
                variant="caption"
                color={colors.error.main}
                style={styles.categoryError}
              >
                {errors.category}
              </AppText>
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="label">{t("elder.photoSectionOptional")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("elder.photoHintCreate", { max: MAX_IMAGE_MB })}
            </AppText>

            {picked && (
              <View style={styles.previewWrap}>
                <Image
                  source={{ uri: picked.uri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                {uploading && (
                  <View style={styles.previewOverlay}>
                    <AppText variant="caption" color={colors.primary.contrast}>
                      {uploadProgress !== null
                        ? t("elder.uploadingPct", {
                            percent: Math.round(uploadProgress * 100),
                          })
                        : t("elder.uploading")}
                    </AppText>
                  </View>
                )}
              </View>
            )}

            <View style={styles.imageActions}>
              <AppButton
                label={
                  picked ? t("elder.changePhoto") : t("elder.choosePhoto")
                }
                variant="secondary"
                size="sm"
                onPress={handlePickImage}
                disabled={loading || uploading}
              />
              {picked && (
                <AppButton
                  label={t("elder.removePhoto")}
                  variant="outline"
                  size="sm"
                  onPress={handleRemovePickedImage}
                  disabled={loading || uploading}
                />
              )}
            </View>

            {pickError && (
              <AppText variant="caption" color={colors.error.main}>
                {pickError}
              </AppText>
            )}
            {imageError && (
              <AppText variant="caption" color={colors.error.main}>
                {imageError}
              </AppText>
            )}
            {uploading && (
              <AppText variant="caption" color={colors.text.secondary}>
                {uploadProgress !== null
                  ? t("elder.uploadingPhotoPct", {
                      percent: Math.round(uploadProgress * 100),
                    })
                  : t("elder.uploadingPhoto")}
              </AppText>
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="label">{t("elder.audioSectionOptional")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("elder.audioHintCreate", {
                max: MAX_AUDIO_MB,
                minutes: Math.round(600 / 60),
              })}
            </AppText>

            <View style={styles.imageActions}>
              {recorder.isRecording ? (
                <AppButton
                  label={
                    recorder.busy ? t("elder.stopping") : t("elder.stopRecording")
                  }
                  variant="primary"
                  size="sm"
                  onPress={handleStopRecording}
                  loading={recorder.busy}
                  disabled={
                    recorder.busy || loading || anyUploading
                  }
                  accessibilityLabel={t("elder.stopRecording")}
                  accessibilityRole="button"
                />
              ) : (
                <AppButton
                  label={
                    recorder.busy
                      ? t("elder.starting")
                      : pendingAudio
                        ? t("elder.recordAgain")
                        : t("elder.startRecording")
                  }
                  variant="secondary"
                  size="sm"
                  onPress={handleStartRecording}
                  loading={recorder.busy}
                  disabled={
                    recorder.busy || loading || anyUploading
                  }
                  accessibilityLabel={t("elder.startRecordingA11y")}
                  accessibilityRole="button"
                />
              )}

              {recorder.isRecording && (
                <AppText variant="caption" color={colors.primary.main}>
                  {t("elder.recordingElapsed", {
                    duration: formatDuration(recorder.elapsedSeconds),
                  })}
                </AppText>
              )}
            </View>

            {recorder.error && (
              <AppText variant="caption" color={colors.error.main}>
                {recorder.error}
              </AppText>
            )}

            {pendingAudio && (
              <View style={styles.audioPreview}>
                <AudioClipPlayer
                  uri={pendingAudio.uri}
                  title={t("elder.recordingTitle")}
                />
                <AppText variant="caption" color={colors.text.secondary}>
                  {pendingAudio.durationSeconds !== undefined
                    ? `${formatDuration(pendingAudio.durationSeconds)} - `
                    : ""}
                  {t("elder.uploadedWhenShare")}
                </AppText>
                <AppButton
                  label={t("elder.discardRecording")}
                  variant="outline"
                  size="sm"
                  onPress={handleDiscardRecording}
                  disabled={recorder.busy || loading || anyUploading}
                  accessibilityLabel={t("elder.discardRecordingA11y")}
                />
              </View>
            )}

            {!pendingAudio && !recorder.isRecording && (
              <AppText variant="caption" color={colors.text.secondary}>
                {t("elder.noRecording")}
              </AppText>
            )}

            {audioError && (
              <AppText variant="caption" color={colors.error.main}>
                {audioError}
              </AppText>
            )}
            {audioUploading && (
              <AppText variant="caption" color={colors.text.secondary}>
                {audioProgress !== null
                  ? t("elder.uploadingAudioPct", {
                      percent: Math.round(audioProgress * 100),
                    })
                  : t("elder.uploadingAudio")}
              </AppText>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          // A pushed screen with no tab bar: the submit button clears the
          // home indicator exactly once.
          { paddingBottom: stackBottomPadding(insets, spacing.xxl) },
        ]}
      >
        <AppButton
          label={footerLabel}
          onPress={handleSubmit}
          fullWidth
          loading={loading || anyUploading}
          disabled={loading || anyUploading || recorder.busy}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  heading: {
    marginTop: spacing.lg,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  contentInput: {
    height: 140,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHint: {
    marginTop: -spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryError: {
    marginTop: spacing.xxs,
  },
  categoryErrorBlock: {
    gap: spacing.xxs,
    alignItems: "flex-start",
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    // paddingBottom is supplied inline from the insets.
  },
  errorBanner: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeBanner: {
    backgroundColor: colors.background.warm,
    borderWidth: 1,
    borderColor: "#FFE082",
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  noticeActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  previewWrap: {
    position: "relative",
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
  },
  preview: {
    width: "100%",
    height: 180,
  },
  previewOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  imageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  audioPreview: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
