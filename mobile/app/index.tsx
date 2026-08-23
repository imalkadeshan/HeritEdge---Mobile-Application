import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, Animated, StatusBar } from "react-native";
import { AppText } from "../src/components";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { fontSize } from "../src/theme/typography";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.splash.background} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner} />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="title" color={colors.primary.contrast} align="center">
            HeritEdge
          </AppText>
          <AppText
            variant="body"
            color={colors.primary.contrast}
            align="center"
            style={styles.subtitle}
          >
            Connecting generations, preserving{"\n"}culture.
          </AppText>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.primary.contrast} align="center">
          HeritEdge v1.0.0
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splash.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxxxl,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.contrast,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.splash.background,
  },
  textContainer: {
    gap: spacing.md,
  },
  subtitle: {
    opacity: 0.9,
    lineHeight: fontSize.md * 1.5,
  },
  footer: {
    paddingBottom: spacing.xxxxl,
  },
});
