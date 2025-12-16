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
import { calculateTotalAmount, MINIMUM_DONATION_AMOUNT } from "@/types/support";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CryptoPaymentQR from "./crypto-payment-qr";
import CryptoPaymentStatus from "./crypto-payment-status";

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  birdId?: string;
  birdName?: string;
  isPlatformSupport?: boolean;
}

// Solana is the only supported network
const SOLANA_NETWORK: CryptoNetwork = "solana";

export default function SupportModal({
  visible,
  onClose,
  birdId,
  birdName,
  isPlatformSupport = false,
}: SupportModalProps) {
  const getCurrencyIcon = (code: CryptoCurrency) => {
    const icons: Record<CryptoCurrency, any> = {
      USDC: require("@/assets/icons/usdc.png"),
      EURC: require("@/assets/icons/eurc.png"),
    };
    return icons[code];
  };

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "crypto" | null
  >(null);
  const [cryptoPayment, setCryptoPayment] =
    useState<CryptoPaymentRequest | null>(null);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    if (!visible) {
      stopPaymentPolling();
      resetPaymentState();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, []);

  const handleCryptoSelection = async (currency: CryptoCurrency) => {
    if (!selectedAmount) return;

    if (!user) {
      addNotification(
        "recommendation",
        t("common.pleaseLogin"),
        t("common.notLoggedIn")
      );
      router.replace("/welcome");
      return;
    }

    try {
      setIsProcessing(true);
      setShowCurrencySelector(false);

      const response = await createCryptoPayment({
        birdId: isPlatformSupport ? undefined : birdId,
        amountUsd: selectedAmount,
        currency,
        network: SOLANA_NETWORK,
        purpose: "donation",
      });

      setCryptoPayment(response.paymentRequest);
      startPaymentPolling(response.paymentRequest.id);
    } catch (error) {
      console.error("Error creating crypto payment:", error);

      if (error instanceof Error && error.message.includes("Session expired")) {
        await logout();
        router.replace("/welcome");
        addNotification(
          "recommendation",
          t("auth.sessionExpired"),
          t("auth.sessionExpired")
        );
        return;
      }

      if (error instanceof Error && error.message.includes("400")) {
        addNotification(
          "recommendation",
          t("crypto.paymentError"),
          t("crypto.currencyNotSupported")
        );
      } else {
        addNotification(
          "recommendation",
          t("crypto.paymentError"),
          error instanceof Error ? error.message : t("crypto.unknownError")
        );
      }
      resetPaymentState();
    } finally {
      setIsProcessing(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    stopPaymentPolling();

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updatedPayment = await pollPaymentStatus(paymentId);
        setCryptoPayment(updatedPayment);

        if (updatedPayment.status === "completed") {
          stopPaymentPolling();

          try {
            const donationAmount = parseFloat(customAmount);
            const { platformFee, totalAmount: total } =
              calculateTotalAmount(donationAmount);

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
              t("crypto.paymentSuccessful"),
              t("crypto.thankYouForSupport")
            );
          } catch (error) {
            console.error("Error recording transaction:", error);
          }

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
        }
      } catch (error) {
        console.error("Error polling payment:", error);
      }
    }, 5000);
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
    setCryptoPayment(null);
    setShowCurrencySelector(false);
    setCustomAmount("");
    setIsProcessing(false);
  };

  const handleCryptoButtonPress = () => {
    setPaymentMethod("crypto");
    setSelectedAmount(MINIMUM_DONATION_AMOUNT);
    setShowCurrencySelector(true);
  };

  // Currency Selector Component - Solana only
  const CurrencySelector = () => {
    const currencies = [
      {
        code: "USDC" as CryptoCurrency,
        name: "USD Coin",
        description: t("crypto.usdcDescription"),
        recommended: true,
      },
      {
        code: "EURC" as CryptoCurrency,
        name: "Euro Coin",
        description: t("crypto.eurcDescription"),
        recommended: false,
      },
    ];

    return (
      <View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setShowCurrencySelector(false);
            setPaymentMethod(null);
          }}
        >
          <Feather name="arrow-left" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>

        <Text style={styles.selectorTitle}>{t("crypto.selectCurrency")}</Text>
        <Text style={styles.selectorSubtitle}>{t("crypto.payOnSolana")}</Text>

        <View style={styles.infoBox}>
          <FontAwesome6 name="bolt" size={14} color="#14F195" />
          <Text style={styles.infoBoxText}>
            {t("crypto.solanaFastCheap")}
          </Text>
        </View>

        <View style={styles.currencyList}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyCard,
                currency.recommended && styles.recommendedCard,
              ]}
              onPress={() => handleCryptoSelection(currency.code)}
              disabled={isProcessing}
            >
              <Image
                source={getCurrencyIcon(currency.code)}
                style={styles.currencyIcon}
                resizeMode="contain"
              />
              <View style={styles.currencyInfo}>
                <View style={styles.currencyNameRow}>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  {currency.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedBadgeText}>
                        {t("crypto.recommended")}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.currencyCode}>{currency.code}</Text>
                <Text style={styles.currencyDescription}>
                  {currency.description}
                </Text>
              </View>
              {isProcessing ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Feather name="chevron-right" size={20} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.networkInfo}>
          <FontAwesome6 name="circle-info" size={12} color="#666" />
          <Text style={styles.networkInfoText}>
            {t("crypto.networkInfo")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          {
            paddingBottom: Math.max(insets.bottom, 20),
            height: cryptoPayment ? "90%" : showCurrencySelector ? "70%" : "50%"
          }
        ]}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isPlatformSupport
                ? t("support.supportPlatform")
                : t("headers.supportBird", { birdName })}
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {cryptoPayment ? (
              <View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={resetPaymentState}
                >
                  <Feather name="arrow-left" size={20} color="#007AFF" />
                  <Text style={styles.backButtonText}>{t("common.back")}</Text>
                </TouchableOpacity>

                <CryptoPaymentQR
                  payment={cryptoPayment}
                  onExpired={() => {
                    stopPaymentPolling();
                  }}
                />

                <CryptoPaymentStatus payment={cryptoPayment} />
              </View>
            ) : showCurrencySelector ? (
              <CurrencySelector />
            ) : (
              <>
                <Text style={styles.subtitle}>
                  {isPlatformSupport
                    ? t("support.platformSubtitle")
                    : t("support.birdSubtitle")}
                </Text>

                <View style={styles.paymentMethodsContainer}>
                  {/* PayPal Button */}
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodButton,
                      styles.paypalButton,
                    ]}
                    onPress={async () => {
                      const paypalUrl = isPlatformSupport
                        ? "https://www.paypal.com/ncp/payment/AECE9FQMFFETS"
                        : "https://www.paypal.com/ncp/payment/JGD55LPGBHWQW";
                      const canOpen = await Linking.canOpenURL(paypalUrl);
                      if (canOpen) {
                        await Linking.openURL(paypalUrl);
                        addNotification(
                          "recommendation",
                          t("support.openingPayPal"),
                          t("support.completeYourDonation")
                        );
                      } else {
                        addNotification(
                          "recommendation",
                          t("support.cannotOpenPayPal"),
                          t("support.unableToOpenPayPal")
                        );
                      }
                    }}
                    disabled={isProcessing}
                  >
                    <FontAwesome6 name="paypal" size={28} color="#0070BA" />
                    <Text style={styles.paymentMethodButtonText}>PayPal</Text>
                    <Text style={styles.paymentMethodDescription}>
                      {t("support.quickSecurePayment")}
                    </Text>
                  </TouchableOpacity>

                  {/* Crypto Button */}
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodButton,
                      styles.cryptoButton,
                    ]}
                    onPress={handleCryptoButtonPress}
                    disabled={isProcessing}
                  >
                    <FontAwesome6 name="coins" size={28} color="#14F195" />
                    <Text style={styles.paymentMethodButtonText}>Crypto</Text>
                    <Text style={styles.paymentMethodDescription}>
                      USDC, EURC
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isPlatformSupport && (
                  <View style={styles.platformSupportSection}>
                    <View style={styles.divider} />
                    <Text style={styles.platformSupportTitle}>
                      {t("support.platformSupportTitle")}
                    </Text>
                    <Text style={styles.platformSupportText}>
                      {t("support.platformSupportText")}
                    </Text>
                    <TouchableOpacity
                      style={styles.supportWihngoButton}
                      onPress={async () => {
                        const wihngoPaypalUrl =
                          "https://www.paypal.com/ncp/payment/AECE9FQMFFETS";
                        const canOpen = await Linking.canOpenURL(wihngoPaypalUrl);
                        if (canOpen) {
                          await Linking.openURL(wihngoPaypalUrl);
                          addNotification(
                            "recommendation",
                            t("support.openingPayPal"),
                            t("support.thankYouForSupport")
                          );
                        } else {
                          addNotification(
                            "recommendation",
                            t("support.cannotOpenPayPal"),
                            t("support.unableToOpenPayPal")
                          );
                        }
                      }}
                    >
                      <FontAwesome6 name="heart" size={14} color="#fff" />
                      <Text style={styles.supportWihngoButtonText}>
                        {t("support.supportWihngoViaPayPal")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  paymentMethodsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: 160,
  },
  paypalButton: {
    borderColor: "#0070BA",
    backgroundColor: "#F5FAFF",
  },
  cryptoButton: {
    borderColor: "#14F195",
    backgroundColor: "#F0FFF8",
  },
  paymentMethodButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    padding: 4,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 14,
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
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#14F195",
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },
  currencyList: {
    gap: 12,
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  recommendedCard: {
    borderColor: "#14F195",
    backgroundColor: "#F0FFF8",
  },
  currencyIcon: {
    width: 48,
    height: 48,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recommendedBadge: {
    backgroundColor: "#14F195",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
    textTransform: "uppercase",
  },
  currencyCode: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  currencyDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  networkInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  networkInfoText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  platformSupportSection: {
    marginTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 24,
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
    marginBottom: 16,
  },
  supportWihngoButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  supportWihngoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
