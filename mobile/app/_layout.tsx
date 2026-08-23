import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../src/context/UserContext";
import { AuthGuard } from "../src/components/AuthGuard";

export default function RootLayout() {
  return (
    <UserProvider>
      <AuthGuard>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="cultural-interests" />
          <Stack.Screen name="elder" />
          <Stack.Screen name="youth" />
        </Stack>
      </AuthGuard>
    </UserProvider>
  );
}
