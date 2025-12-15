import "@walletconnect/react-native-compat";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import "react-native-reanimated";

import { appKit } from "@/config/AppKitConfig";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { useAuthDeepLink } from "@/hooks/use-auth-deep-link";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePayPalDeepLink } from "@/hooks/use-paypal-deep-link";
import "@/i18n";
import { queryClient } from "@/lib/query-client";
import { pushNotificationService } from "@/services/push-notification.service";
import { AppKit, AppKitProvider } from "@reown/appkit-react-native";
import { QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const { t } = useTranslation();
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
            title: t("headers.search"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: t("headers.settings"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            title: t("headers.editProfile"),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications-settings"
          options={{
            title: t("headers.notifications"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="privacy-settings"
          options={{
            title: t("headers.privacy"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="payment-methods"
          options={{
            title: t("headers.paymentMethods"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="payout-settings"
          options={{
            title: t("headers.payoutSettings"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="my-birds"
          options={{
            title: t("headers.myBirds"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="loved-birds"
          options={{
            title: t("headers.lovedBirds"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="supported-birds"
          options={{
            title: t("headers.supportedBirds"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: t("headers.notifications"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="story/[id]"
          options={{ title: t("headers.story") }}
        />
        <Stack.Screen
          name="support/[id]"
          options={{ title: t("headers.support") }}
        />
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
        <Stack.Screen
          name="privacy-policy"
          options={{
            title: t("headers.privacyPolicy"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="terms-of-service"
          options={{
            title: t("headers.termsOfService"),
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="faq"
          options={{
            title: t("headers.faq"),
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppKitProvider instance={appKit}>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <RootLayoutNav />
              {/* AppKit modal - wrapped in View for Android compatibility */}
              <View
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                }}
              >
                <AppKit />
              </View>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </AppKitProvider>
    </QueryClientProvider>
  );
}
