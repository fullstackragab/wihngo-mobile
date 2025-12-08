import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PremiumUpgradeCardProps = {
  onUpgrade: () => void;
};

export function PremiumUpgradeCard({ onUpgrade }: PremiumUpgradeCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={32} color={theme.colors.accent} />
        <Text style={styles.title}>Upgrade to Premium Bird Page</Text>
      </View>

      <View style={styles.features}>
        <FeatureItem icon="image-outline" text="Custom Frames" />
        <FeatureItem icon="bookmark" text="Story Highlights" />
        <FeatureItem icon="ribbon" text="Premium Badge" />
        <FeatureItem icon="trending-up" text="More Visibility" />
      </View>

      <Pressable style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>Upgrade Now</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>

      <Text style={styles.price}>$4.99/month per bird</Text>
    </View>
  );
}

type FeatureItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  features: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});
