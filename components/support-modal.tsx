import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
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
import {
  calculateTotalAmount,
  MINIMUM_DONATION_AMOUNT,
  PLATFORM_FEE_PERCENTAGE,
} from "@/types/support";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount or when modal closes
  useEffect(() => {
    if (!visible) {
      stopPaymentPolling();
      resetPaymentState();
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);

  // Handle amount input changes and calculate fees
  const handleAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      const { platformFee, totalAmount: total } = calculateTotalAmount(amount);
      setCalculatedFee(platformFee);
      setTotalAmount(total);
    } else {
      setCalculatedFee(0);
      setTotalAmount(0);
    }
  };

  const handleCryptoPayment = async (amount: number) => {
    if (!user) {
      // Not logged in - user should see login requirement
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

    // Double-check user is authenticated
    if (!user) {
      addNotification(
        "recommendation",
        "Authentication Required",
        "Please login to make a payment."
      );
      router.replace("/welcome");
      return;
    }

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

      // Handle session expiry
      if (error instanceof Error && error.message.includes("Session expired")) {
        await logout();
        router.replace("/welcome");
        addNotification(
          "recommendation",
          "Session Expired",
          "Your session has expired. Please login again."
        );
        return;
      }

      addNotification(
        "recommendation",
        "Payment Error",
        "Failed to create crypto payment request"
      );
      resetPaymentState();
    } finally {
      setIsProcessing(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    // Clear any existing polling interval
    stopPaymentPolling();

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updatedPayment = await pollPaymentStatus(paymentId);
        setCryptoPayment(updatedPayment);

        if (updatedPayment.status === "completed") {
          stopPaymentPolling();

          // Record the transaction with fee breakdown
          try {
            const donationAmount = parseFloat(customAmount);
            const { platformFee, totalAmount: total } = calculateTotalAmount(donationAmount);
            
            await createSupportTransaction({
              supporterId: user!.userId,
              birdId: isPlatformSupport ? undefined : birdId,
              amount: donationAmount,
              platformFee: platformFee,
              totalAmount: total,
              paymentProvider: "Crypto",
              paymentId: updatedPayment.transactionHash || paymentId,
              status: "completed",
            });

            addNotification(
              "recommendation",
              "Payment Successful",
              "Thank you for your support!"
            );
          } catch (error) {
            console.error("Error recording transaction:", error);
          }

          // Success - close modal after a delay
          setTimeout(() => {
            onClose();
            resetPaymentState();
          }, 2000);
        } else if (
          updatedPayment.status === "expired" ||
          updatedPayment.status === "failed" ||
          updatedPayment.status === "cancelled"
        ) {
          stopPaymentPolling();
          // Don't reset state immediately - let user see the status
          // They can manually close or try again
        }
      } catch (error) {
        console.error("Error polling payment:", error);
        // Don't stop polling on error - might be temporary network issue
      }
    }, 5000); // Poll every 5 seconds
  };

  const stopPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const resetPaymentState = () => {
    stopPaymentPolling();
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
      addNotification(
        "recommendation",
        "Cannot Open PayPal",
        "Unable to open PayPal. Please try again later."
      );
    }
  };

  const handlePlatformCrypto = () => {
    const amount = parseFloat(customAmount);
    if (!customAmount || isNaN(amount) || amount < MINIMUM_DONATION_AMOUNT) {
      addNotification(
        "recommendation",
        "Minimum Amount Required",
        `Crypto payments require a minimum of $${MINIMUM_DONATION_AMOUNT} due to blockchain network fees and transaction costs.`
      );
      return;
    }
    
    // Calculate total with platform fee
    const { totalAmount: total } = calculateTotalAmount(amount);
    setSelectedAmount(total); // Use total amount for payment
    setPaymentMethod("crypto");
    setShowCryptoSelector(true);
  };

  const handlePayPalPayment = async (amount: number) => {
    if (!user) {
      // Not logged in - user should see login requirement
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

            // Success - close modal
            onClose();
          } catch (error) {
            console.error("Error recording transaction:", error);

            // Handle session expiry
            if (
              error instanceof Error &&
              error.message.includes("Session expired")
            ) {
              await logout();
              router.replace("/welcome");
              addNotification(
                "recommendation",
                "Session Expired",
                "Your session has expired. Please login again."
              );
              return;
            }

            addNotification(
              "recommendation",
              "Transaction Error",
              "Failed to record transaction"
            );
          } finally {
            setIsProcessing(false);
            setSelectedAmount(null);
          }
        }, 2000);
      } else {
        addNotification(
          "recommendation",
          "Cannot Open PayPal",
          "Unable to open PayPal. Please try again later."
        );
        setIsProcessing(false);
        setSelectedAmount(null);
      }
    } catch (error) {
      console.error("PayPal error:", error);
      addNotification(
        "recommendation",
        "Payment Error",
        "Failed to process payment"
      );
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
                  onExpired={() => {
                    // Don't reset state - just stop polling
                    // User can see expired status and manually close
                    stopPaymentPolling();
                  }}
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

                {/* Custom Amount Input */}
                <View style={styles.customAmountContainer}>
                  <Text style={styles.customAmountLabel}>
                    Enter Donation Amount (USD)
                  </Text>
                  <TextInput
                    style={styles.customAmountInput}
                    placeholder={`Minimum $${MINIMUM_DONATION_AMOUNT}`}
                    keyboardType="decimal-pad"
                    value={customAmount}
                    onChangeText={handleAmountChange}
                    autoFocus={false}
                  />
                  
                  {/* Show fee breakdown when amount is valid */}
                  {parseFloat(customAmount) >= MINIMUM_DONATION_AMOUNT && (
                    <View style={styles.feeBreakdown}>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Your donation:</Text>
                        <Text style={styles.feeValue}>
                          ${parseFloat(customAmount).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>
                          Platform fee ({(PLATFORM_FEE_PERCENTAGE * 100).toFixed(0)}%):
                        </Text>
                        <Text style={styles.feeValue}>
                          ${calculatedFee.toFixed(2)}
                        </Text>
                      </View>
                      <View style={[styles.feeRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total to pay:</Text>
                        <Text style={styles.totalValue}>
                          ${totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <Text style={styles.minAmountText}>
                    💡 Minimum ${MINIMUM_DONATION_AMOUNT} required for crypto payments due to blockchain network fees.{\"\\n\"}\n                    ⚡ Platform fee: {(PLATFORM_FEE_PERCENTAGE * 100).toFixed(0)}% (minimum $1) helps maintain Wihngo.
                  </Text>

                  {/* Payment Method Buttons */}
                  {parseFloat(customAmount) >= MINIMUM_DONATION_AMOUNT && (
                    <View style={styles.paymentMethodsContainer}>
                      <TouchableOpacity
                        style={styles.paymentMethodButtonLarge}
                        onPress={() => {
                          const amount = parseFloat(customAmount);
                          const { totalAmount: total } = calculateTotalAmount(amount);
                          setSelectedAmount(total);
                          setPaymentMethod(\"crypto\");
                          setShowCryptoSelector(true);
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing && paymentMethod === \"crypto\" ? (
                          <ActivityIndicator size=\"small\" color=\"#f7931a\" />
                        ) : (
                          <>
                            <FontAwesome6
                              name=\"bitcoin\"
                              size={24}
                              color=\"#f7931a\"
                            />
                            <Text style={styles.paymentMethodButtonTextLarge}>
                              Pay with Crypto
                            </Text>
                            <Text style={styles.paymentMethodSubtext}>
                              USDT on multiple networks
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
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
                    <Text style={styles.platformSupportNote}>
                      Use the donation form above to support both the bird and Wihngo platform.
                    </Text>
                  </View>
                )}

                <Text style={styles.disclaimer}>
                  💳 Secure crypto payment • 🔒 Your donation helps conservation
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
    fontSize: 20,
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
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  customAmountContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  customAmountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  customAmountInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  feeBreakdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: "#666",
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  minAmountText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodButtonLarge: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f7931a",
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  paymentMethodButtonTextLarge: {
    color: "#333",
    fontSize: 18,
    fontWeight: "700",
  },
  paymentMethodSubtext: {
    color: "#666",
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: "500",
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  selectorSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  currencyCode: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  networkTitle: {
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  platformSupportText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  platformSupportNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});
