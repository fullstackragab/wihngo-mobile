import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
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
            options={{ title: "Create Story", headerShown: true }}
          />
          <Stack.Screen
            name="add-bird"
            options={{ title: "Add Bird", headerShown: true }}
          />
          <Stack.Screen
            name="search"
            options={{ title: "Search", headerShown: true }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: "Settings", headerShown: true }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ title: "Edit Profile", headerShown: true }}
          />
          <Stack.Screen
            name="notifications-settings"
            options={{ title: "Notifications", headerShown: true }}
          />
          <Stack.Screen
            name="privacy-settings"
            options={{ title: "Privacy", headerShown: true }}
          />
          <Stack.Screen
            name="payment-methods"
            options={{ title: "Payment Methods", headerShown: true }}
          />
          <Stack.Screen
            name="my-birds"
            options={{ title: "My Birds", headerShown: true }}
          />
          <Stack.Screen
            name="loved-birds"
            options={{ title: "Loved Birds", headerShown: true }}
          />
          <Stack.Screen
            name="supported-birds"
            options={{ title: "Supported Birds", headerShown: true }}
          />
          <Stack.Screen name="story/[id]" options={{ title: "Story" }} />
          <Stack.Screen name="support/[id]" options={{ title: "Support" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
