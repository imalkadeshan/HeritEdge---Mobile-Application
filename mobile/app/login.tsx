import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton, AppInput } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { borderRadius } from "../src/theme/layout";
import { useUser } from "../src/context/UserContext";
import { apiLogin } from "../src/services/api";
import { validateEmail, validatePassword } from "../src/utils/mockAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");
    setGeneralError("");

    if (emailErr || passwordErr) {
      return;
    }

    setLoading(true);

    try {
      const result = await apiLogin({ email, password });

      if (result.success && result.data) {
        login(result.data as import("../src/context/UserContext").User);
        const user = result.data as import("../src/context/UserContext").User;
        if (user.role === "elder") {
          router.replace("/elder/(tabs)/home");
        } else if (user.role === "youth") {
          router.replace("/youth/(tabs)/home");
        } else {
          router.replace("/role-selection");
        }
      } else {
        setGeneralError(result.message || "Login failed. Please try again.");
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

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoInner} />
          </View>
          <AppText variant="subheading" color={colors.primary.main}>
            HeritEdge
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerText}>
          <AppText variant="heading">Welcome Back</AppText>
          <AppText variant="body" color={colors.text.secondary}>
            Sign in to continue learning and preserving language traditions.
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
              placeholder="Enter your password"
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

          <TouchableOpacity style={styles.forgotPassword}>
            <AppText variant="bodySmall" color={colors.primary.main}>
              Forgot Password?
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Log In"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          fullWidth
        />
        <View style={styles.signupRow}>
          <AppText variant="body" color={colors.text.secondary}>
            Don't have an account?{" "}
          </AppText>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <AppText variant="body" color={colors.primary.main}>
              Sign Up
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
    gap: spacing.xxl,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.contrast,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  footer: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.lg,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});