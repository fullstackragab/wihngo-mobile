import { PREMIUM_PLANS } from "@/constants/premium-config";
import { theme } from "@/constants/theme";
import { PremiumPlan } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type PremiumUpgradeCardV2Props = {
  onUpgrade: (plan: PremiumPlan) => void;
};

export function PremiumUpgradeCardV2({ onUpgrade }: PremiumUpgradeCardV2Props) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("monthly");

  const selectedPlanDetails = PREMIUM_PLANS.find((p) => p.id === selectedPlan);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={32} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>Celebrate Your Bird</Text>
        <Text style={styles.subtitle}>
          Upgrade to show your love and unlock special features
        </Text>
      </View>

      {/* Plan Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.plansScroll}
      >
        {PREMIUM_PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{plan.savings}</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>$</Text>
              <Text style={styles.priceAmount}>{plan.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.priceInterval}>
              {plan.interval === "lifetime"
                ? "one-time"
                : `per ${plan.interval}`}
            </Text>

            {plan.charityAllocation && (
              <View style={styles.charityBadge}>
                <Ionicons name="heart" size={12} color="#FF6B6B" />
                <Text style={styles.charityText}>
                  {plan.charityAllocation}% to bird charities
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What&apos;s Included:</Text>
        <View style={styles.features}>
          {selectedPlanDetails?.features.slice(0, 6).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.accent}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Button */}
      <Pressable
        style={styles.upgradeButton}
        onPress={() => onUpgrade(selectedPlan)}
      >
        <Ionicons name="star" size={20} color="#fff" />
        <Text style={styles.upgradeButtonText}>Start Celebrating</Text>
      </Pressable>

      {/* Love-First Message */}
      <View style={styles.messageContainer}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.message}>
          Premium is about celebrating your bird, not restricting love. Your
          community can still interact freely!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.accent}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  plansScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  planCard: {
    width: 160,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  planCardSelected: {
    backgroundColor: `${theme.colors.accent}10`,
    borderColor: theme.colors.accent,
  },
  savingsBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.text,
    lineHeight: 36,
  },
  priceInterval: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  charityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  charityText: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  features: {
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  message: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
