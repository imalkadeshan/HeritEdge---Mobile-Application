import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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
} from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import {
  apiUpdateContent,
  apiDeleteContent,
} from "../../src/services/api";

const CATEGORIES = [
  { value: "Story" as const, label: "Stories" },
  { value: "Proverb" as const, label: "Proverbs" },
  { value: "Recipe" as const, label: "Recipes" },
  { value: "Tradition" as const, label: "Traditions" },
  { value: "Song" as const, label: "Songs" },
  { value: "Dialect Word" as const, label: "Dialect Words" },
];

type ContentCategory = (typeof CATEGORIES)[number]["value"];

interface EditContentForm {
  title: string;
  content: string;
  category: ContentCategory | null;
}

export default function EditContentScreen() {
  const router = useRouter();
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
    category: (initialCategory as ContentCategory) || null,
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

  useEffect(() => {
    if (initialTitle) setForm((prev) => ({ ...prev, title: initialTitle }));
    if (initialContent)
      setForm((prev) => ({ ...prev, content: initialContent }));
    if (initialCategory)
      setForm((prev) => ({
        ...prev,
        category: initialCategory as ContentCategory,
      }));
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
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.content.trim()) next.content = "Content is required";
    if (!form.category) next.category = "Please select a category";
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
          setErrorMessage(result.message);
        }
      }
    } catch {
      setErrorMessage("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
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
          setErrorMessage(result.message);
        }
      }
    } catch {
      setErrorMessage("Could not connect to the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppHeader title="Edit Content" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="subheading" style={styles.heading}>
          Edit Your Content
        </AppText>
        <AppText variant="body" color={colors.text.secondary}>
          Update your shared cultural knowledge.
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
            label="Title"
            placeholder="Enter content title"
            value={form.title}
            onChangeText={(text) => updateField("title", text)}
            error={errors.title}
          />

          <AppInput
            label="Content"
            placeholder="Write your content here..."
            value={form.content}
            onChangeText={(text) => updateField("content", text)}
            multiline
            numberOfLines={6}
            style={styles.contentInput}
            error={errors.content}
          />

          <View style={styles.section}>
            <AppText variant="label">Category *</AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              style={styles.sectionHint}
            >
              Select one category for your content
            </AppText>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <SelectionChip
                  key={cat.value}
                  label={cat.label}
                  selected={form.category === cat.value}
                  onPress={() =>
                    updateField(
                      "category",
                      form.category === cat.value ? null : cat.value
                    )
                  }
                />
              ))}
            </View>
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <AppButton
            label={loading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            fullWidth
            loading={loading}
            disabled={loading || deleting}
          />
        </View>
        <View style={styles.deleteRow}>
          <AppButton
            label={deleting ? "Deleting..." : "Delete Content"}
            onPress={confirmDelete}
            variant="outline"
            fullWidth
            loading={deleting}
            disabled={loading || deleting}
          />
        </View>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="subheading">Delete Content</AppText>
            <AppText
              variant="body"
              color={colors.text.secondary}
              style={styles.modalBody}
            >
              Are you sure you want to delete this content? This cannot be
              undone.
            </AppText>
            <View style={styles.modalButtons}>
              <View style={styles.modalBtn}>
                <AppButton
                  label="Cancel"
                  onPress={() => setShowDeleteModal(false)}
                  variant="ghost"
                  fullWidth
                />
              </View>
              <View style={styles.modalBtn}>
                <AppButton
                  label="Delete"
                  onPress={handleDelete}
                  fullWidth
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
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
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
    padding: spacing.xxl,
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
