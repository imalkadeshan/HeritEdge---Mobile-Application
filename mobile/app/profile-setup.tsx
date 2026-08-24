import { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton, AppInput, SelectionChip } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { borderRadius } from "../src/theme/layout";
import { useUser } from "../src/context/UserContext";
import { apiUpdateProfile } from "../src/services/api";

const KNOWLEDGE_AREAS = [
  "Stories",
  "Songs",
  "Recipes",
  "Traditions",
  "Proverbs",
  "Local Words",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { currentUser, updateProfile, updateCulturalInterests } = useUser();
  const [name, setName] = useState("");
  const [languageCommunity, setLanguageCommunity] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleComplete = async () => {
    if (!validate() || !currentUser) {
      return;
    }

    setLoading(true);

    const langComm = languageCommunity.split("|").map((s) => s.trim());
    const profileData = {
      name: name.trim(),
      bio: bio.trim(),
      language: langComm[0] || "",
      community: langComm[1] || "",
      culturalInterests: selectedAreas,
    };

    try {
      await apiUpdateProfile(currentUser.id, profileData);
    } catch {
      // Continue even if API fails
    }

    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      language: langComm[0] || "",
      community: langComm[1] || "",
    });
    updateCulturalInterests(selectedAreas);

    setLoading(false);

    if (currentUser?.role === "elder") {
      router.replace("/elder/(tabs)/home");
    } else {
      router.replace("/youth/(tabs)/home");
    }
  };

  const handleSkip = () => {
    if (currentUser?.role === "elder") {
      router.replace("/elder/(tabs)/home");
    } else {
      router.replace("/youth/(tabs)/home");
    }
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
        <AppText variant="heading" align="center" style={styles.headerTitle}>
          Profile Setup
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <AppText variant="title" color={colors.primary.contrast}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </AppText>
          </View>
          <TouchableOpacity>
            <AppText variant="bodySmall" color={colors.primary.main}>
              Change Photo
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <AppInput
            label="DISPLAY NAME"
            placeholder="Enter your display name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError("");
            }}
            autoCapitalize="words"
            error={nameError}
            editable={!loading}
          />

          <AppInput
            label="PRIMARY LANGUAGE / COMMUNITY"
            placeholder="e.g. Maithili (Northern Bihar)"
            value={languageCommunity}
            onChangeText={setLanguageCommunity}
            autoCapitalize="words"
            editable={!loading}
          />

          <AppInput
            label="SHORT INTRODUCTION"
            placeholder="Tell us about yourself (optional)"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.bioInput}
            editable={!loading}
          />

          <View style={styles.areasSection}>
            <AppText variant="label" style={styles.areasLabel}>
              AREAS OF KNOWLEDGE
            </AppText>
            <View style={styles.chipsContainer}>
              {KNOWLEDGE_AREAS.map((area) => (
                <SelectionChip
                  key={area}
                  label={area}
                  selected={selectedAreas.includes(area)}
                  onPress={() => toggleArea(area)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label="Complete Profile"
          onPress={handleComplete}
          loading={loading}
          disabled={loading}
          fullWidth
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <AppText variant="body" color={colors.text.secondary}>
            Skip for now
          </AppText>
        </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 60,
  },
  headerTitle: {
    flex: 1,
  },
  headerSpacer: {
    width: 60,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: spacing.lg,
  },
  bioInput: {
    height: 80,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  areasSection: {
    gap: spacing.sm,
  },
  areasLabel: {
    marginBottom: spacing.xs,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
