import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  useSafeAreaInsets,
  horizontalSafePadding,
} from "../utils/safeArea";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AppText } from "./AppText";
import { AppHeader } from "./AppHeader";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";
import { AudioClipPlayer } from "./AudioClipPlayer";
import { UserAvatar } from "./UserAvatar";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useUser } from "../context/UserContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { AppLanguage, TranslationKey, translateBuiltin } from "../i18n/translations";
import { apiErrorText } from "../i18n/apiError";
import { formatDate } from "../i18n/format";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import {
  Category,
  apiGetContentById,
  apiDeleteContent,
  apiGetApprovedContributionsByContent,
  apiGetCategories,
  apiSaveContent,
  apiUnsaveContent,
  apiIsContentSaved,
  resolveImageUrl,
  resolveAudioUrl,
} from "../services/api";
import { categoryIcon } from "../utils/categoryIcon";

type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number | boolean | null | undefined>
) => string;

/**
 * Cultural item detail (HE-27).
 *
 * One screen for both roles: it always re-fetches the authoritative item by
 * id, so what an elder and a youth see is the same server data, never the
 * list's copy. Rendered by the thin routes app/elder/content-detail.tsx and
 * app/youth/content-detail.tsx - the only difference between them is the
 * route segment, which is what the AuthGuard keys off.
 *
 * Only approved contributions are requested (Sprint 3 endpoint), owner
 * actions are hidden for everyone but the owning elder, and the backend
 * stays authoritative for every write (Edit/Delete still re-check ownership).
 */
interface ContentData {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    /** Public photo path carried by the content payload - no extra request. */
    profileImage?: string | null;
  };
}

interface ApprovedContribution {
  _id: string;
  type: "translation" | "explanation" | "transcription" | "context";
  text: string;
  language: string;
  status: "approved";
  feedback: string;
  submittedBy: { _id: string; name: string };
  createdAt: string;
}

type DetailErrorKind = "notfound" | "network" | "missingid";

interface DetailError {
  kind: DetailErrorKind;
  message: string;
}

// Circular bookmark accent (orange-brown) from the reference design; the
// outline/filled pair comes from MaterialCommunityIcons, not emoji.
const BOOKMARK_TINT = "#C0562B";

function isEdited(createdAt?: string, updatedAt?: string): boolean {
  if (!createdAt || !updatedAt) return false;
  return new Date(updatedAt).getTime() > new Date(createdAt).getTime();
}

/**
 * Maps a server failure onto what the screen should say and offer.
 *
 * Classification keys off the raw stored message ("not found" keeps its own
 * body + no Retry), while the text a network failure shows goes through
 * `apiErrorText` (localized `api.<CODE>` when the backend sent one, the
 * stored English message otherwise) with this screen's fallback when the
 * payload carried nothing readable.
 */
function classifyError(
  result: { message?: string; code?: string },
  t: Translate,
  language: AppLanguage
): DetailError {
  if (/not found/i.test((result.message || "").trim())) {
    return { kind: "notfound", message: t("content.notFoundBody") };
  }

  return {
    kind: "network",
    message: apiErrorText(result, language, t) || t("content.loadFailedBody"),
  };
}

export function ContentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { currentUser } = useUser();
  const insets = useSafeAreaInsets();
  const { t, language } = useAppSettings();

  const [item, setItem] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DetailError | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approvedContributions, setApprovedContributions] = useState<
    ApprovedContribution[]
  >([]);
  const [contributionsError, setContributionsError] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);

  // Built-in labels follow the app language; admin-renamed ones pass through.
  const categoryLabel = useCategoryLabel(categories);

  // HE-33: the bookmark follows the server, never the other way round.
  // `saveBusy` blocks taps while a save/unsave is in flight; `saveError` is
  // the rollback note shown if the optimistic flip had to be undone.
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // First focus shows the loading state; a focus after Edit/Back refreshes
  // silently so the returned-to item shows the edits without a flash.
  const loadedOnceRef = useRef(false);

  const loadCategories = useCallback(async () => {
    try {
      const result = await apiGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data as Category[]);
      }
    } catch {
      // Labels stay on the stored key until they can be fetched.
    }
  }, []);

  const load = useCallback(async () => {
    if (!id) {
      setItem(null);
      setError({
        kind: "missingid",
        message: t("content.missingId"),
      });
      setLoading(false);
      loadedOnceRef.current = true;
      return;
    }

    const silent = loadedOnceRef.current;
    if (!silent) setLoading(true);
    setError(null);
    setContributionsError(null);

    // Contributions must never hide the item: if that request fails alone,
    // the detail still renders with a visible, retryable note.
    const contributionsPromise = apiGetApprovedContributionsByContent(id).catch(
      () => null
    );

    try {
      const [contentResult, contributionsResult] = await Promise.all([
        apiGetContentById(id),
        contributionsPromise,
      ]);

      if (contentResult.success && contentResult.data) {
        setItem(contentResult.data as ContentData);
      } else {
        setItem(null);

        if (/authentication|signed out/i.test(contentResult.message)) {
          router.replace("/login");
          return;
        }

        setError(classifyError(contentResult, t, language));
      }

      if (contributionsResult === null) {
        setApprovedContributions([]);
        setContributionsError(t("content.contributionsLoadFailed"));
      } else if (
        contributionsResult.success &&
        Array.isArray(contributionsResult.data)
      ) {
        // The endpoint only ever returns status "approved" contributions.
        setApprovedContributions(
          contributionsResult.data as ApprovedContribution[]
        );
      } else {
        setApprovedContributions([]);
        setContributionsError(
          apiErrorText(contributionsResult, language, t) ||
            t("content.contributionsLoadFailedShort")
        );
      }
    } catch {
      setItem(null);
      setError({ kind: "network", message: t("common.connectionError") });
    } finally {
      loadedOnceRef.current = true;
      setLoading(false);
    }
  }, [id, router, t, language]);

  // HE-33: the button must reflect what the server already holds for this
  // account (e.g. a fresh login), so the state is fetched, not remembered.
  const loadSavedState = useCallback(async () => {
    if (!id) {
      setSaved(false);
      return;
    }

    try {
      const result = await apiIsContentSaved(id);
      if (
        result.success &&
        result.data &&
        typeof result.data.saved === "boolean"
      ) {
        setSaved(result.data.saved);
      }
      // A failed probe keeps the last known state: the Save action itself
      // reports errors when it runs.
    } catch {
      // Same as above - never let this break the detail screen.
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      load();
      loadSavedState();
    }, [load, loadCategories, loadSavedState])
  );

  const toggleSave = async () => {
    if (saveBusy || !item || !id) return;

    const previous = saved;
    const next = !previous;

    setSaveBusy(true);
    setSaveError(null);
    setSaved(next);

    try {
      const result = next
        ? await apiSaveContent(id)
        : await apiUnsaveContent(id);

      if (result.success) {
        setSaved(next);
      } else {
        setSaved(previous);
        setSaveError(
          apiErrorText(result, language, t) || t("content.saveToggleFailed")
        );
      }
    } catch {
      setSaved(previous);
      setSaveError(t("common.connectionError"));
    } finally {
      setSaveBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const result = await apiDeleteContent(id);
      if (result.success) {
        router.back();
      } else {
        setError(classifyError(result, t, language));
      }
    } catch {
      setError({ kind: "network", message: t("common.connectionError") });
    } finally {
      setDeleting(false);
    }
  };

  // The creator is always an elder in practice; requiring the elder role as
  // well keeps youth from ever seeing Edit/Delete, even if a data quirk made
  // ids line up. The server re-checks ownership on every write regardless.
  const canManage =
    Boolean(currentUser?.id) &&
    Boolean(item) &&
    item?.creator?.id === currentUser?.id &&
    currentUser?.role === "elder";

  // Collaborate is a Youth-only action; elders/admins never see it (the
  // youth route itself is also role-guarded by AuthGuard).
  const isYouth = currentUser?.role === "youth";

  // Owner card: the whole card opens the creator's own profile (elder id,
  // never the content id). Elders are routed to the elder segment so they
  // never enter /youth routes; without a creator id or a known role the
  // card renders but navigation stays disabled.
  const ownerName = item?.creator?.name || t("content.unknownCreator");
  const creatorId = item?.creator?.id || null;
  const ownerProfilePath =
    currentUser?.role === "youth"
      ? "/youth/elder-profile"
      : currentUser?.role === "elder"
        ? "/elder/elder-profile"
        : null;
  const canOpenOwnerProfile = Boolean(creatorId) && Boolean(ownerProfilePath);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("content.title")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("home.loadingContent")}
          </AppText>
        </View>
      </View>
    );
  }

  if (error || !item) {
    const showRetry = error?.kind === "network" || error?.kind === "missingid";
    return (
      <View style={styles.container}>
        <AppHeader title={t("content.title")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main} align="center">
            {error?.message || t("content.itemNotFound")}
          </AppText>
          <View style={styles.errorActions}>
            {showRetry && (
              <AppButton
                label={t("content.tryAgain")}
                onPress={load}
                accessibilityLabel={t("content.retryLoadA11y")}
                accessibilityRole="button"
              />
            )}
            <AppButton
              label={t("content.goBack")}
              onPress={() => router.back()}
              variant="outline"
              accessibilityLabel={t("content.goBackA11y")}
              accessibilityRole="button"
            />
          </View>
        </View>
      </View>
    );
  }

  // Stored as a server-relative path; resolve it against the API origin.
  const imageUri = resolveImageUrl(item.imageUrl);
  const audioUri = resolveAudioUrl(item.audioUrl);
  const categoryText = categoryLabel(item.category);
  const createdText = formatDate(item.createdAt, language);
  const updatedText = isEdited(item.createdAt, item.updatedAt)
    ? formatDate(item.updatedAt, language)
    : null;
  const dateLine = [
    createdText ? t("content.sharedOn", { date: createdText }) : null,
    updatedText ? t("content.editedOn", { date: updatedText }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.container}>
      {/* No centered heading here: the category lives in the badge above the
          title, so the navigation bar only carries the Back action. */}
      <AppHeader title="" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppIcon
              name={categoryIcon(item.category)}
              size={44}
              color={colors.text.tertiary}
            />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.tag}>
            <AppText variant="caption" color={colors.primary.main}>
              {categoryText.toUpperCase()}
            </AppText>
          </View>

          <AppText variant="heading">{item.title}</AppText>

          <Pressable
            style={[
              styles.ownerCard,
              !canOpenOwnerProfile && styles.ownerCardDisabled,
            ]}
            onPress={
              ownerProfilePath && creatorId
                ? () =>
                    router.push({
                      pathname: ownerProfilePath,
                      params: { id: creatorId },
                    })
                : undefined
            }
            disabled={!canOpenOwnerProfile}
            accessibilityRole="button"
            accessibilityLabel={t("content.viewProfileA11y", {
              name: ownerName,
            })}
            accessibilityState={{ disabled: !canOpenOwnerProfile }}
          >
            <UserAvatar
              name={ownerName}
              profileImage={item?.creator?.profileImage}
              size={40}
              style={styles.ownerAvatar}
              textVariant="label"
            />
            <AppText
              variant="label"
              style={styles.ownerName}
              numberOfLines={2}
            >
              {ownerName}
            </AppText>
            <View style={styles.ownerViewBtn}>
              <AppText variant="label" color={colors.primary.main}>
                {t("content.view")}
              </AppText>
            </View>
          </Pressable>

          {dateLine ? (
            <AppText variant="caption" color={colors.text.tertiary}>
              {dateLine}
            </AppText>
          ) : null}

          <View style={styles.divider} />

          {audioUri && (
            <View style={styles.audioBlock}>
              <AppText variant="caption" color={colors.text.secondary}>
                {t("content.recording")}
              </AppText>
              <AudioClipPlayer uri={audioUri} title={t("content.recording")} />
            </View>
          )}

          <AppText variant="body" style={styles.contentText}>
            {item.content}
          </AppText>

          {/* Approved Contributions Section (Sprint 3): the endpoint filters
              by status, so nothing pending or under review is ever listed. */}
          {approvedContributions.length > 0 && (
            <View style={styles.contributionsSection}>
              <View style={styles.contributionsDivider} />
              <AppText variant="subheading">
                {t("content.communityContributions")}
              </AppText>
              {approvedContributions.map((contrib) => (
                <AppCard key={contrib._id} style={styles.contributionCard}>
                  <View style={styles.contributionHeader}>
                    <View style={styles.contributionTypeBadge}>
                      <AppText variant="caption" color={colors.primary.contrast}>
                        {translateBuiltin(
                          language,
                          "content.contribType",
                          contrib.type
                        )}
                      </AppText>
                    </View>
                    {contrib.language ? (
                      <AppText variant="caption" color={colors.text.tertiary}>
                        {contrib.language}
                      </AppText>
                    ) : null}
                  </View>
                  <AppText variant="body" color={colors.text.primary}>
                    {contrib.text}
                  </AppText>
                  <AppText variant="caption" color={colors.text.secondary}>
                    {t("content.byContributor", {
                      name: contrib.submittedBy?.name || t("profile.roleYouth"),
                    })}
                  </AppText>
                </AppCard>
              ))}
            </View>
          )}

          {contributionsError && approvedContributions.length === 0 && (
            <View style={styles.contributionsError}>
              <AppText variant="caption" color={colors.error.main}>
                {contributionsError}
              </AppText>
              <AppButton
                label={t("common.retry")}
                variant="ghost"
                size="sm"
                onPress={load}
                accessibilityLabel={t("content.retryContribA11y")}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {item && (
        <View
          style={[
            styles.footer,
            { paddingBottom: spacing.xxl + insets.bottom },
          ]}
        >
          {/* Youth row: primary Collaborate (fills the row) plus the circular
              bookmark control; elders get the same bookmark without the
              youth-only Collaborate. The footer sits in normal layout flow
              below the ScrollView, so it never covers the content. */}
          <View style={styles.actionRow}>
            {isYouth && (
              <AppButton
                label={t("nav.collaborate")}
                onPress={() =>
                  router.push({
                    pathname: "/youth/collaboration-request",
                    params: {
                      contentId: item._id,
                      contentTitle: item.title,
                      elderId: item.creator?.id || "",
                      elderName: item.creator?.name || t("content.unknown"),
                    },
                  })
                }
                style={styles.collaborateBtn}
                disabled={!item.creator?.id}
                accessibilityLabel={t("content.collabRequestA11y", {
                  title: item.title,
                })}
                accessibilityRole="button"
              />
            )}
            <TouchableOpacity
              style={[styles.bookmarkBtn, saveBusy && styles.bookmarkBusy]}
              onPress={toggleSave}
              disabled={saveBusy}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                saved ? t("content.unsaveA11y") : t("content.saveA11y")
              }
              accessibilityState={{
                selected: saved,
                disabled: saveBusy,
                busy: saveBusy,
              }}
            >
              <MaterialCommunityIcons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={BOOKMARK_TINT}
              />
            </TouchableOpacity>
          </View>
          {saveError && (
            <AppText
              variant="caption"
              color={colors.error.main}
              accessibilityRole="alert"
            >
              {saveError}
            </AppText>
          )}
          {canManage && (
            <>
              <AppButton
                label={t("content.editContent")}
                onPress={() =>
                  router.push({
                    pathname: "/elder/edit-content",
                    params: {
                      id: item._id,
                      title: item.title,
                      content: item.content,
                      category: item.category,
                    },
                  })
                }
                fullWidth
                accessibilityLabel={t("content.editContentA11y")}
                accessibilityRole="button"
              />
              <View style={styles.deleteSpacer}>
                <AppButton
                  label={
                    deleting ? t("content.deleting") : t("content.deleteContent")
                  }
                  onPress={() => setShowDeleteModal(true)}
                  variant="outline"
                  fullWidth
                  disabled={deleting}
                  accessibilityLabel={t("content.deleteContentA11y")}
                  accessibilityRole="button"
                />
              </View>
            </>
          )}
        </View>
      )}

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
            <AppText variant="subheading">{t("content.deleteContent")}</AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {t("content.deleteConfirmBody")}
            </AppText>
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.cancel")}
                  onPress={() => setShowDeleteModal(false)}
                  variant="ghost"
                  fullWidth
                  accessibilityLabel={t("content.deleteCancelA11y")}
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.delete")}
                  onPress={handleDelete}
                  fullWidth
                  accessibilityLabel={t("content.deleteConfirmA11y")}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  errorActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
    alignSelf: "stretch",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxxl,
  },
  image: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: colors.background.warm,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.xxl,
    gap: spacing.md,
  },
  tag: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    alignSelf: "flex-start",
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warm.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  ownerCardDisabled: {
    opacity: 0.6,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ownerViewBtn: {
    backgroundColor: "#FDEEE3",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginVertical: spacing.sm,
  },
  contentText: {
    lineHeight: 24,
  },
  audioBlock: {
    gap: spacing.xs,
  },
  contributionsSection: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  contributionsDivider: {
    height: 1,
    backgroundColor: colors.surface.border,
  },
  contributionsError: {
    gap: spacing.xxs,
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  contributionCard: {
    gap: spacing.sm,
  },
  contributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contributionTypeBadge: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    // Bottom safe-area padding is added inline (spacing.xxl + insets.bottom)
    // so the home-indicator inset is applied exactly once.
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  collaborateBtn: {
    flex: 1,
  },
  bookmarkBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.surface.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkBusy: {
    opacity: 0.6,
  },
  deleteSpacer: {},
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
});
