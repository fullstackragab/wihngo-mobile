import { useNotifications } from "@/contexts/notification-context";
import {
  getSavedCryptoWallets,
  removeCryptoWallet,
  setDefaultCryptoWallet,
} from "@/services/crypto.service";
import { CryptoPaymentMethod } from "@/types/crypto";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentMethods() {
  const { t } = useTranslation();
  const [cryptoWallets, setCryptoWallets] = useState<CryptoPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiry: "12/25",
      isDefault: true,
    },
  ];

  useEffect(() => {
    loadCryptoWallets();
  }, []);

  const loadCryptoWallets = async () => {
    try {
      const wallets = await getSavedCryptoWallets();
      setCryptoWallets(wallets);
    } catch (error) {
      console.error("Failed to load crypto wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCryptoWallet = async (walletId: string) => {
    try {
      await removeCryptoWallet(walletId);
      await loadCryptoWallets();
    } catch (error) {
      addNotification(
        "recommendation",
        t("paymentMethods.removalFailed"),
        t("paymentMethods.removeWalletError")
      );
    }
  };

  const handleSetDefaultCryptoWallet = async (walletId: string) => {
    try {
      await setDefaultCryptoWallet(walletId);
      await loadCryptoWallets();
    } catch (error) {
      addNotification(
        "recommendation",
        t("paymentMethods.updateFailed"),
        t("paymentMethods.setDefaultError")
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Credit Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("paymentMethods.creditCards")}
        </Text>

        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="credit-card" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{t("paymentMethods.noCards")}</Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.cardInfo}>
                <FontAwesome6 name="credit-card" size={24} color="#007AFF" />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardBrand}>
                    {method.brand} •••• {method.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    {t("paymentMethods.expires")} {method.expiry}
                  </Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>
                    {t("paymentMethods.default")}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton}>
          <FontAwesome6 name="plus" size={16} color="#007AFF" />
          <Text style={styles.addButtonText}>
            {t("paymentMethods.addCard")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Crypto Wallets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("paymentMethods.cryptoWallets")}
          </Text>
          <View style={styles.cryptoBadge}>
            <FontAwesome6 name="bitcoin-sign" size={12} color="#F7931A" />
            <Text style={styles.cryptoBadgeText}>
              {t("paymentMethods.newBadge")}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : cryptoWallets.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="wallet" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {t("paymentMethods.noWallets")}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("paymentMethods.walletsSubtext")}
            </Text>
          </View>
        ) : (
          cryptoWallets.map((wallet) => (
            <View key={wallet.id} style={styles.paymentCard}>
              <View style={styles.cardInfo}>
                <FontAwesome6 name="wallet" size={24} color="#F7931A" />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardBrand}>
                    {wallet.label || `${wallet.currency} Wallet`}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    {wallet.walletAddress.slice(0, 6)}...
                    {wallet.walletAddress.slice(-4)}
                  </Text>
                </View>
              </View>
              <View style={styles.walletActions}>
                {wallet.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>
                      {t("paymentMethods.default")}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleRemoveCryptoWallet(wallet.id)}
                  style={styles.removeButton}
                >
                  <FontAwesome6 name="trash" size={14} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.addButton, styles.cryptoButton]}
          onPress={() => router.push("/crypto-payment")}
        >
          <FontAwesome6 name="bitcoin-sign" size={16} color="#F7931A" />
          <Text style={[styles.addButtonText, styles.cryptoButtonText]}>
            {t("paymentMethods.payWithCrypto")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Sections */}
      <View style={styles.infoSection}>
        <FontAwesome6 name="shield-halved" size={20} color="#28a745" />
        <Text style={styles.infoText}>{t("paymentMethods.securityInfo")}</Text>
      </View>

      <View style={styles.cryptoInfoSection}>
        <FontAwesome6 name="circle-info" size={20} color="#007AFF" />
        <View style={styles.cryptoInfoContent}>
          <Text style={styles.cryptoInfoTitle}>
            {t("paymentMethods.cryptoInfoTitle")}
          </Text>
          <Text style={styles.cryptoInfoText}>
            {t("paymentMethods.cryptoInfoText")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cryptoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cryptoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F7931A",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardDetails: {
    gap: 4,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  cardExpiry: {
    fontSize: 13,
    color: "#666",
  },
  walletActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeButton: {
    padding: 8,
  },
  defaultBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  cryptoButton: {
    borderColor: "#F7931A",
    backgroundColor: "#FFF3E0",
  },
  cryptoButtonText: {
    color: "#F7931A",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
  },
  cryptoInfoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  cryptoInfoContent: {
    flex: 1,
    gap: 4,
  },
  cryptoInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  cryptoInfoText: {
    fontSize: 12,
    color: "#007AFF",
    lineHeight: 18,
  },
});
