import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { pushNotificationService } from "@/services/push-notification.service";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Initialize push notifications
    pushNotificationService.initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    // Redirect logic based on auth state
    if (!isAuthenticated && inAuthGroup) {
      // User is not authenticated but trying to access protected routes
      router.replace("/welcome");
    } else if (
      isAuthenticated &&
      !inAuthGroup &&
      segments[0] !== "welcome" &&
      segments[0] !== "signup"
    ) {
      // User is authenticated and on auth screens, redirect to home
      // But allow access to other screens like add-bird, create-story, etc.
      const publicScreens = ["welcome", "signup"];
      if (publicScreens.includes(segments[0])) {
        router.replace("/(tabs)/home");
      }
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="create-story"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-bird"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            title: "Edit Profile",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="notifications-settings"
          options={{
            title: "Notifications",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="privacy-settings"
          options={{
            title: "Privacy",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="payment-methods"
          options={{
            title: "Payment Methods",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="my-birds"
          options={{
            title: "My Birds",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="loved-birds"
          options={{
            title: "Loved Birds",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="supported-birds"
          options={{
            title: "Supported Birds",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerShown: true,
            headerStyle: { backgroundColor: "#4ECDC4" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen name="story/[id]" options={{ title: "Story" }} />
        <Stack.Screen name="support/[id]" options={{ title: "Support" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );
}
