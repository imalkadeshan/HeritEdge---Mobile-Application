import { Tabs } from "expo-router";
import { AppText } from "../../../src/components";
import { colors } from "../../../src/theme/colors";
import { fontSize } from "../../../src/theme/typography";
import { spacing } from "../../../src/theme/spacing";

export default function ElderTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
        },
        tabBarStyle: {
          borderTopColor: colors.surface.border,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AppText variant="label" color={color}>⌂</AppText>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AppText variant="label" color={color}>☺</AppText>
          ),
        }}
      />
    </Tabs>
  );
}
