import { Bird } from "@/types/bird";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BirdThumbProps {
  bird: Bird;
  onPress: (bird: Bird) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

export default function BirdThumb({ bird, onPress }: BirdThumbProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(bird)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: bird.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {bird.name}
        </Text>
        {/* <Text style={styles.species} numberOfLines={1}>
          {bird.species}
        </Text> */}
        <View style={styles.statsRow}>
          <Text style={styles.stats}>❤️ {bird.lovedBy}</Text>
          <Text style={styles.stats}>🐦 {bird.supportedBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH,
    backgroundColor: "#f0f0f0",
  },
  info: {
    padding: 10,
  },
  name: {
    fontWeight: "normal",
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
  },
  species: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stats: {
    fontSize: 11,
    color: "#888",
  },
});
