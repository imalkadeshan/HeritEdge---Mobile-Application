import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton, AppCard, AppInput, SelectionChip } from "./index";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme/layout";
import { useUser } from "../context/UserContext";
import { apiUpdateMe } from "../services/api";

const INTERESTS = [
  "Local Language",
  "Stories",
  "Songs",
  "Recipes",
  "Proverbs",
  "Traditions",
  "Traditional Food",
  "Farming",
  "Crafts",
  "Folklore",
  "Local History",
];

interface ProfileScreenProps {
  role: "elder" | "youth";
}

export function ProfileScreen({ role }: ProfileScreenProps) {
  const router = useRouter();
  const { currentUser, updateProfile, updateCulturalInterests, logout } =
    useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [language, setLanguage] = useState(currentUser?.language || "");
  const [community, setCommunity] = useState(currentUser?.community || "");
  const [interests, setInterests] = useState<string[]>(
    currentUser?.culturalInterests || []
  );
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError("");
    setName(currentUser?.name || "");
    setBio(currentUser?.bio || "");
    setLanguage(currentUser?.language || "");
    setCommunity(currentUser?.community || "");
    setInterests(currentUser?.culturalInterests || []);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    setSaveError("");
    setLoading(true);

    try {
      const result = await apiUpdateMe({
        name: name.trim(),
        bio: bio.trim(),
        language: language.trim(),
        community: community.trim(),
        culturalInterests: interests,
      });

      if (result.success && result.data) {
        updateProfile(result.data as import("../context/UserContext").User);
        updateCulturalInterests(interests);
        setIsEditing(false);
      } else {
        setSaveError(result.message || "Failed to save profile");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <AppText variant="title" color={colors.primary.contrast}>
              {currentUser?.name?.charAt(0).toUpperCase() || "?"}
            </AppText>
          </View>
        </View>

        <View style={styles.infoSection}>
          {saveError ? (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color={colors.error.main}>
                {saveError}
              </AppText>
            </View>
          ) : null}

          {isEditing ? (
            <>
              <AppInput
                label="Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError("");
                }}
                autoCapitalize="words"
                error={nameError}
              />
              <AppInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={styles.bioInput}
              />
              <AppInput
                label="Language"
                value={language}
                onChangeText={setLanguage}
                autoCapitalize="words"
              />
              <AppInput
                label="Community"
                value={community}
                onChangeText={setCommunity}
                autoCapitalize="words"
              />

              <View style={styles.interestsSection}>
                <AppText variant="label">Cultural Interests</AppText>
                <View style={styles.interestsContainer}>
                  {INTERESTS.map((interest) => (
                    <SelectionChip
                      key={interest}
                      label={interest}
                      selected={interests.includes(interest)}
                      onPress={() => toggleInterest(interest)}
                    />
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              <AppCard style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <AppText variant="label" color={colors.text.tertiary}>
                    Name
                  </AppText>
                  <AppText variant="body">{currentUser?.name || "-"}</AppText>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <AppText variant="label" color={colors.text.tertiary}>
                    Email
                  </AppText>
                  <AppText variant="body">{currentUser?.email || "-"}</AppText>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <AppText variant="label" color={colors.text.tertiary}>
                    Role
                  </AppText>
                  <AppText variant="body" color={colors.primary.main}>
                    {role === "elder" ? "Elder" : "Youth"}
                  </AppText>
                </View>

                {currentUser?.bio ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <AppText variant="label" color={colors.text.tertiary}>
                        Bio
                      </AppText>
                      <AppText variant="body">{currentUser.bio}</AppText>
                    </View>
                  </>
                ) : null}

                {currentUser?.language ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <AppText variant="label" color={colors.text.tertiary}>
                        Language
                      </AppText>
                      <AppText variant="body">
                        {currentUser.language}
                      </AppText>
                    </View>
                  </>
                ) : null}

                {currentUser?.community ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <AppText variant="label" color={colors.text.tertiary}>
                        Community
                      </AppText>
                      <AppText variant="body">
                        {currentUser.community}
                      </AppText>
                    </View>
                  </>
                ) : null}

                {currentUser?.culturalInterests &&
                currentUser.culturalInterests.length > 0 ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <AppText variant="label" color={colors.text.tertiary}>
                        Interests
                      </AppText>
                      <View style={styles.interestsTags}>
                        {currentUser.culturalInterests.map((interest) => (
                          <View key={interest} style={styles.interestTag}>
                            <AppText variant="caption">{interest}</AppText>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                ) : null}
              </AppCard>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isEditing ? (
          <View style={styles.editActions}>
            <AppButton
              label="Cancel"
              variant="ghost"
              onPress={handleCancel}
              disabled={loading}
            />
            <AppButton
              label="Save"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />
          </View>
        ) : (
          <>
            <AppButton label="Edit Profile" onPress={handleEdit} fullWidth />
            <AppButton
              label="Logout"
              variant="outline"
              onPress={handleLogout}
              fullWidth
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxxxl,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    backgroundColor: colors.background.warm,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    padding: spacing.xxl,
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
  },
  interestsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  interestTag: {
    backgroundColor: colors.background.warm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  interestsSection: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  bioInput: {
    height: 80,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.sm,
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
