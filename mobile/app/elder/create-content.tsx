import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
} from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { apiCreateContent } from "../../src/services/api";

const CATEGORIES = [
  { value: "Story" as const, label: "Stories" },
  { value: "Proverb" as const, label: "Proverbs" },
  { value: "Recipe" as const, label: "Recipes" },
  { value: "Tradition" as const, label: "Traditions" },
  { value: "Song" as const, label: "Songs" },
  { value: "Dialect Word" as const, label: "Dialect Words" },
];

export type ContentCategory = (typeof CATEGORIES)[number]["value"];

interface CreateContentForm {
  title: string;
  content: string;
  category: ContentCategory | null;
}

export default function CreateContentScreen() {
  const router = useRouter();
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
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.content.trim()) next.content = "Content is required";
    if (!form.category) next.category = "Please select a category";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!form.category) return;

    setLoading(true);
    try {
      const result = await apiCreateContent({
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
          Alert.alert("Error", result.message);
        }
      }
    } catch {
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppHeader title="Create Content" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="subheading" style={styles.heading}>
          Share Your Knowledge
        </AppText>
        <AppText variant="body" color={colors.text.secondary}>
          Contribute to the community by sharing cultural knowledge.
        </AppText>

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
        <AppButton
          label={loading ? "Sharing..." : "Share Knowledge"}
          onPress={handleSubmit}
          fullWidth
          loading={loading}
          disabled={loading}
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
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
