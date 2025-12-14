import CharityImpactScreen from "@/screens/charity-impact";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function CharityImpact() {
  const { birdId } = useLocalSearchParams<{ birdId?: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Charity Impact",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#2C3E50" />
            </TouchableOpacity>
          ),
        }}
      />
      <CharityImpactScreen birdId={birdId} showGlobal={true} />
    </>
  );
}
