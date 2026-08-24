import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton, AppInput } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { borderRadius } from "../src/theme/layout";
import { useUser } from "../src/context/UserContext";
import { apiRegister } from "../src/services/api";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../src/utils/mockAuth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setNameError(nameErr || "");
    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");
    setConfirmPasswordError(confirmErr || "");
    setGeneralError("");

    if (nameErr || emailErr || passwordErr || confirmErr) {
      return;
    }

    setLoading(true);

    try {
      const result = await apiRegister({ name, email, password });

      if (result.success && result.data) {
        const user = result.data as {
          id: string;
          name: string;
          email: string;
          role: "elder" | "youth" | null;
        };
        register({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: "",
          language: "",
          community: "",
          culturalInterests: [],
          profileImage: null,
        });
        router.push("/role-selection");
      } else {
        setGeneralError(result.message || "Registration failed. Please try again.");
      }
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerText}>
          <AppText variant="heading">Create Your Account</AppText>
          <AppText variant="body" color={colors.text.secondary}>
            Register to join community learning hubs.
          </AppText>
        </View>

        {generalError ? (
          <View style={styles.errorBox}>
            <AppText variant="bodySmall" color={colors.error.main}>
              {generalError}
            </AppText>
          </View>
        ) : null}

        <View style={styles.form}>
          <AppInput
            label="FULL NAME"
            placeholder="Enter your name (e.g. Dadi Rukmani)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={nameError}
            editable={!loading}
          />

          <AppInput
            label="EMAIL ADDRESS"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <AppInput
              label="PASSWORD"
              placeholder="Minimum 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={passwordError}
              editable={!loading}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showHideButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppText variant="label" color={colors.primary.main}>
                {showPassword ? "HIDE" : "SHOW"}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <AppInput
              label="CONFIRM PASSWORD"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              error={confirmPasswordError}
              editable={!loading}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.showHideButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppText variant="label" color={colors.primary.main}>
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label="Create Account"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          fullWidth
        />
        <View style={styles.loginRow}>
          <AppText variant="body" color={colors.text.secondary}>
            Already have an account?{" "}
          </AppText>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <AppText variant="body" color={colors.primary.main}>
              Log In
            </AppText>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.xxl,
    gap: spacing.md,
  },
  headerText: {
    gap: spacing.sm,
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 60,
  },
  showHideButton: {
    position: "absolute",
    right: spacing.lg,
    top: 38,
    padding: spacing.sm,
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.lg,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
