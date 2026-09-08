import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing, touchTarget } from "../src/theme/spacing";
import { borderRadius } from "../src/theme/layout";
import { useUser } from "../src/context/UserContext";
import { apiUpdateProfile } from "../src/services/api";

type Role = "elder" | "youth";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { currentUser, updateProfile } = useUser();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole || !currentUser) return;

    setLoading(true);

    try {
      await apiUpdateProfile(currentUser.id, { role: selectedRole });
    } catch {
      // Continue even if API fails — local state is updated
    }

    updateProfile({ role: selectedRole });
    setLoading(false);
    router.push("/profile-setup");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText variant="body" color={colors.primary.main}>
            ← Back
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerText}>
          <AppText variant="heading">How will you use{"\n"}HeritEdge?</AppText>
          <AppText variant="body" color={colors.text.secondary}>
            Select the role that fits you best. You can always change this later.
          </AppText>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            onPress={() => setSelectedRole("elder")}
            activeOpacity={0.7}
            style={[
              styles.card,
              selectedRole === "elder" && styles.cardSelected,
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconRow}>
                <View style={styles.cardIcon}>
                  <AppText variant="body" color={colors.primary.contrast}>
                    👴
                  </AppText>
                </View>
                <View style={styles.cardText}>
                  <AppText variant="subheading">I am an Elder</AppText>
                  <AppText variant="body" color={colors.text.secondary}>
                    Share your knowledge, stories, oral ballads, and folk traditions.
                  </AppText>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedRole("youth")}
            activeOpacity={0.7}
            style={[
              styles.card,
              selectedRole === "youth" && styles.cardSelected,
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconRow}>
                <View style={styles.cardIcon}>
                  <AppText variant="body" color={colors.primary.contrast}>
                    📚
                  </AppText>
                </View>
                <View style={styles.cardText}>
                  <AppText variant="subheading">I am a Learner</AppText>
                  <AppText variant="body" color={colors.text.secondary}>
                    Learn, discover, and help preserve local languages and cultural memories.
                  </AppText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
          loading={loading}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  headerText: {
    gap: spacing.sm,
  },
  options: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surface.border,
    padding: spacing.xl,
    minHeight: touchTarget.recommended,
    justifyContent: "center",
  },
  cardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: "#FFF5F5",
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardIconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
});
