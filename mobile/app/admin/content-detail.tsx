import { useCallback, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Modal } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  AppText,
  AppHeader,
  AppButton,
  AppCard,
  AppIcon,
  AudioClipPlayer,
  UserAvatar,
} from "../../src/components";
import { useSafeAreaInsets, horizontalSafePadding, stackBottomPadding } from "../../src/utils/safeArea";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { useAppSettings } from "../../src/context/AppSettingsContext";
import { apiErrorText } from "../../src/i18n/apiError";
import { formatDateTime } from "../../src/i18n/format";
import { translateBuiltin } from "../../src/i18n/translations";
import {
  AdminContentDetail,
  apiAdminGetContentDetail,
  apiAdminDeleteContent,
  resolveImageUrl,
  resolveAudioUrl,
} from "../../src/services/api";
import { categoryIcon } from "../../src/utils/categoryIcon";

/**
 * Cultural content detail (HE-35) - the admin's full view of one Elder's item.
 *
 * Reached from /admin/content by tapping a row. Shows everything the admin
 * GET returns (creator, media, category, counters, approved contributions)
 * and owns the one management action left here: Delete, with a confirmation
 * that names the item and spells out what the server removes with it.
 *
 * Read-only by design: editing cultural content is the Elder's own action, so
 * the admin screen no longer offers an edit entry point. The admin update
 * endpoint (PUT /api/admin/content/:id) and /admin/content-edit route stay in
 * place for compatibility - only the UI entry point is gone.
 */
type DetailError = { kind: "notfound" | "network" | "missingid"; message: string };

/** The raw server message decides *which* error this is; the UI text is localized. */
function classifyError(message?: string): "notfound" | "network" {
  const text = (message || "").trim();
  if (/not found/i.test(text)) return "notfound";
  return "network";
}

export default function AdminContentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { t, language } = useAppSettings();
  const insets = useSafeAreaInsets();

  const [detail, setDetail] = useState<AdminContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DetailError | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // First focus shows the loading state; later focuses (after Edit/Back)
  // refresh silently so the returned-to item shows its edits without a flash.
  const loadedOnceRef = useRef(false);

  const load = useCallback(async () => {
    if (!id) {
      setDetail(null);
      setError({
        kind: "missingid",
        message: t("admin.missingItemId"),
      });
      setLoading(false);
      loadedOnceRef.current = true;
      return;
    }

    const silent = loadedOnceRef.current;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const result = await apiAdminGetContentDetail(id);

      if (result.success && result.data) {
        setDetail(result.data);
      } else {
        setDetail(null);

        if (/authentication|signed out/i.test(result.message)) {
          router.replace("/login");
          return;
        }

        const kind = classifyError(result.message);
        setError({
          kind,
          message:
            kind === "notfound"
              ? t("admin.itemNotFound")
              : apiErrorText(result, language) || t("admin.loadItemFailed"),
        });
      }
    } catch {
      setDetail(null);
      setError({ kind: "network", message: t("common.connectionError") });
    } finally {
      loadedOnceRef.current = true;
      setLoading(false);
    }
  }, [id, router, t, language]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = async () => {
    if (!id || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const result = await apiAdminDeleteContent(id);

      if (result.success) {
        setShowDeleteModal(false);
        // Back to the list, which reloads page 1 on focus - the deleted
        // item disappears immediately.
        router.back();
        return;
      }

      // The item is still there: keep the modal open and explain why.
      if (/authentication|signed out/i.test(result.message)) {
        setShowDeleteModal(false);
        router.replace("/login");
        return;
      }

      setDeleteError(
        apiErrorText(result, language) || t("admin.deleteItemFailed")
      );
    } catch {
      setDeleteError(t("common.connectionError"));
    } finally {
      setDeleting(false);
    }
  };

  /** Stored role value -> localized badge text; unknown/absent -> an em dash. */
  const roleLabel = (role: string | null | undefined) => {
    if (role === "elder") return t("admin.roleElder");
    if (role === "youth") return t("admin.roleYouth");
    if (role === "admin") return t("admin.roleAdmin");
    return role || "—";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.itemTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("admin.loadingItem")}
          </AppText>
        </View>
      </View>
    );
  }

  if (error || !detail) {
    const showRetry =
      error?.kind === "network" || error?.kind === "missingid";
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.itemTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main} align="center">
            {error?.message || t("admin.itemNotFoundShort")}
          </AppText>
          <View style={styles.errorActions}>
            {showRetry && (
              <AppButton
                label={t("common.retry")}
                onPress={load}
                accessibilityLabel={t("admin.retryItemA11y")}
                accessibilityRole="button"
              />
            )}
            <AppButton
              label={t("common.back")}
              onPress={() => router.back()}
              variant="outline"
              accessibilityLabel={t("admin.goBackListA11y")}
              accessibilityRole="button"
            />
          </View>
        </View>
      </View>
    );
  }

  const { item, stats, approvedContributions } = detail;
  const imageUri = resolveImageUrl(item.imageUrl);
  const audioUri = resolveAudioUrl(item.audioUrl);
  const createdText = item.createdAt
    ? formatDateTime(item.createdAt, language)
    : "";
  const updatedText = item.updatedAt
    ? formatDateTime(item.updatedAt, language)
    : "";
  // The API ships the stored category key plus its current label; only an
  // untouched built-in default is translated, custom labels pass through.
  const categoryText =
    translateBuiltin(language, "category", item.categoryLabel || item.category) ||
    t("admin.itemTitle");

  return (
    <View style={styles.container}>
      <AppHeader title={categoryText} onBack={() => router.back()} />

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

          <View style={styles.creatorCard}>
            <UserAvatar
              name={item.creator.name}
              profileImage={item.creator.profileImage}
              size={36}
              style={styles.creatorAvatar}
              textVariant="caption"
            />
            <View style={styles.creatorText}>
              <AppText variant="label">{item.creator.name}</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                {item.creator.email || t("admin.noEmail")}
              </AppText>
            </View>
            <View style={styles.roleBadge}>
              <AppText variant="caption" color={colors.text.secondary}>
                {roleLabel(item.creator.role)}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color={colors.text.tertiary}>
            {[
              createdText ? t("admin.createdOn", { date: createdText }) : null,
              updatedText ? t("admin.updatedOn", { date: updatedText }) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </AppText>

          {/* Read-only overview of what is linked to this item - the same
              counters the delete cleans up. */}
          <View style={styles.statsRow}>
            <AppCard style={styles.statCard}>
              <AppText variant="subheading" align="center">
                {stats.savedCount}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary} align="center">
                {t("admin.savedBy")}
              </AppText>
            </AppCard>
            <AppCard style={styles.statCard}>
              <AppText variant="subheading" align="center">
                {stats.collaborationRequestCount}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary} align="center">
                {t("admin.collabRequests")}
              </AppText>
            </AppCard>
            <AppCard style={styles.statCard}>
              <AppText variant="subheading" align="center">
                {stats.contributionCount}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary} align="center">
                {t("admin.contributions")}
              </AppText>
            </AppCard>
            <AppCard style={styles.statCard}>
              <AppText variant="subheading" align="center">
                {stats.approvedContributionCount}
              </AppText>
              <AppText variant="caption" color={colors.text.secondary} align="center">
                {t("admin.approved")}
              </AppText>
            </AppCard>
          </View>

          <View style={styles.divider} />

          {audioUri && (
            <View style={styles.audioBlock}>
              <AppText variant="caption" color={colors.text.secondary}>
                {t("admin.recording")}
              </AppText>
              <AudioClipPlayer uri={audioUri} title={t("admin.recording")} />
            </View>
          )}

          <AppText variant="body" style={styles.contentText}>
            {item.content}
          </AppText>

          {approvedContributions.length > 0 && (
            <View style={styles.contributionsSection}>
              <View style={styles.contributionsDivider} />
              <AppText variant="subheading">
                {t("admin.approvedContributions")}
              </AppText>
              {approvedContributions.map((contrib) => (
                <AppCard key={contrib.id} style={styles.contributionCard}>
                  <View style={styles.contributionHeader}>
                    <View style={styles.contributionTypeBadge}>
                      <AppText variant="caption" color={colors.primary.contrast}>
                        {translateBuiltin(language, "contribType", contrib.type)}
                      </AppText>
                    </View>
                    {contrib.language ? (
                      <AppText variant="caption" color={colors.text.tertiary}>
                        {contrib.language}
                      </AppText>
                    ) : null}
                  </View>
                  <AppText variant="body">{contrib.text}</AppText>
                  <AppText variant="caption" color={colors.text.secondary}>
                    {t("admin.by", { name: contrib.submittedBy.name })}
                    {contrib.createdAt
                      ? ` · ${formatDateTime(contrib.createdAt, language)}`
                      : ""}
                  </AppText>
                </AppCard>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          // A pushed screen with no tab bar: the Delete button clears the
          // home indicator exactly once.
          { paddingBottom: stackBottomPadding(insets, spacing.xxl) },
        ]}
      >
        <AppButton
          label={deleting ? t("admin.deleting") : t("admin.deleteItemAction")}
          onPress={() => {
            setDeleteError(null);
            setShowDeleteModal(true);
          }}
          variant="outline"
          fullWidth
          disabled={deleting}
          accessibilityLabel={t("admin.deleteItemA11y", { title: item.title })}
          accessibilityRole="button"
        />
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
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
            <AppText variant="subheading">
              {t("admin.deleteConfirmTitle", { title: item.title })}
            </AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {t("admin.deleteConfirmBody")}
            </AppText>
            {deleteError && (
              <AppText
                variant="caption"
                color={colors.error.main}
                accessibilityRole="alert"
              >
                {deleteError}
              </AppText>
            )}
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.cancel")}
                  onPress={() => setShowDeleteModal(false)}
                  variant="ghost"
                  fullWidth
                  disabled={deleting}
                  accessibilityLabel={t("admin.cancelDeleteA11y")}
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={deleting ? t("admin.deleting") : t("common.delete")}
                  onPress={handleDelete}
                  fullWidth
                  disabled={deleting}
                  accessibilityLabel={t("admin.confirmDeleteA11y", {
                    title: item.title,
                  })}
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
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorText: {
    flex: 1,
    gap: 2,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "22%",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 2,
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
    // paddingBottom is supplied inline from the insets.
    gap: spacing.sm,
  },
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
    width: "85%",
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
