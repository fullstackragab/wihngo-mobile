import { Bird } from "@/types/bird";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BirdCardProps {
  bird: Bird;
  onPress: (bird: Bird) => void;
}

export default function BirdCard({ bird, onPress }: BirdCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(bird)}>
      <Image
        source={{ uri: bird.imageUrl || "https://via.placeholder.com/100" }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{bird.name}</Text>
        <Text style={styles.species}>{bird.species}</Text>
        <Text style={styles.tagline}>{bird.tagline}</Text>
        <Text style={styles.stats}>
          ❤️ {bird.lovedCount} | 🐦 {bird.supportedCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  species: {
    fontStyle: "italic",
    color: "#555",
  },
  tagline: {
    color: "#333",
    marginTop: 4,
  },
  stats: {
    marginTop: 6,
    color: "#888",
  },
});
