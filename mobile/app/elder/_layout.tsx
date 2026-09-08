import { Stack } from "expo-router";

export default function ElderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-content" />
      <Stack.Screen name="edit-content" />
    </Stack>
  );
}
