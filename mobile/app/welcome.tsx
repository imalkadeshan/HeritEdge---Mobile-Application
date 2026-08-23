import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { AppText, AppButton } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { fontSize } from "../src/theme/typography";
import { borderRadius } from "../src/theme/layout";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <View style={styles.illustration}>
          <Image
            source={require("../figma_uis/welcome-screen.jpg")}
            style={styles.illustrationImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContent}>
          <AppText variant="heading">
            Learn. Share.{"\n"}Preserve.
          </AppText>

          <AppText
            variant="body"
            color={colors.text.secondary}
            style={styles.description}
          >
            A safe space where elders can voice their legacy, and youth can
            secure knowledge that lasts generations.
          </AppText>
        </View>
      </View>

      <View style={styles.buttons}>
        <AppButton
          label="Get Started"
          onPress={() => router.push("/register")}
          fullWidth
        />
        <AppButton
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push("/login")}
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.contrast,
  },
  content: {
    flex: 1,
    gap: spacing.xxl,
  },
  illustration: {
    alignItems: "center",
  },
  illustrationImage: {
    width: "100%",
    height: 220,
    borderRadius: borderRadius.lg,
  },
  textContent: {
    gap: spacing.lg,
  },
  description: {
    lineHeight: fontSize.md * 1.6,
  },
  buttons: {
    gap: spacing.md,
  },
});
