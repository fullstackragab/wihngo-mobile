import "react-native-get-random-values";

import "@walletconnect/react-native-compat";

import {
  AddressType,
  darkTheme,
  PhantomProvider,
  useModal,
  usePhantom,
} from "@phantom/react-native-sdk";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "react-native-reanimated";

import OfflineBanner from "@/components/ui/offline-banner";
import { appKit } from "@/config/AppKitConfig";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NetworkProvider } from "@/contexts/network-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { useAuthDeepLink } from "@/hooks/use-auth-deep-link";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePayPalDeepLink } from "@/hooks/use-paypal-deep-link";
import "@/i18n";
import { queryClient } from "@/lib/query-client";
import { pushNotificationService } from "@/services/push-notification.service";
import { AppKit, AppKitProvider } from "@reown/appkit-react-native";
import { QueryClientProvider } from "@tanstack/react-query";

// WalletScreen.tsx
import { Button, Text, View } from "react-native";

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
        <Stack.Screen
          name="our-principles"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="how-fees-work"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="donation/fee-coverage"
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
    <PhantomProvider
      config={{
        providers: ["google", "apple"], // Enabled auth providers for React Native
        appId: "7d9683b1-be04-4a3b-a582-64ad800d8d04",
        scheme: "wihngo",
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: "wihngo://phantom-auth-callback",
        },
      }}
      theme={darkTheme} // Optional: Customize modal appearance
      appIcon="https://wihngo.com/icon.png" // Optional: Your app icon
      appName="Wihngo" // Optional: Your app name
    >
      {/* <WalletScreen /> */}
      <QueryClientProvider client={queryClient}>
        <AppKitProvider instance={appKit}>
          <LanguageProvider>
            <NetworkProvider>
              <AuthProvider>
                <NotificationProvider>
                  <RootLayoutNav />
                  {/* Offline banner - shown when device is offline */}
                  <OfflineBanner />
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
            </NetworkProvider>
          </LanguageProvider>
        </AppKitProvider>
      </QueryClientProvider>
    </PhantomProvider>
  );
}

export function WalletScreen() {
  const { open, close, isOpened } = useModal();
  const { isConnected } = usePhantom();

  if (isConnected) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Connected</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title="Connect Wallet" onPress={open} />
    </View>
  );
}
