import { useAuth } from "@/contexts/auth-context";
import {
  createCryptoPayment,
  pollPaymentStatus,
} from "@/services/crypto.service";
import { createSupportTransaction } from "@/services/support.service";
import {
  CryptoCurrency,
  CryptoNetwork,
  CryptoPaymentRequest,
} from "@/types/crypto";
import { SupportAmount } from "@/types/support";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CryptoPaymentQR from "./crypto-payment-qr";
import CryptoPaymentStatus from "./crypto-payment-status";

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  birdId?: string;
  birdName?: string;
  isPlatformSupport?: boolean;
}

export default function SupportModal({
  visible,
  onClose,
  birdId,
  birdName,
  isPlatformSupport = false,
}: SupportModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "crypto" | null
  >(null);
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoCurrency | null>(
    null
  );
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork | null>(
    null
  );
  const [cryptoPayment, setCryptoPayment] =
    useState<CryptoPaymentRequest | null>(null);
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);
  const [showPlatformSupport, setShowPlatformSupport] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const { user } = useAuth();

  const supportAmounts = [
    { value: SupportAmount.Small, label: "$5", emoji: "☕" },
    { value: SupportAmount.Medium, label: "$10", emoji: "🍕" },
    { value: SupportAmount.Large, label: "$25", emoji: "🎁" },
    { value: SupportAmount.Generous, label: "$50", emoji: "💝" },
    { value: SupportAmount.VeryGenerous, label: "$100", emoji: "🌟" },
  ];

  const handleCryptoPayment = async (amount: number) => {
    if (!user) {
      Alert.alert("Error", "Please login to support");
      return;
    }

    setSelectedAmount(amount);
    setPaymentMethod("crypto");
    setShowCryptoSelector(true);
  };

  const handleCryptoSelection = async (
    currency: CryptoCurrency,
    network: CryptoNetwork
  ) => {
    if (!selectedAmount) return;

    try {
      setIsProcessing(true);
      setCryptoCurrency(currency);
      setCryptoNetwork(network);
      setShowCryptoSelector(false);

      // Create crypto payment request
      const response = await createCryptoPayment({
        birdId: isPlatformSupport ? undefined : birdId,
        amountUsd: selectedAmount,
        currency,
        network,
        purpose: "donation",
      });

      setCryptoPayment(response.paymentRequest);

      // Start polling for payment status
      startPaymentPolling(response.paymentRequest.id);
    } catch (error) {
      console.error("Error creating crypto payment:", error);
      Alert.alert("Error", "Failed to create crypto payment request");
      resetPaymentState();
    } finally {
      setIsProcessing(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const updatedPayment = await pollPaymentStatus(paymentId);
        setCryptoPayment(updatedPayment);

        if (updatedPayment.status === "completed") {
          clearInterval(pollInterval);

          // Record the transaction
          await createSupportTransaction({
            supporterId: user!.userId,
            birdId: isPlatformSupport ? undefined : birdId,
            amount: selectedAmount!,
            paymentProvider: "Crypto",
            paymentId: updatedPayment.transactionHash || paymentId,
            status: "completed",
          });

          Alert.alert(
            "Success",
            `Thank you for supporting ${
              isPlatformSupport ? "Wihngo" : birdName
            }! Your crypto payment has been confirmed.`
          );

          setTimeout(() => {
            onClose();
            resetPaymentState();
          }, 2000);
        } else if (
          updatedPayment.status === "expired" ||
          updatedPayment.status === "failed"
        ) {
          clearInterval(pollInterval);
          Alert.alert(
            "Payment " +
              (updatedPayment.status === "expired" ? "Expired" : "Failed"),
            "Please try again or use a different payment method."
          );
          resetPaymentState();
        }
      } catch (error) {
        console.error("Error polling payment:", error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  };

  const resetPaymentState = () => {
    setSelectedAmount(null);
    setPaymentMethod(null);
    setCryptoCurrency(null);
    setCryptoNetwork(null);
    setCryptoPayment(null);
    setShowCryptoSelector(false);
    setShowPlatformSupport(false);
    setCustomAmount("");
    setIsProcessing(false);
  };

  const handlePlatformPayPal = async () => {
    const paypalUrl = "https://www.paypal.com/ncp/payment/AECE9FQMFFETS";
    const canOpen = await Linking.canOpenURL(paypalUrl);
    if (canOpen) {
      await Linking.openURL(paypalUrl);
      onClose();
      resetPaymentState();
    } else {
      Alert.alert("Error", "Cannot open PayPal");
    }
  };

  const handlePlatformCrypto = () => {
    const amount = parseFloat(customAmount);
    if (!customAmount || isNaN(amount) || amount < 5) {
      Alert.alert("Invalid Amount", "Please enter an amount of at least $5");
      return;
    }
    setSelectedAmount(amount);
    setPaymentMethod("crypto");
    setShowCryptoSelector(true);
  };

  const handlePayPalPayment = async (amount: number) => {
    if (!user) {
      Alert.alert("Error", "Please login to support");
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedAmount(amount);

      // PayPal payment URL (you'll need to configure this with your PayPal credentials)
      const paypalUrl = `https://www.paypal.com/paypalme/yourpaypalhandle/${amount}`;

      // Open PayPal in browser
      const canOpen = await Linking.canOpenURL(paypalUrl);
      if (canOpen) {
        await Linking.openURL(paypalUrl);

        // Simulate payment completion (in production, you'd use PayPal SDK or webhook)
        // For now, we'll create the transaction record immediately
        setTimeout(async () => {
          try {
            await createSupportTransaction({
              supporterId: user.userId,
              birdId: isPlatformSupport ? undefined : birdId,
              amount: amount,
              paymentProvider: "PayPal",
              paymentId: `PAYPAL_${Date.now()}`, // Replace with actual PayPal transaction ID
              status: "completed",
            });

            Alert.alert(
              "Success",
              `Thank you for supporting ${
                isPlatformSupport ? "Wihngo" : birdName
              }!`
            );
            onClose();
          } catch (error) {
            console.error("Error recording transaction:", error);
            Alert.alert("Error", "Failed to record transaction");
          } finally {
            setIsProcessing(false);
            setSelectedAmount(null);
          }
        }, 2000);
      } else {
        Alert.alert("Error", "Cannot open PayPal");
        setIsProcessing(false);
        setSelectedAmount(null);
      }
    } catch (error) {
      console.error("PayPal error:", error);
      Alert.alert("Error", "Failed to process payment");
      setIsProcessing(false);
      setSelectedAmount(null);
    }
  };

  // Network Selector Component
  const NetworkSelector = ({
    selectedAmount,
    onSelect,
    onBack,
  }: {
    selectedAmount: number;
    onSelect: (currency: CryptoCurrency, network: CryptoNetwork) => void;
    onBack: () => void;
  }) => {
    const [selectedCurrency, setSelectedCurrency] =
      useState<CryptoCurrency | null>(null);

    const currencies = [
      {
        code: "BTC" as CryptoCurrency,
        name: "Bitcoin",
        icon: "bitcoin",
        networks: ["bitcoin" as CryptoNetwork],
      },
      {
        code: "ETH" as CryptoCurrency,
        name: "Ethereum",
        icon: "ethereum",
        networks: ["ethereum" as CryptoNetwork],
      },
      {
        code: "USDT" as CryptoCurrency,
        name: "Tether",
        icon: "dollar-sign",
        networks: [
          "ethereum" as CryptoNetwork,
          "tron" as CryptoNetwork,
          "binance-smart-chain" as CryptoNetwork,
        ],
      },
      {
        code: "USDC" as CryptoCurrency,
        name: "USD Coin",
        icon: "dollar-sign",
        networks: [
          "ethereum" as CryptoNetwork,
          "polygon" as CryptoNetwork,
          "binance-smart-chain" as CryptoNetwork,
        ],
      },
    ];

    const getNetworkDisplayName = (network: CryptoNetwork): string => {
      const names: Record<CryptoNetwork, string> = {
        bitcoin: "Bitcoin",
        ethereum: "Ethereum (ERC20)",
        "binance-smart-chain": "BSC (BEP20)",
        tron: "Tron (TRC20)",
        polygon: "Polygon",
        solana: "Solana",
      };
      return names[network] || network;
    };

    return (
      <View>
        <Text style={styles.selectorTitle}>Select Cryptocurrency</Text>
        <Text style={styles.selectorSubtitle}>Amount: ${selectedAmount}</Text>

        {!selectedCurrency ? (
          <View style={styles.currencyList}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={styles.currencyCard}
                onPress={() => {
                  if (currency.networks.length === 1) {
                    onSelect(currency.code, currency.networks[0]);
                  } else {
                    setSelectedCurrency(currency.code);
                  }
                }}
              >
                <FontAwesome6
                  name={currency.icon as any}
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.code}</Text>
                {currency.networks.length > 1 && (
                  <Feather name="chevron-right" size={20} color="#999" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCurrency(null)}
            >
              <Feather name="arrow-left" size={20} color="#007AFF" />
              <Text style={styles.backButtonText}>Back to currencies</Text>
            </TouchableOpacity>

            <Text style={styles.networkTitle}>Select Network</Text>
            <View style={styles.networkList}>
              {currencies
                .find((c) => c.code === selectedCurrency)
                ?.networks.map((network) => (
                  <TouchableOpacity
                    key={network}
                    style={styles.networkCard}
                    onPress={() => onSelect(selectedCurrency, network)}
                  >
                    <Text style={styles.networkName}>
                      {getNetworkDisplayName(network)}
                    </Text>
                    <Feather name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isPlatformSupport ? "Support Wihngo" : `Support ${birdName}`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
                resetPaymentState();
              }}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Show crypto payment flow if active */}
            {cryptoPayment ? (
              <View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={resetPaymentState}
                >
                  <Feather name="arrow-left" size={20} color="#007AFF" />
                  <Text style={styles.backButtonText}>Back to amounts</Text>
                </TouchableOpacity>

                <CryptoPaymentQR
                  payment={cryptoPayment}
                  onExpired={resetPaymentState}
                />

                <CryptoPaymentStatus payment={cryptoPayment} />
              </View>
            ) : showCryptoSelector ? (
              <View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowCryptoSelector(false)}
                >
                  <Feather name="arrow-left" size={20} color="#007AFF" />
                  <Text style={styles.backButtonText}>Back to amounts</Text>
                </TouchableOpacity>

                <NetworkSelector
                  selectedAmount={selectedAmount!}
                  onSelect={handleCryptoSelection}
                  onBack={() => setShowCryptoSelector(false)}
                />
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  {isPlatformSupport
                    ? "Help us keep Wihngo running and support bird conservation!"
                    : "Choose an amount to support this amazing bird"}
                </Text>

                <View style={styles.amountsContainer}>
                  {supportAmounts.map((item) => (
                    <View key={item.value} style={styles.amountGroup}>
                      <Text style={styles.amountHeader}>{item.label}</Text>

                      <View style={styles.paymentMethodsRow}>
                        {/* PayPal Button */}
                        <TouchableOpacity
                          style={[
                            styles.paymentMethodButton,
                            selectedAmount === item.value &&
                              paymentMethod === "paypal" &&
                              styles.paymentMethodButtonSelected,
                          ]}
                          onPress={() => handlePayPalPayment(item.value)}
                          disabled={isProcessing}
                          activeOpacity={0.7}
                        >
                          {isProcessing &&
                          selectedAmount === item.value &&
                          paymentMethod === "paypal" ? (
                            <ActivityIndicator size="small" color="#0070ba" />
                          ) : (
                            <>
                              <FontAwesome6
                                name="paypal"
                                size={20}
                                color="#0070ba"
                              />
                              <Text style={styles.paymentMethodText}>
                                PayPal
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>

                        {/* Crypto Button */}
                        <TouchableOpacity
                          style={[
                            styles.paymentMethodButton,
                            selectedAmount === item.value &&
                              paymentMethod === "crypto" &&
                              styles.paymentMethodButtonSelected,
                          ]}
                          onPress={() => handleCryptoPayment(item.value)}
                          disabled={isProcessing}
                          activeOpacity={0.7}
                        >
                          {isProcessing &&
                          selectedAmount === item.value &&
                          paymentMethod === "crypto" ? (
                            <ActivityIndicator size="small" color="#f7931a" />
                          ) : (
                            <>
                              <FontAwesome6
                                name="bitcoin"
                                size={20}
                                color="#f7931a"
                              />
                              <Text style={styles.paymentMethodText}>
                                Crypto
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {!isPlatformSupport && (
                  <View style={styles.platformSupportSection}>
                    <View style={styles.divider} />
                    <Text style={styles.platformSupportTitle}>
                      ❤️ Also Support Wihngo Platform
                    </Text>
                    <Text style={styles.platformSupportText}>
                      Help us continue building features for bird lovers!
                    </Text>

                    {!showPlatformSupport ? (
                      <TouchableOpacity
                        style={styles.platformButton}
                        onPress={() => setShowPlatformSupport(true)}
                      >
                        <Feather name="gift" size={20} color="#fff" />
                        <Text style={styles.platformButtonText}>
                          Support Wihngo
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.platformPaymentContainer}>
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => {
                            setShowPlatformSupport(false);
                            setCustomAmount("");
                          }}
                        >
                          <Feather
                            name="arrow-left"
                            size={20}
                            color="#007AFF"
                          />
                          <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>

                        <Text style={styles.customAmountLabel}>
                          Enter Amount (USD)
                        </Text>
                        <TextInput
                          style={styles.customAmountInput}
                          placeholder="e.g., 10"
                          keyboardType="decimal-pad"
                          value={customAmount}
                          onChangeText={setCustomAmount}
                        />
                        <Text style={styles.minAmountText}>Minimum: $5</Text>

                        <View style={styles.platformPaymentMethods}>
                          <TouchableOpacity
                            style={styles.platformPaymentButton}
                            onPress={handlePlatformPayPal}
                            disabled={isProcessing}
                          >
                            <FontAwesome6
                              name="paypal"
                              size={20}
                              color="#0070ba"
                            />
                            <Text style={styles.platformPaymentButtonText}>
                              Pay with PayPal
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.platformPaymentButton,
                              styles.cryptoButton,
                            ]}
                            onPress={handlePlatformCrypto}
                            disabled={isProcessing}
                          >
                            <FontAwesome6
                              name="bitcoin"
                              size={20}
                              color="#f7931a"
                            />
                            <Text style={styles.platformPaymentButtonText}>
                              Pay with Crypto
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.disclaimer}>
                  💳 Secure payment powered by PayPal & Crypto
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  amountsContainer: {
    gap: 16,
  },
  amountGroup: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  amountHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 12,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  paymentMethodButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f7ff",
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  amountCard: {
    width: "48%",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 12,
  },
  amountCardSelected: {
    borderColor: "#0070ba",
    backgroundColor: "#f0f7ff",
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  paypalBadge: {
    backgroundColor: "#0070ba",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paypalText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  selectorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  selectorSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  currencyList: {
    gap: 12,
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  currencyCode: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  networkTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  networkList: {
    gap: 12,
  },
  networkCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  networkName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  platformSupportSection: {
    marginTop: 24,
    paddingTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 20,
  },
  platformSupportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  platformSupportText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  platformButton: {
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  platformButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  platformPaymentContainer: {
    gap: 12,
  },
  customAmountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  customAmountInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  minAmountText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    marginBottom: 8,
  },
  platformPaymentMethods: {
    gap: 12,
    marginTop: 8,
  },
  platformPaymentButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0070ba",
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  platformPaymentButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  cryptoButton: {
    borderColor: "#f7931a",
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});
