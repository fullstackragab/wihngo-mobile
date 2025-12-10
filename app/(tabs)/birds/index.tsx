import { BorderRadius } from "@/constants/theme";
import BirdList from "@/screens/bird-list";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, Stack } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function Birds() {
  return (
    <>
      <Stack.Screen options={{ title: "Birds", headerShown: false }} />
      <BirdList
        onPressBird={(bird: Bird) => {
          router.push(`/birds/${bird.birdId}`);
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-bird")}
      >
        <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
