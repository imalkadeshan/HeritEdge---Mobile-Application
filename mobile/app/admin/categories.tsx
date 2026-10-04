import { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AppText,
  AppHeader,
  AppInput,
  AppButton,
  AppCard,
  AppIcon,
} from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { categoryIcon } from "../../src/utils/categoryIcon";
import { useAppSettings } from "../../src/context/AppSettingsContext";
import { apiErrorText } from "../../src/i18n/apiError";
import {
  useSafeAreaInsets,
  horizontalSafePadding,
  stackBottomPadding,
} from "../../src/utils/safeArea";
import {
  Category,
  apiAdminGetCategories,
  apiAdminCreateCategory,
  apiAdminUpdateCategoryLabel,
  apiAdminSetCategoryStatus,
  apiAdminDeleteCategory,
} from "../../src/services/api";

type StatusTone = "success" | "error" | null;

/**
 * Category management (HE-36).
 *
 * Add, rename and activate/deactivate work as before. Delete removes a
 * custom category for good, which the server only allows when no cultural
 * content references its key, so the confirmation names the category and the
 * refusal (409) is shown in place, with the list untouched.
 */
export default function AdminCategoriesScreen() {
  const router = useRouter();
  const { t, language } = useAppSettings();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const flash = (message: string, tone: Exclude<StatusTone, null>) => {
    setStatus(message);
    setStatusTone(tone);
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await apiAdminGetCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        setLoadError(apiErrorText(result, language) || t("home.errorCategories"));
      }
    } catch {
      setLoadError(t("common.connectionError"));
    } finally {
      setLoading(false);
    }
  }, [t, language]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    const key = newKey.trim();
    const label = newLabel.trim() || key;

    if (!key) {
      setAddError(t("admin.keyRequired"));
      return;
    }

    setAddError(null);
    setBusy("new");
    try {
      const result = await apiAdminCreateCategory(key, label);
      if (result.success) {
        setNewKey("");
        setNewLabel("");
        flash(
          apiErrorText(result, language) || t("admin.categoryCreated"),
          "success"
        );
        await loadCategories();
      } else {
        setAddError(apiErrorText(result, language));
      }
    } catch {
      setAddError(t("common.connectionError"));
    } finally {
      setBusy(null);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    setEditLabel(category.label);
    setEditError(null);
    setStatus(null);
    setStatusTone(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditError(null);
  };

  const handleSaveLabel = async () => {
    if (!editingId) return;

    const label = editLabel.trim();
    if (!label) {
      setEditError(t("admin.labelRequired"));
      return;
    }

    setEditError(null);
    setBusy(editingId);
    try {
      const result = await apiAdminUpdateCategoryLabel(editingId, label);
      if (result.success) {
        flash(
          apiErrorText(result, language) || t("admin.labelUpdated"),
          "success"
        );
        cancelEdit();
        await loadCategories();
      } else {
        setEditError(apiErrorText(result, language));
      }
    } catch {
      setEditError(t("common.connectionError"));
    } finally {
      setBusy(null);
    }
  };

  const applyStatus = async (category: Category, active: boolean) => {
    setBusy(category._id);
    try {
      const result = await apiAdminSetCategoryStatus(category._id, active);
      if (result.success) {
        flash(
          apiErrorText(result, language) || t("admin.categoryUpdated"),
          "success"
        );
        await loadCategories();
      } else {
        flash(apiErrorText(result, language), "error");
      }
    } catch {
      flash(t("common.connectionError"), "error");
    } finally {
      setBusy(null);
    }
  };

  // react-native-web ships an empty Alert.alert(), so the confirmation is a
  // real Modal instead - it works on web and on device alike.
  const confirmStatusChange = (category: Category) => {
    setConfirmTarget(category);
  };

  const cancelStatusChange = () => {
    setConfirmTarget(null);
  };

  const runConfirmedStatusChange = async () => {
    const target = confirmTarget;
    if (!target) return;

    setConfirmTarget(null);
    await applyStatus(target, !target.active);
  };

  // ---- Delete ----

  const askDelete = (category: Category) => {
    setDeleteError(null);
    setStatus(null);
    setStatusTone(null);
    setDeleteTarget(category);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const runDelete = async () => {
    const target = deleteTarget;
    if (!target || deleting) return; // one submission at a time

    setDeleting(true);
    setDeleteError(null);

    try {
      const result = await apiAdminDeleteCategory(target._id);

      if (result.success) {
        // The row only disappears once the server confirmed it, and the list
        // is re-read rather than patched locally.
        setDeleteTarget(null);
        flash(
          apiErrorText(result, language) || t("admin.categoryDeleted"),
          "success"
        );
        await loadCategories();
        return;
      }

      if (/authentication|signed out/i.test(result.message)) {
        setDeleteTarget(null);
        router.replace("/login");
        return;
      }

      // Refused (still in use, or a built-in default): keep the confirmation
      // open with the reason and leave every category in place.
      setDeleteError(
        apiErrorText(result, language) || t("admin.deleteCategoryFailed")
      );
    } catch {
      setDeleteError(t("common.connectionError"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.categoriesTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("home.loadingCategories")}
          </AppText>
        </View>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.categoriesTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>
            {loadError}
          </AppText>
          <View style={styles.retryButton}>
            <AppButton
              label={t("common.retry")}
              onPress={loadCategories}
              variant="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppHeader title={t("admin.categoriesTitle")} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          // A pushed screen with no tab bar: the add form and the last
          // category card clear the home indicator exactly once.
          { paddingBottom: stackBottomPadding(insets, spacing.xxxxl) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="heading">{t("admin.contentCategories")}</AppText>
        <AppText variant="body" color={colors.text.secondary}>
          {t("admin.categoriesIntro")}
        </AppText>

        {status && (
          <View
            style={[
              styles.banner,
              statusTone === "success" ? styles.bannerSuccess : styles.bannerError,
            ]}
          >
            <AppText
              variant="bodySmall"
              color={statusTone === "success" ? colors.success.main : colors.error.main}
            >
              {status}
            </AppText>
          </View>
        )}

        <AppCard style={styles.card}>
          <AppText variant="subheading">{t("admin.addCategory")}</AppText>
          <AppInput
            label={t("admin.keyField")}
            placeholder={t("admin.keyPlaceholder")}
            value={newKey}
            onChangeText={(text) => {
              setNewKey(text);
              if (addError) setAddError(null);
            }}
            autoCapitalize="none"
          />
          <AppInput
            label={t("admin.labelField")}
            placeholder={t("admin.labelPlaceholder")}
            value={newLabel}
            onChangeText={(text) => {
              setNewLabel(text);
              if (addError) setAddError(null);
            }}
          />
          {addError && (
            <AppText variant="caption" color={colors.error.main}>
              {addError}
            </AppText>
          )}
          <AppButton
            label={busy === "new" ? t("admin.adding") : t("admin.addCategoryBtn")}
            onPress={handleCreate}
            loading={busy === "new"}
            disabled={busy !== null}
            fullWidth
          />
        </AppCard>

        <AppText variant="subheading">
          {t("admin.allCategories", { count: categories.length })}
        </AppText>

        {categories.length === 0 && (
          <AppText variant="body" color={colors.text.secondary}>
            {t("admin.emptyCategories")}
          </AppText>
        )}

        {categories.map((category) => {
          const isEditing = editingId === category._id;
          const isBusy = busy === category._id;

          return (
            <AppCard key={category._id} style={styles.card}>
              <View style={styles.rowHeader}>
                <View style={styles.rowTitleWrap}>
                  <AppIcon
                    name={categoryIcon(category.key)}
                    size={20}
                    color={colors.text.primary}
                  />
                  <AppText variant="subheading" style={styles.rowTitle}>
                    {category.label}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.badge,
                    category.active ? styles.badgeActive : styles.badgeInactive,
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={category.active ? colors.success.main : colors.text.secondary}
                  >
                    {category.active ? t("admin.active") : t("admin.inactive")}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption" color={colors.text.secondary}>
                {t("admin.keyStoredOnContent", { key: category.key })}
              </AppText>

              {isEditing ? (
                <View style={styles.editBlock}>
                  <AppInput
                    label={t("admin.labelField")}
                    value={editLabel}
                    onChangeText={(text) => {
                      setEditLabel(text);
                      if (editError) setEditError(null);
                    }}
                    error={editError ?? undefined}
                  />
                  <View style={styles.rowActions}>
                    <AppButton
                      label={isBusy ? t("admin.saving") : t("common.save")}
                      onPress={handleSaveLabel}
                      size="sm"
                      loading={isBusy}
                      disabled={busy !== null}
                    />
                    <AppButton
                      label={t("common.cancel")}
                      variant="outline"
                      size="sm"
                      onPress={cancelEdit}
                      disabled={busy !== null}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.rowActions}>
                  <AppButton
                    label={t("admin.editLabel")}
                    variant="secondary"
                    size="sm"
                    onPress={() => startEdit(category)}
                    disabled={busy !== null}
                  />
                  <AppButton
                    label={
                      category.active ? t("admin.deactivate") : t("admin.reactivate")
                    }
                    variant="outline"
                    size="sm"
                    onPress={() => confirmStatusChange(category)}
                    loading={isBusy}
                    disabled={busy !== null}
                  />
                  <AppButton
                    label={deleting && deleteTarget?._id === category._id
                      ? t("admin.deleting")
                      : t("common.delete")}
                    variant="outline"
                    size="sm"
                    onPress={() => askDelete(category)}
                    disabled={busy !== null || deleting}
                    accessibilityLabel={t("admin.deleteCategoryA11y", {
                      label: category.label,
                    })}
                    accessibilityRole="button"
                  />
                </View>
              )}
            </AppCard>
          );
        })}
      </ScrollView>

      <Modal
        visible={confirmTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelStatusChange}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window, so it clears the home indicator
                // itself instead of inheriting it from the screen behind.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">
              {confirmTarget?.active
                ? t("admin.deactivateTitle")
                : t("admin.reactivateTitle")}
            </AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {confirmTarget?.active
                ? t("admin.deactivateBody", { label: confirmTarget.label })
                : t("admin.reactivateBody", {
                    label: confirmTarget?.label ?? "",
                  })}
            </AppText>
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label={t("common.cancel")}
                  onPress={cancelStatusChange}
                  variant="ghost"
                  fullWidth
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={
                    confirmTarget?.active
                      ? t("admin.deactivate")
                      : t("admin.reactivate")
                  }
                  onPress={runConfirmedStatusChange}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation - names the category and spells out that the
          removal is permanent. Stays open when the server refuses. */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={[styles.modalOverlay, horizontalSafePadding(insets, spacing.lg)]}>
          <View
              style={[
                styles.modalContent,
                // A Modal is its own window, so it clears the home indicator
                // itself instead of inheriting it from the screen behind.
                { paddingBottom: insets.bottom + spacing.xxl },
              ]}
            >
            <AppText variant="subheading">
              {deleteTarget
                ? t("admin.deleteCategoryTitle", { label: deleteTarget.label })
                : ""}
            </AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              {deleteTarget
                ? t("admin.deleteCategoryBody", { label: deleteTarget.label })
                : ""}
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
                  onPress={cancelDelete}
                  variant="ghost"
                  fullWidth
                  disabled={deleting}
                  accessibilityLabel={t("admin.cancelDeleteCategoryA11y")}
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label={deleting ? t("admin.deleting") : t("common.delete")}
                  onPress={runDelete}
                  fullWidth
                  loading={deleting}
                  disabled={deleting}
                  accessibilityLabel={t("admin.confirmDeleteCategoryA11y", {
                    label: deleteTarget?.label ?? "",
                  })}
                  accessibilityRole="button"
                />
              </View>
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
    paddingTop: spacing.lg,
    // paddingBottom is supplied inline from the insets.
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  retryButton: {
    minWidth: 160,
  },
  card: {
    gap: spacing.md,
  },
  banner: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  bannerSuccess: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  bannerError: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFCDD2",
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 1,
  },
  rowTitle: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  badgeInactive: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.surface.border,
  },
  editBlock: {
    gap: spacing.sm,
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
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
