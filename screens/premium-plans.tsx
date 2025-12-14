import { useAuth } from "@/contexts/auth-context";
import {
  getPremiumPlans,
  subscribeToPremium,
} from "@/services/premium.service";
import { PremiumPlanDetails, SubscribeDto } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PremiumPlansProps {
  birdId: string;
  onSubscriptionComplete?: () => void;
}

export default function PremiumPlans({
  birdId,
  onSubscriptionComplete,
}: PremiumPlansProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<PremiumPlanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPremiumPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
      Alert.alert(t("premium.error"), t("premium.failedToLoadPlans"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: PremiumPlanDetails) => {
    if (!user) {
      Alert.alert(t("premium.loginRequired"), t("premium.loginToSubscribe"));
      return;
    }

    setSelectedPlan(plan.id);
    setSubscribing(true);

    try {
      // TODO: Integrate with actual payment provider (Stripe, Apple Pay, etc.)
      // For now, we'll show a placeholder
      Alert.alert(
        t("premium.paymentRequired"),
        t("premium.selectPaymentMethod"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => {
              setSubscribing(false);
              setSelectedPlan(null);
            },
          },
          {
            text: "Stripe (Credit Card)",
            onPress: () => handleStripePayment(plan),
          },
          {
            text: "Crypto",
            onPress: () => handleCryptoPayment(plan),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error subscribing:", error);
      Alert.alert(
        t("premium.error"),
        error.message || t("premium.subscriptionFailed")
      );
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const handleStripePayment = async (plan: PremiumPlanDetails) => {
    try {
      // TODO: Integrate Stripe payment flow
      // This is a placeholder - you'll need to implement Stripe checkout
      const paymentMethodId = "pm_placeholder"; // Get from Stripe

      const dto: SubscribeDto = {
        birdId,
        provider: "stripe",
        plan: plan.id,
        paymentMethodId,
      };

      const result = await subscribeToPremium(dto);

      Alert.alert(t("premium.success"), t("premium.subscriptionActive"), [
        {
          text: t("common.ok"),
          onPress: () => {
            onSubscriptionComplete?.();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(t("premium.error"), error.message);
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const handleCryptoPayment = async (plan: PremiumPlanDetails) => {
    try {
      // TODO: Integrate crypto payment flow
      const dto: SubscribeDto = {
        birdId,
        provider: "crypto",
        plan: plan.id,
        cryptoCurrency: "USDC",
        cryptoNetwork: "solana",
      };

      const result = await subscribeToPremium(dto);

      Alert.alert(t("premium.success"), t("premium.subscriptionActive"), [
        {
          text: t("common.ok"),
          onPress: () => {
            onSubscriptionComplete?.();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(t("premium.error"), error.message);
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "monthly":
        return "calendar";
      case "yearly":
        return "trophy";
      case "lifetime":
        return "infinite";
      default:
        return "star";
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "monthly":
        return "#4ECDC4";
      case "yearly":
        return "#FFB84D";
      case "lifetime":
        return "#FF6B6B";
      default:
        return "#4ECDC4";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("premium.loadingPlans")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="sparkles" size={48} color="#FFD700" />
        <Text style={styles.title}>{t("premium.celebrateYourBird")}</Text>
        <Text style={styles.subtitle}>
          {t("premium.enhanceExperienceSupport")}
        </Text>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map((plan, index) => {
          const isPopular = plan.id === "yearly";
          const planColor = getPlanColor(plan.id);

          return (
            <View
              key={plan.id}
              style={[styles.planCard, isPopular && styles.popularPlanCard]}
            >
              {isPopular && (
                <View
                  style={[styles.popularBadge, { backgroundColor: planColor }]}
                >
                  <Text style={styles.popularBadgeText}>
                    {t("premium.mostPopular")}
                  </Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Ionicons
                  name={getPlanIcon(plan.id) as any}
                  size={32}
                  color={planColor}
                />
                <Text style={styles.planName}>{plan.name}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: planColor }]}>
                  ${plan.price}
                </Text>
                {plan.interval !== "lifetime" && (
                  <Text style={styles.priceInterval}>
                    /
                    {plan.interval === "month"
                      ? t("premium.month")
                      : t("premium.year")}
                  </Text>
                )}
              </View>

              {plan.savings && (
                <View
                  style={[
                    styles.savingsBadge,
                    { backgroundColor: `${planColor}20` },
                  ]}
                >
                  <Text style={[styles.savingsText, { color: planColor }]}>
                    {plan.savings}
                  </Text>
                </View>
              )}

              <Text style={styles.planDescription}>{plan.description}</Text>

              {/* Charity Allocation */}
              {plan.charityAllocation && (
                <View style={styles.charityBadge}>
                  <Ionicons name="heart" size={14} color="#FF6B6B" />
                  <Text style={styles.charityText}>
                    {plan.charityAllocation}% {t("premium.supportsCharities")}
                  </Text>
                </View>
              )}

              {/* Features */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={planColor}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  { backgroundColor: planColor },
                  subscribing &&
                    selectedPlan === plan.id &&
                    styles.subscribingButton,
                ]}
                onPress={() => handleSubscribe(plan)}
                disabled={subscribing}
              >
                {subscribing && selectedPlan === plan.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.subscribeButtonText}>
                      {t("premium.subscribe")}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("premium.cancelAnytime")}</Text>
        <Text style={styles.footerSubtext}>
          {t("premium.noPressureMessage")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#E8F8F7",
    position: "relative",
  },
  popularPlanCard: {
    borderColor: "#FFB84D",
    shadowColor: "#FFB84D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: [{ translateX: -60 }],
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  price: {
    fontSize: 42,
    fontWeight: "800",
  },
  priceInterval: {
    fontSize: 16,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  savingsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "600",
  },
  planDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    marginBottom: 16,
    lineHeight: 20,
  },
  charityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  charityText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#2C3E50",
    flex: 1,
    lineHeight: 20,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribingButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 13,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 18,
  },
});
