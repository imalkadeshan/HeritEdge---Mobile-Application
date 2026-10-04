import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  AppText,
  AppHeader,
  AppInput,
  AppButton,
  SelectionChip,
  AudioClipPlayer,
} from "../../src/components";
import {
  useSafeAreaInsets,
  horizontalSafePadding,
  stackBottomPadding,
} from "../../src/utils/safeArea";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { useAppSettings } from "../../src/context/AppSettingsContext";
import { apiErrorText } from "../../src/i18n/apiError";
import {
  Category,
  PickedAudio,
  PickedImage,
  apiUpdateContent,
  apiDeleteContent,
  apiGetCategories,
  apiGetContentById,
  apiUploadContentImage,
  apiRemoveContentImage,
  apiUploadContentAudio,
  apiRemoveContentAudio,
  resolveImageUrl,
  resolveAudioUrl,
} from "../../src/services/api";
import { pickContentImage, MAX_IMAGE_MB } from "../../src/utils/contentImage";
import { MAX_AUDIO_MB, formatDuration } from "../../src/utils/contentAudio";
import { useContentRecorder } from "../../src/hooks/useContentRecorder";
import { useCategoryLabel } from "../../src/hooks/useCategoryLabel";

interface EditContentForm {
  title: string;
  content: string;
  category: string | null;
}

interface CategoryChoice {
  key: string;
  label: string;
  inactive: boolean;
}

export default function EditContentScreen() {
  const router = useRouter();
  const { t, language } = useAppSettings();
  const insets = useSafeAreaInsets();
  const {
    id,
    title: initialTitle,
    content: initialContent,
    category: initialCategory,
  } = useLocalSearchParams<{
    id: string;
    title: string;
    content: string;
    category: string;
  }>();

  const [form, setForm] = useState<EditContentForm>({
    title: initialTitle || "",
    content: initialContent || "",
    category: initialCategory || null,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // HE-23 image state. `currentImage` is the server-relative path from
  // MongoDB; `picked` is a local, not-yet-uploaded selection.
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  // HE-26 audio state. `currentAudio` is the stored server path; a take made
  // here stays local until "Upload recording" succeeds.
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [audioUploading, setUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showRemoveAudioModal, setShowRemoveAudioModal] = useState(false);
  const [removingAudio, setRemovingAudio] = useState(false);
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

  // The edit route only receives text fields, so the stored image path is
  // read back from the server before offering change/remove controls.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await apiGetContentById(id);
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            imageUrl?: string | null;
            audioUrl?: string | null;
          };
          setCurrentImage(data.imageUrl || null);
          setCurrentAudio(data.audioUrl || null);
        }
      } catch {
        // Leave the media unknown: the controls simply stay hidden.
      } finally {
        if (!cancelled) setImageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /**
   * Choices come from the backend. When this item sits on a category that has
   * since been deactivated it is appended as an inactive option, so the elder
   * can keep it (the server allows keeping but not choosing a deactivated
   * category) or move the content to an active one.
   */
  const choices: CategoryChoice[] = useMemo(() => {
    const list: CategoryChoice[] = categories.map((cat) => ({
      key: cat.key,
      label: categoryLabel(cat.key),
      inactive: false,
    }));

    if (
      initialCategory &&
      !list.some((choice) => choice.key.toLowerCase() === initialCategory.toLowerCase())
    ) {
      list.push({
        key: initialCategory,
        label: t("elder.inactiveCategoryLabel", {
          category: categoryLabel(initialCategory),
        }),
        inactive: true,
      });
    }

    return list;
  }, [categories, initialCategory, categoryLabel, t]);

  const currentCategory = form.category;
  const selectedChoice = currentCategory
    ? choices.find(
        (choice) => choice.key.toLowerCase() === currentCategory.toLowerCase()
      )
    : undefined;

  // Server path -> displayable URL; a fresh local pick wins while uploading.
  const storedImageUri = resolveImageUrl(currentImage);
  const previewUri = picked ? picked.uri : storedImageUri;

  const storedAudioUri = resolveAudioUrl(currentAudio);
  const anyMediaBusy =
    uploading ||
    audioUploading ||
    removingImage ||
    removingAudio ||
    recorder.busy;

  useEffect(() => {
    if (initialTitle) setForm((prev) => ({ ...prev, title: initialTitle }));
    if (initialContent)
      setForm((prev) => ({ ...prev, content: initialContent }));
    if (initialCategory) setForm((prev) => ({ ...prev, category: initialCategory }));
  }, [initialTitle, initialContent, initialCategory]);

  const updateField = <K extends keyof EditContentForm>(
    field: K,
    value: EditContentForm[K]
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

  const handleSave = async () => {
    if (!validate()) return;
    if (!form.category || !id) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await apiUpdateContent(id, {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
      });

      if (result.success) {
        router.back();
      } else {
        if (result.message.includes("Authentication")) {
          router.replace("/login");
        } else {
          setErrorMessage(apiErrorText(result, language) || t("common.errorTitle"));
        }
      }
    } catch {
      setErrorMessage(t("common.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (!id) return;

    setPickError(null);
    const selection = await pickContentImage();

    if (selection.canceled) return;
    if (selection.error) {
      setPickError(t(selection.error.key, selection.error.params));
      return;
    }
    if (!selection.image) return;

    setPicked(selection.image);
    await uploadImage(selection.image);
  };

  /** Replaces the stored image. The item already exists, so this is a single step. */
  const uploadImage = async (image: PickedImage) => {
    if (!id) return;

    setUploading(true);
    setUploadProgress(0);
    setImageError(null);

    try {
      const result = await apiUploadContentImage(id, image, setUploadProgress);

      if (result.success) {
        const data = result.data as { imageUrl?: string | null } | null;
        setCurrentImage(data?.imageUrl || null);
        setPicked(null);
        setErrorMessage(null);
      } else {
        // Keep the local pick so the preview stays and the upload can be
        // retried without re-choosing the photo.
        setImageError(
          apiErrorText(result, language) || t("elder.imageUploadFailed")
        );
      }
    } catch {
      setImageError(t("elder.imageUploadConnection"));
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleRemoveImage = async () => {
    if (!id) return;

    setShowRemoveImageModal(false);
    setRemovingImage(true);
    setImageError(null);

    try {
      const result = await apiRemoveContentImage(id);

      if (result.success) {
        setCurrentImage(null);
        setPicked(null);
        setErrorMessage(null);
      } else {
        setImageError(
          apiErrorText(result, language) || t("elder.imageRemoveFailed")
        );
      }
    } catch {
      setImageError(t("common.connectionError"));
    } finally {
      setRemovingImage(false);
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

  /** Replaces the stored recording. The item already exists: one step. */
  const uploadAudio = async (audio: PickedAudio): Promise<boolean> => {
    if (!id) return false;

    setUploadingAudio(true);
    setAudioProgress(0);
    setAudioError(null);

    try {
      const result = await apiUploadContentAudio(id, audio, setAudioProgress);

      if (result.success) {
        const data = result.data as { audioUrl?: string | null } | null;
        setCurrentAudio(data?.audioUrl ?? null);
        recorder.discard();
        return true;
      }

      // Keep the take so the upload can be retried without re-recording.
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

  const handleRemoveAudio = async () => {
    if (!id) return;

    setShowRemoveAudioModal(false);
    setRemovingAudio(true);
    setAudioError(null);

    try {
      const result = await apiRemoveContentAudio(id);

      if (result.success) {
        const data = result.data as { audioUrl?: string | null } | null;
        setCurrentAudio(data?.audioUrl ?? null);
        recorder.discard();
      } else {
        setAudioError(
          apiErrorText(result, language) || t("elder.audioRemoveFailed")
        );
      }
    } catch {
      setAudioError(t("common.connectionError"));
    } finally {
      setRemovingAudio(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteModal(false);
    setDeleting(true);
    setErrorMessage(null);
    try {
      const result = await apiDeleteContent(id);
      if (result.success) {
        router.back();
      } else {
        if (result.message.includes("Authentication")) {
          router.replace("/login");
        } else {
          setErrorMessage(apiErrorText(result, language) || t("common.errorTitle"));
        }
      }
    } catch {
      setErrorMessage(t("common.connectionError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppHeader title={t("elder.editTitle")} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="subheading" style={styles.heading}>
          {t("elder.editHeading")}
        </AppText>
        <AppText variant="body" color={colors.text.secondary}>
          {t("elder.editSubtitle")}
        </AppText>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.error.main}>
              {errorMessage}
            </AppText>
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
                {choices.map((choice) => (
                  <SelectionChip
                    key={choice.key}
                    label={choice.label}
                    selected={
                      !!currentCategory &&
                      currentCategory.toLowerCase() === choice.key.toLowerCase()
                    }
                    onPress={() =>
                      updateField(
                        "category",
                        currentCategory &&
                          currentCategory.toLowerCase() === choice.key.toLowerCase()
                          ? null
                          : choice.key
                      )
                    }
                  />
                ))}
              </View>
            )}
            {selectedChoice?.inactive && (
              <AppText
                variant="caption"
                color={colors.warning.main}
                style={styles.categoryError}
              >
                {t("elder.categoryDeactivated", { label: selectedChoice.label })}
              </AppText>
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
            <AppText variant="label">{t("elder.photoSection")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("elder.photoHintEdit", { max: MAX_IMAGE_MB })}
            </AppText>

            {previewUri ? (
              <View style={styles.previewWrap}>
                <Image
                  source={{ uri: previewUri }}
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
            ) : imageLoading ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t("elder.loadingPhoto")}
              </AppText>
            ) : (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t("elder.noPhotoYet")}
              </AppText>
            )}

            <View style={styles.imageActions}>
              <AppButton
                label={
                  uploading
                    ? t("elder.uploading")
                    : picked
                      ? t("elder.changePhoto")
                      : previewUri
                        ? t("elder.changePhoto")
                        : t("elder.choosePhoto")
                }
                variant="secondary"
                size="sm"
                onPress={handlePickImage}
                loading={uploading}
                disabled={uploading || loading || deleting || removingImage}
              />
              {storedImageUri && !picked && (
                <AppButton
                  label={
                    removingImage ? t("elder.removing") : t("elder.removePhoto")
                  }
                  variant="outline"
                  size="sm"
                  onPress={() => setShowRemoveImageModal(true)}
                  loading={removingImage}
                  disabled={uploading || loading || deleting || removingImage}
                />
              )}
            </View>

            {pickError && (
              <AppText variant="caption" color={colors.error.main}>
                {pickError}
              </AppText>
            )}

            {imageError && (
              <View style={styles.imageErrorBlock}>
                <AppText variant="caption" color={colors.error.main}>
                  {imageError}
                </AppText>
                {picked && (
                  <AppButton
                    label={t("elder.retryUpload")}
                    variant="ghost"
                    size="sm"
                    onPress={() => uploadImage(picked)}
                    disabled={uploading}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <AppText variant="label">{t("elder.audioSection")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("elder.audioHintEdit", { max: MAX_AUDIO_MB, minutes: 10 })}
            </AppText>

            {pendingAudio ? (
              <View style={styles.audioPreview}>
                <AudioClipPlayer
                  uri={pendingAudio.uri}
                  title={t("elder.newRecordingTitle")}
                />
                <AppText variant="caption" color={colors.text.secondary}>
                  {t("elder.takeNotUploaded")}
                </AppText>
                <View style={styles.imageActions}>
                  <AppButton
                    label={
                      audioUploading ? t("elder.uploading") : t("elder.uploadRecording")
                    }
                    variant="secondary"
                    size="sm"
                    onPress={() => uploadAudio(pendingAudio)}
                    loading={audioUploading}
                    disabled={anyMediaBusy || loading || deleting}
                    accessibilityLabel={t("elder.uploadRecordingA11y")}
                  />
                  <AppButton
                    label={t("elder.discardRecording")}
                    variant="outline"
                    size="sm"
                    onPress={handleDiscardRecording}
                    disabled={anyMediaBusy || loading || deleting}
                    accessibilityLabel={t("elder.discardNewRecordingA11y")}
                  />
                </View>
              </View>
            ) : storedAudioUri ? (
              <AudioClipPlayer uri={storedAudioUri} title={t("elder.recordingTitle")} />
            ) : imageLoading ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t("elder.loadingRecording")}
              </AppText>
            ) : (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t("elder.noRecording")}
              </AppText>
            )}

            <View style={styles.imageActions}>
              <AppButton
                label={
                  recorder.isRecording
                    ? recorder.busy
                      ? t("elder.stopping")
                      : t("elder.stopRecording")
                    : recorder.busy
                      ? t("elder.starting")
                      : pendingAudio
                        ? t("elder.recordAgain")
                        : t("elder.startRecording")
                }
                variant={recorder.isRecording ? "primary" : "secondary"}
                size="sm"
                onPress={
                  recorder.isRecording ? handleStopRecording : handleStartRecording
                }
                loading={recorder.busy}
                disabled={anyMediaBusy || loading || deleting}
                accessibilityLabel={
                  recorder.isRecording
                    ? t("elder.stopRecording")
                    : t("elder.startRecordingA11y")
                }
                accessibilityRole="button"
              />
              {storedAudioUri && !pendingAudio && (
                <AppButton
                  label={
                    removingAudio ? t("elder.removing") : t("elder.removeAudio")
                  }
                  variant="outline"
                  size="sm"
                  onPress={() => setShowRemoveAudioModal(true)}
                  loading={removingAudio}
                  disabled={anyMediaBusy || loading || deleting}
                  accessibilityLabel={t("elder.removeAudioA11y")}
                />
              )}
            </View>

            {recorder.isRecording && (
              <AppText variant="caption" color={colors.primary.main}>
                {t("elder.recordingElapsed", {
                  duration: formatDuration(recorder.elapsedSeconds),
                })}
              </AppText>
            )}

            {recorder.error && (
              <AppText variant="caption" color={colors.error.main}>
                {recorder.error}
              </AppText>
            )}
            {audioError && (
              <View style={styles.imageErrorBlock}>
                <AppText variant="caption" color={colors.error.main}>
                  {audioError}
                </AppText>
                {pendingAudio && (
                  <AppButton
                    label={t("elder.retryUpload")}
                    variant="ghost"
                    size="sm"
                    onPress={() => uploadAudio(pendingAudio)}
                    disabled={audioUploading}
                  />
                )}
              </View>
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
          // A pushed screen with no tab bar: the save row clears the home
          // indicator exactly once.
          { paddingBottom: stackBottomPadding(insets, spacing.xxl) },
        ]}
      >
        <View style={styles.buttonRow}>
          <AppButton
            label={loading ? t("elder.saving") : t("elder.saveChanges")}
            onPress={handleSave}
            fullWidth
            loading={loading}
            disabled={loading || deleting || anyMediaBusy}
          />
        </View>
        <View style={styles.deleteRow}>
          <AppButton
            label={deleting ? t("elder.deleting") : t("elder.deleteContent")}
            onPress={confirmDelete}
            variant="outline"
            fullWidth
            loading={deleting}
            disabled={loading || deleting || anyMediaBusy}
          />
        </View>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window: it clears the home indicator
                // itself rather than inheriting it from the screen.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">{t("elder.deleteContent")}</AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {t("elder.deleteConfirm")}
            </AppText>
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.cancel")}
                  onPress={() => setShowDeleteModal(false)}
                  variant="ghost"
                  fullWidth
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.delete")}
                  onPress={handleDelete}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRemoveImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveImageModal(false)}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window: it clears the home indicator
                // itself rather than inheriting it from the screen.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">{t("elder.removePhotoTitle")}</AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {t("elder.removePhotoConfirm")}
            </AppText>
            <View style={styles.modalButtons}>
              <AppButton
                label={t("elder.keepPhoto")}
                variant="ghost"
                size="sm"
                onPress={() => setShowRemoveImageModal(false)}
                disabled={removingImage}
                style={styles.modalBtn}
              />
              <AppButton
                label={
                  removingImage ? t("elder.removing") : t("common.remove")
                }
                variant="outline"
                size="sm"
                onPress={handleRemoveImage}
                loading={removingImage}
                disabled={removingImage}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showRemoveAudioModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveAudioModal(false)}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window: it clears the home indicator
                // itself rather than inheriting it from the screen.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">{t("elder.removeAudioTitle")}</AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {t("elder.removeAudioConfirm")}
            </AppText>
            <View style={styles.modalButtons}>
              <AppButton
                label={t("elder.keepRecording")}
                variant="ghost"
                size="sm"
                onPress={() => setShowRemoveAudioModal(false)}
                disabled={removingAudio}
                style={styles.modalBtn}
              />
              <AppButton
                label={
                  removingAudio ? t("elder.removing") : t("common.remove")
                }
                variant="outline"
                size="sm"
                onPress={handleRemoveAudio}
                loading={removingAudio}
                disabled={removingAudio}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  errorBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: "#FFF5F5",
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FFCDD2",
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
    gap: spacing.sm,
  },
  buttonRow: {},
  deleteRow: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    // paddingBottom is supplied inline from the insets.
    width: "80%",
    gap: spacing.md,
  },
  modalBody: {
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
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
  imageErrorBlock: {
    gap: spacing.xxs,
    alignItems: "flex-start",
  },
  audioPreview: {
    gap: spacing.sm,
  },
});
