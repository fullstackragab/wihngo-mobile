import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { payoutService } from "@/services/payout.service";
import { PayoutMethodType } from "@/types/payout";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCryptoMethod() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    methodType: string;
    currency: string;
    network: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const methodType = params.methodType as PayoutMethodType;
  const currency = params.currency || "USDC";
  const network = params.network || "solana-mainnet";

  const getMethodConfig = () => {
    const isSolana = methodType === "Solana" || network.includes("solana");
    const isBase = methodType === "Base" || network.includes("base");

    return {
      title: `${currency} on ${
        isSolana ? "Solana" : isBase ? "Base" : "Crypto"
      }`,
      currency,
      network: isSolana ? "Solana" : isBase ? "Base" : "Crypto",
      networkId: network,
      icon: currency === "EURC" ? "💶" : "💵",
      color: isSolana ? "#14F195" : isBase ? "#0052FF" : "#4ECDC4",
      addressLength: isSolana ? 44 : 42,
      addressPrefix: isSolana ? "" : "0x",
      description: isSolana
        ? `Circle ${currency} Coin on Solana network`
        : isBase
        ? `Circle ${currency} Coin on Base network (Ethereum L2)`
        : "Cryptocurrency wallet",
    };
  };

  const config = getMethodConfig();

  const validateAddress = (address: string): boolean => {
    if (!address || address.length < 32) {
      return false;
    }

    // Solana address validation
    if (config.network === "Solana") {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    // Base/Ethereum address validation
    if (config.network === "Base") {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    return false;
  };

  const handleSubmit = async () => {
    // Validation
    if (!walletAddress.trim()) {
      Alert.alert("Error", "Please enter your wallet address");
      return;
    }

    if (!validateAddress(walletAddress.trim())) {
      Alert.alert(
        "Error",
        `Please enter a valid ${config.network} wallet address`
      );
      return;
    }

    setLoading(true);
    try {
      await payoutService.addPayoutMethod({
        methodType: methodType as PayoutMethodType,
        walletAddress: walletAddress.trim(),
        network: config.networkId,
        currency: config.currency,
        isDefault: true,
      });

      Alert.alert(
        "Success",
        `${config.title} payment method added successfully`,
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
              router.back(); // Go back twice to return to payout settings
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Failed to add crypto method:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add payment method. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.color + "20" },
            ]}
          >
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.description}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What you need:</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>
                {config.network}-compatible wallet
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>
                Ability to receive {config.currency} tokens
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>Your wallet address</Text>
            </View>
          </View>
        </View>

        {/* Network Info */}
        <View style={styles.networkCard}>
          <View style={styles.networkHeader}>
            <Ionicons name="analytics" size={20} color={config.color} />
            <Text style={styles.networkTitle}>Network Details</Text>
          </View>
          <View style={styles.networkDetails}>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Network:</Text>
              <Text style={styles.networkValue}>{config.network}</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Token:</Text>
              <Text style={styles.networkValue}>{config.currency}</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Type:</Text>
              <Text style={styles.networkValue}>
                Stablecoin (1:1 with{" "}
                {config.currency === "USDC" ? "USD" : "EUR"})
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {config.network} Wallet Address{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                config.network === "Solana" ? "7xKXtg2CW..." : "0x1234567890..."
              }
              value={walletAddress}
              onChangeText={setWalletAddress}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              numberOfLines={2}
            />
            <Text style={styles.hint}>
              {config.addressPrefix &&
                `Must start with ${config.addressPrefix}. `}
              Double-check your address before submitting
            </Text>
          </View>
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={24} color="#F39C12" />
            <Text style={styles.warningTitle}>Important</Text>
          </View>
          <View style={styles.warningList}>
            <Text style={styles.warningText}>
              • Verify your wallet address carefully
            </Text>
            <Text style={styles.warningText}>
              • Wrong address = lost funds (not recoverable)
            </Text>
            <Text style={styles.warningText}>
              • Only use {config.network} wallets
            </Text>
            <Text style={styles.warningText}>
              • Ensure your wallet can receive {config.currency}
            </Text>
          </View>
        </View>

        {/* Supported Wallets */}
        <View style={styles.walletsCard}>
          <Text style={styles.walletsTitle}>
            Popular {config.network} Wallets:
          </Text>
          <View style={styles.walletsList}>
            {config.network === "Solana" ? (
              <>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>Phantom</Text>
                  <Text style={styles.walletTag}>Recommended</Text>
                </View>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>Solflare</Text>
                </View>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>Backpack</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>Coinbase Wallet</Text>
                  <Text style={styles.walletTag}>Recommended</Text>
                </View>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>MetaMask</Text>
                </View>
                <View style={styles.walletItem}>
                  <Text style={styles.walletName}>Rainbow</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Fees Info */}
        <View style={styles.feesCard}>
          <Text style={styles.feesTitle}>Transaction Fees</Text>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Network fee:</Text>
            <Text style={styles.feesValue}>
              {config.network === "Solana" ? "<$0.01" : "~$0.01"}
            </Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Processing time:</Text>
            <Text style={styles.feesValue}>
              {config.network === "Solana" ? "~1 second" : "~10 seconds"}
            </Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Wihngo platform fee:</Text>
            <Text style={styles.feesValue}>5%</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Adding...</Text>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Add Payment Method</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: "#fff",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: "#7F8C8D",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#E8F8F5",
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: Typography.h3,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: Spacing.sm,
  },
  infoList: {
    gap: Spacing.xs,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    flex: 1,
  },
  networkCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  networkTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
  },
  networkDetails: {
    gap: Spacing.sm,
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  networkLabel: {
    fontSize: Typography.small,
    color: "#7F8C8D",
  },
  networkValue: {
    fontSize: Typography.small,
    fontWeight: "600",
    color: "#2C3E50",
  },
  form: {
    padding: Spacing.md,
  },
  formGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
  },
  required: {
    color: "#E74C3C",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: Typography.small,
    color: "#2C3E50",
    fontFamily: "monospace",
    minHeight: 60,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: Typography.small,
    color: "#95A5A6",
  },
  warningCard: {
    backgroundColor: "#FFF8E1",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFEB3B",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  warningTitle: {
    fontSize: Typography.body,
    fontWeight: "bold",
    color: "#F39C12",
  },
  warningList: {
    gap: 4,
  },
  warningText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    lineHeight: 18,
  },
  walletsCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  walletsTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: Spacing.sm,
  },
  walletsList: {
    gap: Spacing.sm,
  },
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.sm,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  walletName: {
    fontSize: Typography.small,
    color: "#2C3E50",
  },
  walletTag: {
    fontSize: 10,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  feesCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  feesTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: Spacing.sm,
  },
  feesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  feesLabel: {
    fontSize: Typography.small,
    color: "#7F8C8D",
  },
  feesValue: {
    fontSize: Typography.small,
    fontWeight: "600",
    color: "#2C3E50",
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: Typography.h3,
    fontWeight: "bold",
  },
});
