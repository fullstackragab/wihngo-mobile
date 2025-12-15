import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { PayoutMethod, PayoutMethodType } from "@/types/payout";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PayoutSettings() {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    nextPayoutDate: "",
    minimumReached: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadPayoutData();
    }
  }, [isAuthenticated]);

  const loadPayoutData = async () => {
    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // const methods = await payoutService.getPayoutMethods();
      // const balanceData = await payoutService.getBalance();
      // setPayoutMethods(methods);
      // setBalance({
      //   available: balanceData.availableBalance,
      //   pending: balanceData.pendingBalance,
      //   nextPayoutDate: balanceData.nextPayoutDate,
      //   minimumReached: balanceData.minimumReached,
      // });

      // Mock data for now
      setPayoutMethods([]);
      setBalance({
        available: 0,
        pending: 0,
        nextPayoutDate: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        minimumReached: false,
      });
    } catch (error) {
      console.error("Failed to load payout data:", error);
      Alert.alert(t("payout.error"), t("payout.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (type: PayoutMethodType): string => {
    switch (type) {
      case "iban":
        return "card-outline";
      case "paypal":
        return "logo-paypal";
      case "usdc-solana":
      case "eurc-solana":
      case "usdc-base":
      case "eurc-base":
        return "wallet-outline";
      default:
        return "cash-outline";
    }
  };

  const getMethodLabel = (method: PayoutMethod): string => {
    switch (method.methodType) {
      case "iban":
        return `IBAN •••• ${method.iban?.slice(-4) || "****"}`;
      case "paypal":
        return method.paypalEmail || "PayPal";
      case "usdc-solana":
        return `USDC (Solana) •••${method.walletAddress?.slice(-4) || "****"}`;
      case "eurc-solana":
        return `EURC (Solana) •••${method.walletAddress?.slice(-4) || "****"}`;
      case "usdc-base":
        return `USDC (Base) •••${method.walletAddress?.slice(-4) || "****"}`;
      case "eurc-base":
        return `EURC (Base) •••${method.walletAddress?.slice(-4) || "****"}`;
      default:
        return "Unknown";
    }
  };

  const handleAddMethod = () => {
    router.push("/add-payout-method");
  };

  const handleDeleteMethod = (methodId: string) => {
    Alert.alert(t("payout.deleteMethod"), t("payout.deleteConfirm"), [
      { text: t("payout.cancel"), style: "cancel" },
      {
        text: t("payout.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Uncomment when backend is ready
            // await payoutService.deletePayoutMethod(methodId);
            await loadPayoutData();
            Alert.alert(t("payout.success"), t("payout.methodDeleted"));
          } catch (error) {
            Alert.alert(t("payout.error"), t("payout.deleteFailed"));
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      // TODO: Uncomment when backend is ready
      // await payoutService.setDefaultPayoutMethod(methodId);
      await loadPayoutData();
      Alert.alert(t("payout.success"), t("payout.defaultUpdated"));
    } catch (error) {
      Alert.alert(t("payout.error"), t("payout.updateFailed"));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color="#BDC3C7" />
        <Text style={styles.emptyText}>{t("payout.pleaseLogin")}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>{t("payout.loadingSettings")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>{t("payout.yourBalance")}</Text>
        <Text style={styles.balanceAmount}>
          €{balance.available.toFixed(2)}
        </Text>
        <Text style={styles.balanceSubtext}>
          {balance.pending > 0 &&
            `€${balance.pending.toFixed(2)} ${t("payout.pending")} • `}
          {t("payout.nextPayout")}: {formatDate(balance.nextPayoutDate)}
        </Text>
        {!balance.minimumReached && (
          <View style={styles.minimumNotice}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#F39C12"
            />
            <Text style={styles.minimumText}>{t("payout.minimumPayout")}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/payout-history")}
        >
          <Ionicons name="time-outline" size={16} color="#4ECDC4" />
          <Text style={styles.historyButtonText}>
            {t("payout.viewHistory")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Platform Fee Notice */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color="#3498DB" />
          <Text style={styles.infoTitle}>{t("payout.howPayoutsWork")}</Text>
        </View>
        <Text style={styles.infoText}>
          • {t("payout.platformFee")}
          {"\n"}• {t("payout.youReceive")}
          {"\n"}• {t("payout.providerFees")}
          {"\n"}• {t("payout.minimumAmount")}
          {"\n"}•{t("payout.frequency")}
          {"\n"}• {t("payout.taxResponsibility")}
        </Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("payout.paymentMethods")}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{t("payout.addMethod")}</Text>
          </TouchableOpacity>
        </View>

        {payoutMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#BDC3C7" />
            <Text style={styles.emptyText}>{t("payout.noMethods")}</Text>
            <Text style={styles.emptySubtext}>
              {t("payout.addMethodPrompt")}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddMethod}
            >
              <Text style={styles.emptyButtonText}>
                {t("payout.addPaymentMethod")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {payoutMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodLeft}>
                    <Ionicons
                      name={getMethodIcon(method.methodType) as any}
                      size={24}
                      color="#2C3E50"
                    />
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>
                        {getMethodLabel(method)}
                      </Text>
                      <View style={styles.methodBadges}>
                        {method.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>
                              {t("payout.default")}
                            </Text>
                          </View>
                        )}
                        {method.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color="#27AE60"
                            />
                            <Text style={styles.verifiedBadgeText}>
                              {t("payout.verified")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteMethod(method.id!)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id!)}
                  >
                    <Text style={styles.setDefaultButtonText}>
                      {t("payout.setAsDefault")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Legal Notice */}
      <View style={styles.legalCard}>
        <Text style={styles.legalTitle}>{t("payout.legalInfo")}</Text>
        <Text style={styles.legalText}>{t("payout.legalNotice")}</Text>
      </View>
    </ScrollView>
  );
}

const isRTL = I18nManager.isRTL;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: "#7F8C8D",
  },
  balanceCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: Typography.small,
    color: "#7F8C8D",
    marginBottom: Spacing.xs,
    textAlign: isRTL ? "right" : "left",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: Spacing.xs,
  },
  balanceSubtext: {
    fontSize: Typography.small,
    color: "#95A5A6",
    textAlign: isRTL ? "right" : "left",
  },
  minimumNotice: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
  },
  minimumText: {
    fontSize: Typography.small,
    color: "#F39C12",
    flex: 1,
    textAlign: isRTL ? "right" : "left",
  },
  historyButton: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  historyButtonText: {
    fontSize: Typography.small,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#E8F4FD",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#3498DB",
    textAlign: isRTL ? "right" : "left",
  },
  infoText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    lineHeight: 20,
    textAlign: isRTL ? "right" : "left",
  },
  section: {
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h2,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: isRTL ? "right" : "left",
  },
  addButton: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: Typography.small,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.h3,
    color: "#7F8C8D",
    marginTop: Spacing.md,
    textAlign: isRTL ? "right" : "left",
  },
  emptySubtext: {
    fontSize: Typography.small,
    color: "#95A5A6",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: Spacing.lg,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: Typography.body,
    fontWeight: "600",
  },
  methodsList: {
    gap: Spacing.md,
  },
  methodCard: {
    backgroundColor: "#fff",
    padding: Spacing.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLeft: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: Spacing.xs,
    textAlign: isRTL ? "right" : "left",
  },
  methodBadges: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: Spacing.xs,
  },
  defaultBadge: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  verifiedBadge: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#D5F4E6",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    color: "#27AE60",
    fontSize: 10,
    fontWeight: "600",
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  setDefaultButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  setDefaultButtonText: {
    color: "#4ECDC4",
    fontSize: Typography.small,
    fontWeight: "600",
  },
  legalCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  legalTitle: {
    fontSize: Typography.small,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: Spacing.xs,
    textAlign: isRTL ? "right" : "left",
  },
  legalText: {
    fontSize: 11,
    color: "#7F8C8D",
    lineHeight: 16,
    textAlign: isRTL ? "right" : "left",
  },
});
