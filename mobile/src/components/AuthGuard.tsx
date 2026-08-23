import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useUser } from "../context/UserContext";

const PUBLIC_ROUTES = ["index", "welcome", "login", "register"];
const ELDER_ROUTES = ["elder"];
const YOUTH_ROUTES = ["youth"];
const SETUP_ROUTES = ["role-selection", "profile-setup", "cultural-interests"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, currentUser, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string;

    if (PUBLIC_ROUTES.includes(currentSegment)) {
      return;
    }

    if (SETUP_ROUTES.includes(currentSegment)) {
      return;
    }

    const isElderRoute = ELDER_ROUTES.includes(currentSegment);
    const isYouthRoute = YOUTH_ROUTES.includes(currentSegment);

    if (isElderRoute || isYouthRoute) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (isElderRoute && currentUser?.role !== "elder") {
        router.replace("/youth/(tabs)/home");
        return;
      }

      if (isYouthRoute && currentUser?.role !== "youth") {
        router.replace("/elder/(tabs)/home");
        return;
      }
    }
  }, [segments, isAuthenticated, currentUser, isLoading, router]);

  return <>{children}</>;
}
