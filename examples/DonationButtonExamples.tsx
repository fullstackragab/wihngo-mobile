/**
 * Example: Donation Button Component
 * 
 * Use this component to add donation functionality to any screen
 * Place in: components/donation/DonationButton.tsx
 */

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface DonationButtonProps {
  birdId?: string;
  birdName?: string;
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "medium" | "large";
  label?: string;
}

export function DonationButton({
  birdId,
  birdName,
  variant = "primary",
  size = "medium",
  label,
}: DonationButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (birdId) {
      router.push({
        pathname: "/donation",
        params: { birdId, birdName },
      });
    } else {
      router.push("/donation");
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          styles[`buttonText_${variant}`],
          styles[`buttonText_${size}`],
        ]}
      >
        {label || (birdId ? "Support This Bird" : "Support Wihngo")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  // Variants
  button_primary: {
    backgroundColor: "#007AFF",
  },
  button_secondary: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  button_text: {
    backgroundColor: "transparent",
  },
  // Sizes
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  // Text
  buttonText: {
    fontWeight: "600",
  },
  buttonText_primary: {
    color: "#fff",
  },
  buttonText_secondary: {
    color: "#000",
  },
  buttonText_text: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
});

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Bird Detail Screen
 * Add donation button below bird information
 */
/*
import { DonationButton } from "@/components/donation/DonationButton";

function BirdDetailScreen({ bird }) {
  return (
    <ScrollView>
      <Text>{bird.name}</Text>
      <Text>{bird.description}</Text>
      
      <DonationButton
        birdId={bird.id}
        birdName={bird.name}
        variant="primary"
        size="large"
        label="Support This Bird"
      />
    </ScrollView>
  );
}
*/

/**
 * Example 2: Profile Screen
 * Add "View Donations" button to navigate to history
 */
/*
import { useRouter } from "expo-router";

function ProfileScreen() {
  const router = useRouter();
  
  return (
    <View>
      <TouchableOpacity onPress={() => router.push("/donation/history")}>
        <Text>View Donation History</Text>
      </TouchableOpacity>
    </View>
  );
}
*/

/**
 * Example 3: Home Screen
 * Add general support button in header or footer
 */
/*
import { DonationButton } from "@/components/donation/DonationButton";

function HomeScreen() {
  return (
    <View>
      {/* Other content */}
      
      <View style={styles.footer}>
        <DonationButton
          variant="secondary"
          size="medium"
          label="💚 Support Wihngo"
        />
      </View>
    </View>
  );
}
*/

/**
 * Example 4: Settings Screen
 * Add link to donation history
 */
/*
function SettingsScreen() {
  const router = useRouter();
  
  const settingsItems = [
    { label: "Profile", onPress: () => router.push("/edit-profile") },
    { label: "Notifications", onPress: () => router.push("/notifications-settings") },
    { label: "Donation History", onPress: () => router.push("/donation/history") },
    { label: "Support", onPress: () => router.push("/support") },
  ];
  
  return (
    <FlatList
      data={settingsItems}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={item.onPress}>
          <Text>{item.label}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
*/

/**
 * Example 5: Tab Navigator
 * Add donation tab (optional)
 */
/*
// In app/(tabs)/_layout.tsx
<Tabs>
  <Tabs.Screen name="home" options={{ title: "Home" }} />
  <Tabs.Screen name="birds" options={{ title: "Birds" }} />
  <Tabs.Screen name="donate" options={{ title: "Support" }} />
  <Tabs.Screen name="profile" options={{ title: "Profile" }} />
</Tabs>

// Create app/(tabs)/donate.tsx
import { Redirect } from "expo-router";

export default function DonateTab() {
  return <Redirect href="/donation" />;
}
*/

/**
 * Example 6: Deep Link from Push Notification
 * When user taps "Receipt Ready" notification
 */
/*
import * as Notifications from "expo-notifications";

Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  if (data.type === "receipt_ready" && data.invoiceId) {
    router.push({
      pathname: "/donation/result",
      params: { invoiceId: data.invoiceId },
    });
  }
});
*/

/**
 * Example 7: Floating Action Button (FAB)
 * Add persistent donation button across app
 */
/*
import { useNavigation } from "@react-navigation/native";

function FloatingDonationButton() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate("donation")}
    >
      <Text style={styles.fabIcon}>💚</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});
*/
