import { useAuth } from "@/contexts/auth-context";
import {
  cancelSubscription,
  getBirdCharityImpact,
  getPremiumStatus,
} from "@/services/premium.service";
import { CharityImpact, PremiumStatusResponse } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PremiumManagementCardProps {
  birdId: string;
  isOwner: boolean;
  onSubscriptionChange?: () => void;
}

export default function PremiumManagementCard({
  birdId,
  isOwner,
  onSubscriptionChange,
}: PremiumManagementCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const [premiumStatus, setPremiumStatus] =
    useState<PremiumStatusResponse | null>(null);
  const [charityImpact, setCharityImpact] = useState<CharityImpact | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadData();
  }, [birdId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [status, impact] = await Promise.all([
        getPremiumStatus(birdId),
        getBirdCharityImpact(birdId).catch(() => null),
      ]);

      setPremiumStatus(status);
      setCharityImpact(impact);
    } catch (error) {
      console.error("Error loading premium data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(t("premium.confirmCancel"), t("premium.cancelMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("premium.cancelSubscription"),
        style: "destructive",
        onPress: async () => {
          try {
            setCanceling(true);
            await cancelSubscription(birdId);

            Alert.alert(
              t("premium.success"),
              t("premium.subscriptionCanceled")
            );

            onSubscriptionChange?.();
            await loadData();
          } catch (error: any) {
            Alert.alert(t("premium.error"), error.message);
          } finally {
            setCanceling(false);
          }
        },
      },
    ]);
  };

  const handleCustomizeStyle = () => {
    router.push(`/premium-style-customizer?birdId=${birdId}`);
  };

  const handleViewCharityImpact = () => {
    router.push(`/charity-impact?birdId=${birdId}`);
  };

  const handleUpgrade = () => {
    router.push(`/premium-plans?birdId=${birdId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4ECDC4" />
      </View>
    );
  }

  if (!premiumStatus?.isPremium) {
    // Show upgrade card for non-premium birds
    if (!isOwner) return null;

    return (
      <View style={styles.upgradeCard}>
        <View style={styles.upgradeHeader}>
          <Ionicons name="sparkles" size={32} color="#FFD700" />
          <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
        </View>

        <Text style={styles.upgradeDescription}>
          Celebrate your bird with custom themes, unlimited photos, and support
          bird charities!
        </Text>

        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>{t("premium.viewPlans")}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const { subscription } = premiumStatus;
  const planName =
    subscription.plan === "monthly"
      ? "Monthly"
      : subscription.plan === "yearly"
      ? "Yearly"
      : "Lifetime";

  const currentPeriodEnd = new Date(
    subscription.currentPeriodEnd
  ).toLocaleDateString();
  const isCanceled = subscription.status === "canceled";

  return (
    <View style={styles.container}>
      {/* Premium Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statusBadgeText}>Premium Active</Text>
          </View>
          <Text style={styles.planName}>{planName} Plan</Text>
        </View>

        {isCanceled ? (
          <Text style={styles.expiryText}>Expires on {currentPeriodEnd}</Text>
        ) : (
          <Text style={styles.renewsText}>
            {subscription.plan === "lifetime"
              ? "Never expires"
              : `Renews on ${currentPeriodEnd}`}
          </Text>
        )}
      </View>

      {/* Charity Impact */}
      {charityImpact && (
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Ionicons name="heart" size={20} color="#FF6B6B" />
            <Text style={styles.impactTitle}>Your Impact</Text>
          </View>

          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                ${charityImpact.totalContributed.toFixed(2)}
              </Text>
              <Text style={styles.impactLabel}>Contributed</Text>
            </View>

            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                {charityImpact.birdsHelped}
              </Text>
              <Text style={styles.impactLabel}>Birds Helped</Text>
            </View>

            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                {charityImpact.sheltersSupported}
              </Text>
              <Text style={styles.impactLabel}>Shelters</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewCharityImpact}
          >
            <Text style={styles.viewMoreButtonText}>
              {t("premium.viewCharityImpact")}
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#4ECDC4" />
          </TouchableOpacity>
        </View>
      )}

      {/* Actions (Owner Only) */}
      {isOwner && (
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCustomizeStyle}
          >
            <Ionicons name="color-palette" size={20} color="#4ECDC4" />
            <Text style={styles.actionButtonText}>
              {t("premium.customizeAppearance")}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#BDC3C7" />
          </TouchableOpacity>

          {!isCanceled && subscription.plan !== "lifetime" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size="small" color="#E74C3C" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  <Text style={[styles.actionButtonText, styles.cancelText]}>
                    {t("premium.cancelSubscription")}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#BDC3C7" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  upgradeCard: {
    backgroundColor: "#FFF9E5",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  upgradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  upgradeDescription: {
    fontSize: 14,
    color: "#5D6D7E",
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  statusCard: {
    backgroundColor: "#E8F8F7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFB84D",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  renewsText: {
    fontSize: 13,
    color: "#5D6D7E",
  },
  expiryText: {
    fontSize: 13,
    color: "#E74C3C",
    fontWeight: "600",
  },
  impactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8F8F7",
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  impactStat: {
    alignItems: "center",
  },
  impactValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  impactLabel: {
    fontSize: 11,
    color: "#7F8C8D",
    marginTop: 4,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  viewMoreButtonText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E8F8F7",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cancelButton: {
    borderBottomWidth: 0,
  },
  actionButtonText: {
    fontSize: 15,
    color: "#2C3E50",
    fontWeight: "600",
    flex: 1,
  },
  cancelText: {
    color: "#E74C3C",
  },
});
