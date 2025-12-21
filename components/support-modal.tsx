import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import {
  createCryptoPayment,
  pollPaymentStatus,
} from "@/services/crypto.service";
import {
  executePhantomPayment,
  isPhantomInstalled,
  openPhantomInstallPage,
  type SupportedToken,
} from "@/services/phantom-wallet.service";
import { createSupportTransaction } from "@/services/support.service";
import {
  CryptoCurrency,
  CryptoNetwork,
  CryptoPaymentRequest,
} from "@/types/crypto";
import { calculateTotalAmount, MINIMUM_DONATION_AMOUNT } from "@/types/support";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
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

type WalletPaymentMethod = "manual" | "phantom";

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
  const [showWalletMethodSelector, setShowWalletMethodSelector] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null);
  const [walletPaymentMethod, setWalletPaymentMethod] = useState<WalletPaymentMethod>("manual");
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);
  const [checkingPhantom, setCheckingPhantom] = useState(false);
  const [phantomPaymentPending, setPhantomPaymentPending] = useState(false);
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

  // Called when user selects a currency - now shows wallet method selector
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

    // Save selected currency and show wallet method selector
    setSelectedCurrency(currency);
    setShowCurrencySelector(false);
    setShowWalletMethodSelector(true);
    checkPhantomAvailability();
  };

  // Proceed with manual transfer (QR code)
  const proceedWithManualTransfer = async () => {
    if (!selectedAmount || !selectedCurrency) return;

    try {
      setIsProcessing(true);
      setShowWalletMethodSelector(false);

      const response = await createCryptoPayment({
        birdId: isPlatformSupport ? undefined : birdId,
        amountUsd: selectedAmount,
        currency: selectedCurrency,
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

  // Proceed with Phantom wallet payment
  // Shows QR code and opens Phantom app for user to scan
  const proceedWithPhantomPayment = async () => {
    if (!selectedAmount || !selectedCurrency) return;

    try {
      setIsProcessing(true);
      setShowWalletMethodSelector(false);

      // Create the payment to get the wallet address and QR code
      const response = await createCryptoPayment({
        birdId: isPlatformSupport ? undefined : birdId,
        amountUsd: selectedAmount,
        currency: selectedCurrency,
        network: SOLANA_NETWORK,
        purpose: "donation",
      });

      setCryptoPayment(response.paymentRequest);
      setPhantomPaymentPending(true);

      // Start polling for payment confirmation
      startPaymentPolling(response.paymentRequest.id);

      // Open Phantom app - user will use Phantom's QR scanner
      try {
        await Linking.openURL("phantom://");
        addNotification(
          "recommendation",
          t("donation.phantomOpened", "Phantom Opened"),
          t("donation.scanQrInPhantom", "Use Phantom's scanner to scan the QR code shown here")
        );
      } catch {
        // Phantom might not be installed - that's ok, user can still see QR
        addNotification(
          "recommendation",
          t("donation.scanQrCode", "Scan QR Code"),
          t("donation.openPhantomManually", "Open Phantom and scan the QR code to pay")
        );
      }
    } catch (error) {
      console.error("Error with Phantom payment:", error);

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

      addNotification(
        "recommendation",
        t("crypto.paymentError"),
        error instanceof Error ? error.message : t("crypto.unknownError")
      );
      resetPaymentState();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment method selection and proceed
  const handleProceedWithPayment = () => {
    if (walletPaymentMethod === "phantom") {
      proceedWithPhantomPayment();
    } else {
      proceedWithManualTransfer();
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
    setShowWalletMethodSelector(false);
    setSelectedCurrency(null);
    setWalletPaymentMethod("manual");
    setPhantomPaymentPending(false);
    setCustomAmount("");
    setIsProcessing(false);
  };

  // Check if Phantom is available when showing wallet method selector
  // Note: In Expo Go, we can't reliably detect installed apps, so we default to enabling Phantom
  // and handle errors gracefully when the user tries to pay
  const checkPhantomAvailability = async () => {
    setCheckingPhantom(true);
    try {
      const available = await isPhantomInstalled();
      // Always enable Phantom option - if it's not installed, user will see helpful error
      // This is better UX than disabling it based on unreliable detection
      setIsPhantomAvailable(true);
      // Default to Phantom if it appears to be installed
      if (available) {
        setWalletPaymentMethod("phantom");
      }
    } catch (error) {
      console.error("Error checking Phantom:", error);
      // Still enable Phantom - let user try and show error if needed
      setIsPhantomAvailable(true);
    } finally {
      setCheckingPhantom(false);
    }
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
                contentFit="contain"
                cachePolicy="memory-disk"
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

  // Wallet Method Selector Component
  const WalletMethodSelector = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setShowWalletMethodSelector(false);
            setShowCurrencySelector(true);
            setSelectedCurrency(null);
          }}
        >
          <Feather name="arrow-left" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>

        <Text style={styles.selectorTitle}>
          {t("donation.selectPaymentMethod", "How would you like to pay?")}
        </Text>
        <Text style={styles.selectorSubtitle}>
          {t("donation.selectPaymentMethodDescription", "Choose your preferred payment method")}
        </Text>

        {/* Amount Display */}
        <View style={styles.amountDisplayBox}>
          <Text style={styles.amountDisplayLabel}>
            {t("donation.youWillPay", "You'll pay")}
          </Text>
          <Text style={styles.amountDisplayValue}>
            ${selectedAmount} {selectedCurrency}
          </Text>
        </View>

        {/* Manual Transfer Option */}
        <TouchableOpacity
          style={[
            styles.walletMethodCard,
            walletPaymentMethod === "manual" && styles.walletMethodCardSelected,
          ]}
          onPress={() => setWalletPaymentMethod("manual")}
          disabled={isProcessing}
        >
          <View style={styles.walletMethodIconContainer}>
            <Text style={styles.walletMethodIcon}>📱</Text>
          </View>
          <View style={styles.walletMethodInfo}>
            <Text style={[
              styles.walletMethodTitle,
              walletPaymentMethod === "manual" && styles.walletMethodTitleSelected,
            ]}>
              {t("donation.manualTransfer", "Send Manually")}
            </Text>
            <Text style={styles.walletMethodDescription}>
              {t("donation.manualTransferDescription", "Copy address or scan QR code")}
            </Text>
          </View>
          <View style={[
            styles.radioOuter,
            walletPaymentMethod === "manual" && styles.radioOuterSelected,
          ]}>
            {walletPaymentMethod === "manual" && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Phantom Wallet Option */}
        <TouchableOpacity
          style={[
            styles.walletMethodCard,
            walletPaymentMethod === "phantom" && styles.walletMethodCardSelected,
            !isPhantomAvailable && styles.walletMethodCardDisabled,
          ]}
          onPress={() => isPhantomAvailable && setWalletPaymentMethod("phantom")}
          disabled={isProcessing || !isPhantomAvailable}
        >
          <View style={[styles.walletMethodIconContainer, styles.phantomIconContainer]}>
            <Text style={styles.walletMethodIcon}>👻</Text>
          </View>
          <View style={styles.walletMethodInfo}>
            <View style={styles.walletMethodTitleRow}>
              <Text style={[
                styles.walletMethodTitle,
                walletPaymentMethod === "phantom" && styles.walletMethodTitleSelected,
                !isPhantomAvailable && styles.walletMethodTitleDisabled,
              ]}>
                {t("donation.phantomWallet", "Pay with Phantom")}
              </Text>
              {checkingPhantom && (
                <ActivityIndicator size="small" color="#AB9FF2" style={{ marginLeft: 8 }} />
              )}
            </View>
            <Text style={[
              styles.walletMethodDescription,
              !isPhantomAvailable && styles.walletMethodDescriptionDisabled,
            ]}>
              {isPhantomAvailable
                ? t("donation.phantomDescription", "Approve payment in Phantom app")
                : t("donation.phantomNotInstalled", "Install Phantom to use this")}
            </Text>
          </View>
          <View style={[
            styles.radioOuter,
            walletPaymentMethod === "phantom" && styles.radioOuterSelected,
            !isPhantomAvailable && styles.radioOuterDisabled,
          ]}>
            {walletPaymentMethod === "phantom" && isPhantomAvailable && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>

        {!isPhantomAvailable && !checkingPhantom && (
          <TouchableOpacity
            style={styles.installPhantomButton}
            onPress={openPhantomInstallPage}
          >
            <Text style={styles.installPhantomButtonText}>
              {t("donation.installPhantom", "Install Phantom Wallet")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            isProcessing && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedWithPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.proceedButtonText}>
              {walletPaymentMethod === "phantom"
                ? t("donation.openPhantom", "Open Phantom & Pay")
                : t("donation.showQrCode", "Show QR Code")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Feather name="shield" size={14} color="#059669" />
          <Text style={styles.securityNoteText}>
            {t("donation.securityNote", "Both methods are secure. Payment verified on Solana blockchain.")}
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
            height: cryptoPayment ? "90%" : (showCurrencySelector || showWalletMethodSelector) ? "75%" : "50%"
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

                {phantomPaymentPending && (
                  <View style={styles.phantomPendingBanner}>
                    <Text style={styles.phantomPendingIcon}>👻</Text>
                    <View style={styles.phantomPendingContent}>
                      <Text style={styles.phantomPendingTitle}>
                        {t("donation.scanQrInPhantom", "Scan QR in Phantom")}
                      </Text>
                      <Text style={styles.phantomPendingText}>
                        {t("donation.phantomScanInstructions", "1. Open Phantom app\n2. Tap the scan icon (top right)\n3. Scan the QR code below")}
                      </Text>
                      <TouchableOpacity
                        style={styles.openPhantomButton}
                        onPress={async () => {
                          try {
                            await Linking.openURL("phantom://");
                          } catch {
                            addNotification(
                              "recommendation",
                              t("donation.phantomNotInstalled", "Phantom not found"),
                              t("donation.installPhantomFirst", "Please install Phantom wallet first")
                            );
                          }
                        }}
                      >
                        <Text style={styles.openPhantomButtonText}>
                          {t("donation.openPhantomApp", "Open Phantom App")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <CryptoPaymentQR
                  payment={cryptoPayment}
                  onExpired={() => {
                    stopPaymentPolling();
                  }}
                />

                <CryptoPaymentStatus payment={cryptoPayment} />
              </View>
            ) : showWalletMethodSelector ? (
              <WalletMethodSelector />
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
  // Wallet Method Selector Styles
  amountDisplayBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  amountDisplayLabel: {
    fontSize: 12,
    color: "#0369A1",
    marginBottom: 4,
  },
  amountDisplayValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0C4A6E",
  },
  walletMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  walletMethodCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  walletMethodCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  walletMethodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  phantomIconContainer: {
    backgroundColor: "#AB9FF2",
  },
  walletMethodIcon: {
    fontSize: 22,
  },
  walletMethodInfo: {
    flex: 1,
  },
  walletMethodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  walletMethodTitleSelected: {
    color: "#007AFF",
  },
  walletMethodTitleDisabled: {
    color: "#9CA3AF",
  },
  walletMethodDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  walletMethodDescriptionDisabled: {
    color: "#9CA3AF",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: "#007AFF",
  },
  radioOuterDisabled: {
    borderColor: "#E5E7EB",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  installPhantomButton: {
    backgroundColor: "#AB9FF2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  installPhantomButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  proceedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  securityNoteText: {
    fontSize: 12,
    color: "#059669",
    flex: 1,
  },
  phantomPendingBanner: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#AB9FF2",
  },
  phantomPendingIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  phantomPendingContent: {
    flex: 1,
  },
  phantomPendingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5B21B6",
    marginBottom: 4,
  },
  phantomPendingText: {
    fontSize: 13,
    color: "#7C3AED",
    lineHeight: 20,
  },
  openPhantomButton: {
    backgroundColor: "#AB9FF2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  openPhantomButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
