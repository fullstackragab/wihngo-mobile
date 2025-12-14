import PremiumPlans from "@/screens/premium-plans";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function PremiumPlansScreen() {
  const { birdId } = useLocalSearchParams<{ birdId: string }>();
  const router = useRouter();

  if (!birdId) {
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Premium Plans",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#2C3E50" />
            </TouchableOpacity>
          ),
        }}
      />
      <PremiumPlans
        birdId={birdId}
        onSubscriptionComplete={() => {
          router.back();
        }}
      />
    </>
  );
}
