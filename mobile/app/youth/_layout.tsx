import { Stack } from "expo-router";

export default function YouthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="content-detail" />
      <Stack.Screen name="elder-profile" />
      <Stack.Screen name="collaboration-request" />
      <Stack.Screen name="outgoing-requests" />
      <Stack.Screen name="collaboration-workspace" />
      <Stack.Screen name="add-contribution" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
