import { BorderRadius, Spacing, Typography } from "@/constants/theme";
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
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2; // 2 columns with spacing

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
        <View style={styles.statsRow}>
          <Text style={styles.stats}>❤️ {bird.lovedBy || 0}</Text>
          <Text style={styles.statsSeparator}>•</Text>
          <Text style={styles.stats}>💎 {bird.supportedBy || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.1,
    backgroundColor: "#F0F0F0",
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  info: {
    padding: Spacing.sm,
    backgroundColor: "#fff",
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  name: {
    fontWeight: "500",
    fontSize: Typography.small,
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  stats: {
    fontSize: Typography.tiny,
    color: "#999",
  },
  statsSeparator: {
    fontSize: Typography.tiny,
    color: "#DDD",
  },
});
