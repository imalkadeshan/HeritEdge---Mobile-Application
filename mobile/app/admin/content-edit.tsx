import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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
} from "../../src/components";
import { useSafeAreaInsets, stackBottomPadding } from "../../src/utils/safeArea";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { useAppSettings } from "../../src/context/AppSettingsContext";
import { useCategoryLabel } from "../../src/hooks/useCategoryLabel";
import { apiErrorText } from "../../src/i18n/apiError";
import {
  Category,
  apiAdminGetCategories,
  apiAdminGetContentDetail,
  apiAdminUpdateContent,
} from "../../src/services/api";

/**
 * Cultural content edit (HE-35) - an admin correcting the text of one Elder's
 * item.
 *
 * The server accepts exactly three fields (title, content, category) and
 * ignores everything else, so this form has no photo/recording controls at
 * all and never offers a way to re-attribute the item: createdBy and media
 * stay with their creator. Category choices come from the admin category
 * endpoint, so a deactivated category still appears (labelled) if the item
 * already sits on it - the server allows keeping but not choosing one.
 *
 * The item is fetched by id (never passed as route params) so what is edited
 * is always the server's current copy.
 */
interface EditForm {
  title: string;
  content: string;
  category: string | null;
}

interface CategoryChoice {
  key: string;
  label: string;
  inactive: boolean;
}

export default function AdminContentEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { t, language } = useAppSettings();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);

  const [form, setForm] = useState<EditForm>({
    title: "",
    content: "",
    category: null,
  });
  // The server copy, used to detect which of the three whitelisted fields
  // actually changed (the server 400s an empty update).
  const [original, setOriginal] = useState<EditForm>({
    title: "",
    content: "",
    category: null,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
  }>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Language-aware label for every category key offered below.
  const categoryLabel = useCategoryLabel(categories);

  const loadItem = useCallback(async () => {
    if (!id) {
      setLoadError(t("admin.missingItemId"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const result = await apiAdminGetContentDetail(id);

      if (result.success && result.data) {
        const item = result.data.item;
        const next: EditForm = {
          title: item.title,
          content: item.content,
          category: item.category,
        };
        setForm(next);
        setOriginal(next);
        setCreatorName(item.creator.name);
      } else if (/authentication|signed out/i.test(result.message)) {
        router.replace("/login");
        return;
      } else {
        setLoadError(apiErrorText(result, language) || t("admin.loadItemError"));
      }
    } catch {
      setLoadError(t("common.connectionError"));
    } finally {
      setLoading(false);
    }
  }, [id, router, t, language]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const result = await apiAdminGetCategories();
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

  /**
   * Every category, including deactivated ones: the server lets an admin
   * keep an item on a deactivated category or move it to an active one.
   * Chips show the language-aware label; custom/admin-renamed labels pass
   * through untouched.
   */
  const choices: CategoryChoice[] = useMemo(() => {
    const list: CategoryChoice[] = categories.map((cat) => {
      const label = categoryLabel(cat.key);
      return {
        key: cat.key,
        label: cat.active ? label : t("admin.inactiveTag", { label }),
        inactive: !cat.active,
      };
    });

    if (
      original.category &&
      !list.some(
        (choice) => choice.key.toLowerCase() === original.category!.toLowerCase()
      )
    ) {
      list.push({
        key: original.category,
        label: t("admin.inactiveTag", {
          label: categoryLabel(original.category),
        }),
        inactive: true,
      });
    }

    return list;
  }, [categories, original.category, categoryLabel, t]);

  const currentCategory = form.category;
  const selectedChoice = currentCategory
    ? choices.find(
        (choice) => choice.key.toLowerCase() === currentCategory.toLowerCase()
      )
    : undefined;

  const changedFields = useMemo(() => {
    const payload: { title?: string; content?: string; category?: string } = {};
    const trimmedTitle = form.title.trim();
    const trimmedContent = form.content.trim();

    if (trimmedTitle !== original.title) payload.title = trimmedTitle;
    if (trimmedContent !== original.content) payload.content = trimmedContent;
    if (form.category && form.category !== original.category) {
      payload.category = form.category;
    }

    return payload;
  }, [form, original]);

  const hasChanges = Object.keys(changedFields).length > 0;

  const updateField = <K extends keyof EditForm>(
    field: K,
    value: EditForm[K]
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
    if (!form.title.trim()) next.title = t("admin.titleRequired");
    if (!form.content.trim()) next.content = t("admin.contentRequired");
    if (!form.category) next.category = t("admin.selectCategoryError");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !id || saving) return;

    // The server rejects an empty update; with no edits there is nothing to
    // send, so stay put rather than showing its "Nothing to update" error.
    if (!hasChanges) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const result = await apiAdminUpdateContent(id, changedFields);

      if (result.success) {
        router.back();
      } else if (/authentication|signed out/i.test(result.message)) {
        router.replace("/login");
      } else {
        setErrorMessage(apiErrorText(result, language));
      }
    } catch {
      setErrorMessage(t("common.connectionError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.editItemTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            {t("admin.loadingItem")}
          </AppText>
        </View>
      </View>
    );
  }

  if (loadError || !id) {
    return (
      <View style={styles.container}>
        <AppHeader title={t("admin.editItemTitle")} onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main} align="center">
            {loadError || t("admin.missingItemIdShort")}
          </AppText>
          <View style={styles.errorActions}>
            <AppButton
              label={t("common.retry")}
              onPress={loadItem}
              accessibilityLabel={t("admin.retryItemA11y")}
            />
            <AppButton
              label={t("common.back")}
              onPress={() => router.back()}
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
      <AppHeader title={t("admin.editItemTitle")} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="subheading" style={styles.heading}>
          {t("admin.editContentHeading")}
        </AppText>
        <AppText variant="body" color={colors.text.secondary}>
          {creatorName
            ? t("admin.editAttributionNamed", { name: creatorName })
            : t("admin.editAttributionGeneric")}
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
            label={t("admin.titleLabel")}
            placeholder={t("admin.titlePlaceholder")}
            value={form.title}
            onChangeText={(text) => updateField("title", text)}
            error={errors.title}
          />

          <AppInput
            label={t("admin.contentLabel")}
            placeholder={t("admin.contentPlaceholder")}
            value={form.content}
            onChangeText={(text) => updateField("content", text)}
            multiline
            numberOfLines={6}
            style={styles.contentInput}
            error={errors.content}
          />

          <View style={styles.section}>
            <AppText variant="label">{t("admin.categoryField")}</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              {t("admin.selectCategoryHint")}
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
                          currentCategory.toLowerCase() ===
                            choice.key.toLowerCase()
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
                {t("admin.selectedInactive", { label: selectedChoice.label })}
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
            <AppText variant="label">{t("admin.mediaLabel")}</AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t("admin.mediaBody")}
            </AppText>
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
        <AppButton
          label={
            saving
              ? t("admin.saving")
              : hasChanges
                ? t("admin.saveChanges")
                : t("admin.noChanges")
          }
          onPress={handleSave}
          fullWidth
          loading={saving}
          disabled={saving || !hasChanges}
          accessibilityLabel={
            hasChanges ? t("admin.saveChangesA11y") : t("admin.noChangesA11y")
          }
          accessibilityRole="button"
        />
        <AppButton
          label={t("common.cancel")}
          onPress={() => router.back()}
          variant="ghost"
          fullWidth
          disabled={saving}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  errorActions: {
    gap: spacing.sm,
    alignSelf: "stretch",
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
});
