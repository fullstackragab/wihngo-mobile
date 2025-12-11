import { PREMIUM_PLANS } from "@/constants/premium-config";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CharityImpact {
  totalContributed: number;
  charitiesSupported: string[];
  impactStats: {
    birdsHelped: number;
    sheltersSupported: number;
    conservationProjects: number;
  };
}

interface CharityIntegrationTrackerProps {
  birdId?: string;
  subscriptionPlan?: "monthly" | "yearly" | "lifetime";
  showGlobalImpact?: boolean;
}

export function CharityIntegrationTracker({
  birdId,
  subscriptionPlan,
  showGlobalImpact = false,
}: CharityIntegrationTrackerProps) {
  const [charityImpact, setCharityImpact] = useState<CharityImpact>({
    totalContributed: 0,
    charitiesSupported: [
      "Local Bird Shelter Network",
      "Avian Conservation Fund",
      "Wildlife Rescue Alliance",
    ],
    impactStats: {
      birdsHelped: 0,
      sheltersSupported: 0,
      conservationProjects: 0,
    },
  });

  // Get charity allocation percentage based on plan
  const getCharityPercentage = () => {
    if (!subscriptionPlan) return 0;
    const plan = PREMIUM_PLANS.find((p) => p.id === subscriptionPlan);
    return plan?.charityAllocation || 0;
  };

  const charityPercentage = getCharityPercentage();

  // Calculate estimated contribution
  const calculateEstimatedContribution = () => {
    if (!subscriptionPlan) return 0;
    const plan = PREMIUM_PLANS.find((p) => p.id === subscriptionPlan);
    if (!plan) return 0;
    return (plan.price * (charityPercentage / 100)).toFixed(2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Charity Impact</Text>
        <Text style={styles.subtitle}>Your love supports birds in need</Text>
      </View>

      {/* Personal Contribution */}
      {subscriptionPlan && (
        <View style={styles.contributionCard}>
          <View style={styles.contributionHeader}>
            <Text style={styles.contributionTitle}>Your Contribution</Text>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{charityPercentage}%</Text>
            </View>
          </View>
          <Text style={styles.contributionAmount}>
            ${calculateEstimatedContribution()}
          </Text>
          <Text style={styles.contributionLabel}>
            per{" "}
            {subscriptionPlan === "lifetime" ? "purchase" : subscriptionPlan}{" "}
            goes to bird charities
          </Text>
        </View>
      )}

      {/* Impact Stats */}
      <View style={styles.impactSection}>
        <Text style={styles.impactTitle}>
          {showGlobalImpact ? "🌍 Global Impact" : "Your Impact"}
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>
              {showGlobalImpact
                ? "1,247"
                : charityImpact.impactStats.birdsHelped}
            </Text>
            <Text style={styles.impactLabel}>Birds Helped</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>
              {showGlobalImpact
                ? "43"
                : charityImpact.impactStats.sheltersSupported}
            </Text>
            <Text style={styles.impactLabel}>Shelters Supported</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>
              {showGlobalImpact
                ? "12"
                : charityImpact.impactStats.conservationProjects}
            </Text>
            <Text style={styles.impactLabel}>Conservation Projects</Text>
          </View>
        </View>
      </View>

      {/* Supported Charities */}
      <View style={styles.charitiesSection}>
        <Text style={styles.charitiesTitle}>🤝 Partner Charities</Text>
        {charityImpact.charitiesSupported.map((charity, index) => (
          <View key={index} style={styles.charityItem}>
            <Text style={styles.charityBullet}>✓</Text>
            <Text style={styles.charityName}>{charity}</Text>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 How It Works</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Monthly Plan:</Text> 10% to bird
            charities
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Yearly Plan:</Text> 15% to bird
            charities
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Lifetime Plan:</Text> 20% to bird
            conservation
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.infoText, styles.infoHighlight]}>
            Every premium subscription helps rescue shelters, veterinary care,
            and conservation programs for birds in need. 💛
          </Text>
        </View>
      </View>

      {/* Call to Action */}
      {!subscriptionPlan && (
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>
            ✨ Upgrade to Support Bird Charities
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.small,
    color: "#666",
  },
  contributionCard: {
    backgroundColor: "#E8F5E9",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  contributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  contributionTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2E7D32",
  },
  percentageBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  percentageText: {
    fontSize: Typography.small,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  contributionAmount: {
    fontSize: Typography.h1,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: Spacing.xs,
  },
  contributionLabel: {
    fontSize: Typography.small,
    color: "#2E7D32",
  },
  impactSection: {
    marginBottom: Spacing.lg,
  },
  impactTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#333",
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  impactCard: {
    flex: 1,
    backgroundColor: "#FFF9E5",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  impactNumber: {
    fontSize: Typography.h2,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: Spacing.xs,
  },
  impactLabel: {
    fontSize: Typography.tiny,
    color: "#666",
    textAlign: "center",
  },
  charitiesSection: {
    backgroundColor: "#F9F9F9",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  charitiesTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#333",
    marginBottom: Spacing.sm,
  },
  charityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  charityBullet: {
    fontSize: Typography.body,
    color: "#4CAF50",
    marginRight: Spacing.sm,
    fontWeight: "bold",
  },
  charityName: {
    fontSize: Typography.body,
    color: "#666",
    flex: 1,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#333",
    marginBottom: Spacing.sm,
  },
  infoBox: {
    backgroundColor: "#F0F7FF",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: Typography.small,
    color: "#666",
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
  infoHighlight: {
    fontStyle: "italic",
    color: "#2196F3",
    marginBottom: 0,
  },
  ctaButton: {
    backgroundColor: "#FFD700",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  ctaText: {
    fontSize: Typography.body,
    fontWeight: "bold",
    color: "#333",
  },
});
