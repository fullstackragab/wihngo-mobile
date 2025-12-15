import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { hasPremium } from "@/services/premium.service";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MemorialBadge from "./memorial-badge";
import { PremiumBadge } from "./premium-badge";

interface BirdCardProps {
  bird: Bird;
  onPress: (bird: Bird) => void;
  onEdit?: (bird: Bird) => void;
  showActions?: boolean;
}

export default function BirdCard({
  bird,
  onPress,
  onEdit,
  showActions,
}: BirdCardProps) {
  const { t } = useTranslation();
  const isPremium = hasPremium(bird);
  const isMemorial = bird.isMemorial;

  const CardContainer = showActions ? View : TouchableOpacity;
  const cardProps = showActions
    ? {}
    : {
        onPress: () => onPress(bird),
        activeOpacity: 0.7,
      };

  return (
    <CardContainer
      style={[
        styles.card,
        isPremium && styles.premiumCard,
        isMemorial && styles.memorialCard,
      ]}
      {...cardProps}
    >
      {isPremium && !isMemorial && <View style={styles.premiumGlow} />}
      <Image
        source={{ uri: bird.imageUrl || "https://via.placeholder.com/100" }}
        style={[
          styles.image,
          isPremium && styles.premiumImage,
          isMemorial && styles.memorialImage,
        ]}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {bird.name}
          </Text>
          {isMemorial && <MemorialBadge size="small" showIcon={false} />}
          {isPremium && !isMemorial && <PremiumBadge size="small" />}
        </View>
        <Text style={styles.species} numberOfLines={1}>
          {bird.species}
        </Text>
        {isPremium && !isMemorial && (
          <Text style={styles.celebratedTag}>💛 Celebrated Bird</Text>
        )}
        {isMemorial && <Text style={styles.memorialTag}>🕊️ In Memory</Text>}
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {bird.lovedBy}</Text>
          <Text style={styles.statText}>🐦 {bird.supportedBy}</Text>
        </View>
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onPress(bird)}
            >
              <FontAwesome6 name="eye" size={16} color="#4ECDC4" />
              <Text style={styles.actionText}>{t("common.view")}</Text>
            </TouchableOpacity>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(bird)}
              >
                <FontAwesome6 name="pen" size={16} color="#666" />
                <Text style={styles.actionText}>{t("common.edit")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </CardContainer>
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
    position: "relative",
    overflow: "hidden",
  },
  premiumCard: {
    backgroundColor: "#FFF9E5",
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderRadius: BorderRadius.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    backgroundColor: "#F0F0F0",
  },
  premiumImage: {
    borderWidth: 2,
    borderColor: "#FFD700",
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
  celebratedTag: {
    fontSize: Typography.tiny,
    color: "#FF6B6B",
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  memorialCard: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#95A5A6",
  },
  memorialImage: {
    opacity: 0.85,
    borderWidth: 1,
    borderColor: "#95A5A6",
  },
  memorialTag: {
    fontSize: Typography.tiny,
    color: "#7F8C8D",
    fontStyle: "italic",
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
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
});
