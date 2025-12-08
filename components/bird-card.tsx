import { hasPremium } from "@/services/premium.service";
import { Bird } from "@/types/bird";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PremiumBadge } from "./premium-badge";

interface BirdCardProps {
  bird: Bird;
  onPress: (bird: Bird) => void;
}

export default function BirdCard({ bird, onPress }: BirdCardProps) {
  const isPremium = hasPremium(bird);

  return (
    <TouchableOpacity
      style={[styles.card, isPremium && styles.premiumCard]}
      onPress={() => onPress(bird)}
    >
      <Image
        source={{ uri: bird.imageUrl || "https://via.placeholder.com/100" }}
        style={[styles.image, isPremium && styles.premiumImage]}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{bird.name}</Text>
          {isPremium && <PremiumBadge size="small" />}
        </View>
        <Text style={styles.species}>{bird.species}</Text>
        <Text style={styles.tagline}>{bird.tagline}</Text>
        <Text style={styles.stats}>
          ❤️ {bird.lovedBy} | 🐦 {bird.supportedBy}
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
  premiumCard: {
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  premiumImage: {
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
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
