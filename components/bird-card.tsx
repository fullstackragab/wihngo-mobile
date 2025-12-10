import { BorderRadius, Spacing, Typography } from "@/constants/theme";
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
      style={styles.card}
      onPress={() => onPress(bird)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: bird.imageUrl || "https://via.placeholder.com/100" }}
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {bird.name}
          </Text>
          {isPremium && <PremiumBadge size="small" />}
        </View>
        <Text style={styles.species} numberOfLines={1}>
          {bird.species}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {bird.lovedBy}</Text>
          <Text style={styles.statText}>🐦 {bird.supportedBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    backgroundColor: "#F0F0F0",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  name: {
    fontWeight: "600",
    fontSize: Typography.h3,
    color: "#1A1A1A",
  },
  species: {
    fontSize: Typography.small,
    color: "#999",
    marginBottom: Spacing.xs,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statText: {
    fontSize: Typography.tiny,
    color: "#999",
  },
});
