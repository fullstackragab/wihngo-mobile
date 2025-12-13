import "@walletconnect/react-native-compat";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { appKit } from "@/config/AppKitConfig";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { useAuthDeepLink } from "@/hooks/use-auth-deep-link";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePayPalDeepLink } from "@/hooks/use-paypal-deep-link";
import { pushNotificationService } from "@/services/push-notification.service";
import { AppKit, AppKitProvider } from "@reown/appkit-react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize deep link handlers
  useAuthDeepLink();
  usePayPalDeepLink();

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
          name="auth/confirm-email"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/reset-password"
          options={{ headerShown: false }}
        />
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
        <Stack.Screen
          name="donation/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="donation/checkout"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="donation/waiting"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="donation/result"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="donation/history"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppKitProvider instance={appKit}>
      <AuthProvider>
        <NotificationProvider>
          <RootLayoutNav />
          {/* AppKit modal - wrapped in View for Android compatibility */}
          <View style={{ position: "absolute", height: "100%", width: "100%" }}>
            <AppKit />
          </View>
        </NotificationProvider>
      </AuthProvider>
    </AppKitProvider>
  );
}
