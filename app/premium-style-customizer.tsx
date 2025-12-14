import PremiumStyleCustomizer from "@/screens/premium-style-customizer";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function PremiumStyleCustomizerScreen() {
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
          title: "Customize Style",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#2C3E50" />
            </TouchableOpacity>
          ),
        }}
      />
      <PremiumStyleCustomizer
        birdId={birdId}
        onStyleUpdated={() => {
          router.back();
        }}
      />
    </>
  );
}
