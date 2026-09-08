import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AppText, AppHeader, AppButton } from "../../src/components";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { borderRadius } from "../../src/theme/layout";
import { useUser } from "../../src/context/UserContext";
import {
  apiGetContentById,
  apiDeleteContent,
} from "../../src/services/api";

const CATEGORY_ICONS: Record<string, string> = {
  Story: "📖",
  Proverb: "💬",
  Recipe: "🍽️",
  Tradition: "🏛️",
  Song: "🎵",
  "Dialect Word": "📝",
};

interface ContentData {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
}

export default function ContentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useUser();

  const [item, setItem] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = currentUser?.id && item?.creator?.id === currentUser.id;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGetContentById(id);
        if (!cancelled) {
          if (result.success && result.data) {
            setItem(result.data as ContentData);
          } else {
            setError(result.message || "Content not found");
          }
        }
      } catch {
        if (!cancelled) setError("Could not connect to the server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const result = await apiDeleteContent(id);
      if (result.success) {
        router.back();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Could not connect to the server");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Content" onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.text.secondary}>
            Loading content...
          </AppText>
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.container}>
        <AppHeader title="Content" onBack={() => router.back()} />
        <View style={styles.centered}>
          <AppText variant="body" color={colors.error.main}>
            {error || "Content not found"}
          </AppText>
          <View style={styles.errorButton}>
            <AppButton
              label="Go Back"
              onPress={() => router.back()}
              variant="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={item.category} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppText variant="title">
              {CATEGORY_ICONS[item.category] || "📄"}
            </AppText>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.tag}>
            <AppText variant="caption" color={colors.primary.main}>
              {item.category.toUpperCase()}
            </AppText>
          </View>

          <AppText variant="heading">{item.title}</AppText>

          <View style={styles.creatorRow}>
            <View style={styles.creatorAvatar}>
              <AppText variant="caption" color={colors.primary.contrast}>
                {item.creator?.name?.charAt(0).toUpperCase() || "?"}
              </AppText>
            </View>
            <AppText variant="body" color={colors.text.secondary}>
              Shared by {item.creator?.name || "Unknown"}
            </AppText>
          </View>

          <View style={styles.divider} />

          <AppText variant="body" style={styles.contentText}>
            {item.content}
          </AppText>
        </View>
      </ScrollView>

      {isOwner && (
        <View style={styles.footer}>
          <AppButton
            label="Edit Content"
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
          />
          <View style={styles.deleteSpacer}>
            <AppButton
              label={deleting ? "Deleting..." : "Delete Content"}
              onPress={() => setShowDeleteModal(true)}
              variant="outline"
              fullWidth
              disabled={deleting}
            />
          </View>
        </View>
      )}

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
  errorButton: {
    marginTop: spacing.md,
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
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginVertical: spacing.sm,
  },
  contentText: {
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
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
