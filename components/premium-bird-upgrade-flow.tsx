import { PREMIUM_PLANS } from "@/constants/premium-config";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Bird } from "@/types/bird";
import { PremiumPlan } from "@/types/premium";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CharityIntegrationTracker } from "./charity-integration-tracker";

interface PremiumBirdUpgradeFlowProps {
  bird: Bird;
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
}

export function PremiumBirdUpgradeFlow({
  bird,
  visible,
  onClose,
  onSelectPlan,
}: PremiumBirdUpgradeFlowProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("yearly");
  const [showCharityInfo, setShowCharityInfo] = useState(false);

  const handlePlanSelect = (planId: PremiumPlan) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    onSelectPlan(selectedPlan);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Celebrate {bird.name}</Text>
          <Text style={styles.headerSubtitle}>
            Show your love with premium features
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bird Preview */}
          <View style={styles.birdPreview}>
            <Image
              source={{
                uri: bird.imageUrl || "https://via.placeholder.com/80",
              }}
              style={styles.birdImage}
            />
            <View style={styles.birdInfo}>
              <Text style={styles.birdName}>{bird.name}</Text>
              <Text style={styles.birdSpecies}>{bird.species}</Text>
            </View>
          </View>

          {/* Love-Focused Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageEmoji}>💛</Text>
            <Text style={styles.messageTitle}>
              Premium isn&apos;t about luxury—it&apos;s about love
            </Text>
            <Text style={styles.messageText}>
              Celebrate {bird.name}'s story with unlimited memories, custom
              themes, and support bird charities at the same time.
            </Text>
          </View>

          {/* Pricing Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {PREMIUM_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.id === "yearly" && styles.planCardRecommended,
                ]}
                onPress={() => handlePlanSelect(plan.id)}
              >
                {plan.id === "yearly" && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>⭐ Best Value</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.radioButton}>
                      {selectedPlan === plan.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                  {plan.description && (
                    <Text style={styles.planDescription}>
                      {plan.description}
                    </Text>
                  )}
                </View>

                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>${plan.price}</Text>
                  <Text style={styles.planInterval}>
                    {plan.interval === "lifetime"
                      ? "one-time"
                      : `per ${plan.interval}`}
                  </Text>
                </View>

                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>💰 {plan.savings}</Text>
                  </View>
                )}

                {/* Charity Allocation */}
                <View style={styles.charityBadge}>
                  <Text style={styles.charityBadgeText}>
                    🏥 {plan.charityAllocation}% supports bird charities
                  </Text>
                </View>

                {/* Features Preview */}
                <View style={styles.featuresPreview}>
                  <Text style={styles.featuresTitle}>✨ Includes:</Text>
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <Text key={index} style={styles.featureItem}>
                      • {feature}
                    </Text>
                  ))}
                  {plan.features.length > 4 && (
                    <Text style={styles.moreFeatures}>
                      + {plan.features.length - 4} more features
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Charity Impact Info */}
          <TouchableOpacity
            style={styles.charityInfoButton}
            onPress={() => setShowCharityInfo(!showCharityInfo)}
          >
            <Text style={styles.charityInfoButtonText}>
              {showCharityInfo ? "Hide" : "See"} Charity Impact Details 🏥
            </Text>
          </TouchableOpacity>

          {showCharityInfo && (
            <View style={styles.charityInfoSection}>
              <CharityIntegrationTracker
                subscriptionPlan={selectedPlan}
                showGlobalImpact={true}
              />
            </View>
          )}

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>Why Premium?</Text>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>💛</Text>
              <View style={styles.trustContent}>
                <Text style={styles.trustItemTitle}>Support with Love</Text>
                <Text style={styles.trustItemText}>
                  Your subscription helps bird shelters and conservation
                  programs
                </Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>🎨</Text>
              <View style={styles.trustContent}>
                <Text style={styles.trustItemTitle}>Celebrate Uniquely</Text>
                <Text style={styles.trustItemText}>
                  Custom themes and unlimited memories for your bird&apos;s story
                </Text>
              </View>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>🌟</Text>
              <View style={styles.trustContent}>
                <Text style={styles.trustItemTitle}>Share the Joy</Text>
                <Text style={styles.trustItemText}>
                  Premium profile features help spread love in the community
                </Text>
              </View>
            </View>
          </View>

          {/* Free vs Premium Comparison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Free vs Premium</Text>
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Photos & Videos</Text>
                <Text style={styles.comparisonFree}>5 each</Text>
                <Text style={styles.comparisonPremium}>Unlimited ✓</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Custom Themes</Text>
                <Text style={styles.comparisonFree}>—</Text>
                <Text style={styles.comparisonPremium}>✓</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Best Moments</Text>
                <Text style={styles.comparisonFree}>—</Text>
                <Text style={styles.comparisonPremium}>10 ✓</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Charity Support</Text>
                <Text style={styles.comparisonFree}>—</Text>
                <Text style={styles.comparisonPremium}>✓</Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            💡 Cancel anytime. Premium is about celebrating your bird, not
            locking you in.
          </Text>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue with{" "}
              {PREMIUM_PLANS.find((p) => p.id === selectedPlan)?.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  headerTitle: {
    fontSize: Typography.h2,
    fontWeight: "bold",
    color: "#333",
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.body,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  birdPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E5",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  birdImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  birdInfo: {
    flex: 1,
  },
  birdName: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
  },
  birdSpecies: {
    fontSize: Typography.body,
    color: "#666",
  },
  messageCard: {
    backgroundColor: "#FFF0F5",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "#FFB6C1",
  },
  messageEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  messageTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  messageText: {
    fontSize: Typography.body,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  plansSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: Spacing.md,
  },
  planCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#FFD700",
    backgroundColor: "#FFF9E5",
  },
  planCardRecommended: {
    borderColor: "#FF6B6B",
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    right: Spacing.md,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    zIndex: 10,
  },
  recommendedText: {
    fontSize: Typography.small,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  planHeader: {
    marginBottom: Spacing.md,
  },
  planTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  planName: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFD700",
  },
  planDescription: {
    fontSize: Typography.small,
    color: "#666",
    fontStyle: "italic",
  },
  planPricing: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  planPrice: {
    fontSize: Typography.h1,
    fontWeight: "bold",
    color: "#333",
    marginRight: Spacing.xs,
  },
  planInterval: {
    fontSize: Typography.body,
    color: "#666",
  },
  savingsBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    alignSelf: "flex-start",
  },
  savingsText: {
    fontSize: Typography.small,
    color: "#2E7D32",
    fontWeight: "600",
  },
  charityBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  charityBadgeText: {
    fontSize: Typography.small,
    color: "#1976D2",
    fontWeight: "600",
  },
  featuresPreview: {
    marginTop: Spacing.sm,
  },
  featuresTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#333",
    marginBottom: Spacing.xs,
  },
  featureItem: {
    fontSize: Typography.small,
    color: "#666",
    marginBottom: 4,
    paddingLeft: Spacing.sm,
  },
  moreFeatures: {
    fontSize: Typography.small,
    color: "#999",
    fontStyle: "italic",
    marginTop: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  charityInfoButton: {
    backgroundColor: "#E8F5E9",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  charityInfoButtonText: {
    fontSize: Typography.body,
    color: "#2E7D32",
    fontWeight: "600",
  },
  charityInfoSection: {
    backgroundColor: "#F9F9F9",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  trustSection: {
    marginBottom: Spacing.lg,
  },
  trustTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: Spacing.md,
  },
  trustItem: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  trustEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  trustContent: {
    flex: 1,
  },
  trustItemTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#333",
    marginBottom: Spacing.xs,
  },
  trustItemText: {
    fontSize: Typography.small,
    color: "#666",
    lineHeight: 20,
  },
  comparisonSection: {
    marginBottom: Spacing.lg,
  },
  comparisonTable: {
    backgroundColor: "#FAFAFA",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  comparisonFeature: {
    flex: 2,
    fontSize: Typography.small,
    color: "#333",
  },
  comparisonFree: {
    flex: 1,
    fontSize: Typography.small,
    color: "#999",
    textAlign: "center",
  },
  comparisonPremium: {
    flex: 1,
    fontSize: Typography.small,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
  },
  footerNote: {
    fontSize: Typography.small,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    backgroundColor: "#FFD700",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: Typography.body,
    fontWeight: "bold",
    color: "#333",
  },
});
