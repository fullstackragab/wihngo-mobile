import { theme } from "@/constants/theme";
import {
  cancelBirdPremium,
  getBirdPremiumStatus,
  subscribeBirdToPremium,
} from "@/services/premium.service";
import { BirdPremiumSubscription } from "@/types/premium";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PremiumSubscriptionManagerProps = {
  birdId: string;
  ownerId: string;
  onStatusChange?: () => void;
};

export function PremiumSubscriptionManager({
  birdId,
  ownerId,
  onStatusChange,
}: PremiumSubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] =
    useState<BirdPremiumSubscription | null>(null);

  const loadSubscriptionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await getBirdPremiumStatus(birdId);
      setIsPremium(status.isPremium);
      setSubscription(status.subscription || null);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [birdId]);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  const handleSubscribe = async () => {
    Alert.alert(
      "Subscribe to Premium",
      "Upgrade this bird to premium for $4.99/month?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Subscribe",
          onPress: async () => {
            setIsLoading(true);
            try {
              await subscribeBirdToPremium(birdId, {
                birdId,
                provider: "stripe",
                plan: "monthly",
              });
              Alert.alert("Success", "Successfully subscribed to premium!");
              await loadSubscriptionStatus();
              onStatusChange?.();
            } catch (error) {
              console.error("Failed to subscribe:", error);
              Alert.alert("Error", "Failed to subscribe. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Premium",
      "Are you sure you want to cancel premium for this bird? You'll lose all premium features.",
      [
        { text: "Keep Premium", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await cancelBirdPremium(birdId);
              Alert.alert(
                "Cancelled",
                "Premium subscription has been cancelled."
              );
              await loadSubscriptionStatus();
              onStatusChange?.();
            } catch (error) {
              console.error("Failed to cancel:", error);
              Alert.alert(
                "Error",
                "Failed to cancel subscription. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isPremium) {
    return null; // Show upgrade card instead
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={24} color={theme.colors.accent} />
        <Text style={styles.title}>Premium Subscription</Text>
      </View>

      <View style={styles.info}>
        <InfoRow
          label="Status"
          value={getStatusLabel(subscription?.status || "active")}
        />
        <InfoRow label="Plan" value="Monthly ($4.99/month)" />
        {subscription?.currentPeriodEnd && (
          <InfoRow
            label="Renews"
            value={new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          />
        )}
        {subscription?.provider && (
          <InfoRow
            label="Provider"
            value={subscription.provider.toUpperCase()}
          />
        )}
      </View>

      <Pressable
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={isLoading}
      >
        <Ionicons name="close-circle-outline" size={20} color="#fff" />
        <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        You can cancel anytime. Premium features will remain active until the
        end of your billing period.
      </Text>
    </View>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "✅ Active",
    canceled: "🚫 Canceled",
    past_due: "⚠️ Past Due",
    expired: "❌ Expired",
  };
  return labels[status] || status;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border || "#e0e0e0",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  info: {
    gap: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  cancelButton: {
    backgroundColor: theme.colors.error || "#f44336",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 16,
  },
});
