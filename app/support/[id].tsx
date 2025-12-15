import { useNotifications } from "@/contexts/notification-context";
import { Bird } from "@/types/bird";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function SupportBird() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addNotification } = useNotifications();
  const [bird, setBird] = useState<Bird | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "googlepay" | "applepay" | "crypto-usdt"
  >("card");

  React.useEffect(() => {
    // TODO: Fetch bird data
    // const birdData = await birdService.getBird(id);
    // setBird(birdData);
  }, [id]);

  const getFinalAmount = () => {
    if (customAmount) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? 0 : amount;
    }
    return selectedAmount || 0;
  };

  const handleSupport = async () => {
    const amount = getFinalAmount();

    if (amount < 1) {
      // Invalid amount - user can see input validation
      return;
    }

    setLoading(true);
    try {
      // TODO: Process payment
      // await paymentService.processSupportPayment({
      //   birdId: id,
      //   amount,
      //   message,
      //   paymentMethod
      // });

      router.back(); // Success clear from navigation
    } catch (error) {
      console.error("Payment error:", error);
      addNotification(
        "recommendation",
        "Payment Failed",
        "Failed to process payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("headers.supportBird")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Bird Info */}
        <View style={styles.birdCard}>
          <Image
            source={{
              uri: bird?.imageUrl || "https://via.placeholder.com/100",
            }}
            style={styles.birdImage}
          />
          <View style={styles.birdInfo}>
            <Text style={styles.birdName}>
              {bird?.name || "Anna's Hummingbird"}
            </Text>
            <Text style={styles.birdSpecies}>
              {bird?.species || "Hummingbird"}
            </Text>
            <View style={styles.birdStats}>
              <View style={styles.birdStat}>
                <FontAwesome6
                  name="hand-holding-heart"
                  size={12}
                  color="#10b981"
                />
                <Text style={styles.birdStatText}>
                  {bird?.supportedBy || 423} supporters
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support Message */}
        <View style={styles.messageCard}>
          <FontAwesome6 name="heart" size={24} color="#FF6B6B" />
          <Text style={styles.messageTitle}>
            Your Support Makes a Difference
          </Text>
          <Text style={styles.messageText}>
            Every contribution helps provide food, medicine, and care for{" "}
            {bird?.name || "this bird"}. Thank you for being part of our
            community!
          </Text>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("support.selectAmount")}</Text>
          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonActive,
                ]}
                onPress={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.amountButtonTextActive,
                  ]}
                >
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>
              {t("support.orEnterCustomAmount")}
            </Text>
            <View style={styles.customAmountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder={t("support.customAmountPlaceholder")}
                placeholderTextColor="#95A5A6"
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setSelectedAmount(null);
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Personal Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("support.addMessage")}</Text>
          <TextInput
            style={styles.messageInput}
            placeholder={t("support.messagePlaceholder")}
            placeholderTextColor="#95A5A6"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={200}
          />
          <Text style={styles.characterCount}>
            {t("support.characterCount", { count: message.length })}
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("support.paymentMethod")}</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === "card" && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <FontAwesome6
                name="credit-card"
                size={20}
                color={paymentMethod === "card" ? "#fff" : "#2C3E50"}
              />
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethod === "card" && styles.paymentButtonTextActive,
                ]}
              >
                Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === "paypal" && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod("paypal")}
            >
              <FontAwesome6
                name="paypal"
                size={20}
                color={paymentMethod === "paypal" ? "#fff" : "#2C3E50"}
              />
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethod === "paypal" && styles.paymentButtonTextActive,
                ]}
              >
                PayPal
              </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  paymentMethod === "applepay" && styles.paymentButtonActive,
                ]}
                onPress={() => setPaymentMethod("applepay")}
              >
                <FontAwesome6
                  name="apple-pay"
                  size={20}
                  color={paymentMethod === "applepay" ? "#fff" : "#2C3E50"}
                />
                <Text
                  style={[
                    styles.paymentButtonText,
                    paymentMethod === "applepay" &&
                      styles.paymentButtonTextActive,
                  ]}
                >
                  Apple Pay
                </Text>
              </TouchableOpacity>
            )}

            {Platform.OS === "android" && (
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  paymentMethod === "googlepay" && styles.paymentButtonActive,
                ]}
                onPress={() => setPaymentMethod("googlepay")}
              >
                <FontAwesome6
                  name="google-pay"
                  size={20}
                  color={paymentMethod === "googlepay" ? "#fff" : "#2C3E50"}
                />
                <Text
                  style={[
                    styles.paymentButtonText,
                    paymentMethod === "googlepay" &&
                      styles.paymentButtonTextActive,
                  ]}
                >
                  Google Pay
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Crypto Payment Options */}
          <Text style={styles.cryptoSectionTitle}>
            {t("support.cryptocurrency")}
          </Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === "crypto-usdt" && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod("crypto-usdt")}
            >
              <FontAwesome6
                name="dollar-sign"
                size={20}
                color={paymentMethod === "crypto-usdt" ? "#fff" : "#2C3E50"}
              />
              <Text
                style={[
                  styles.paymentButtonText,
                  paymentMethod === "crypto-usdt" &&
                    styles.paymentButtonTextActive,
                ]}
              >
                USDT (Tron)
              </Text>
            </TouchableOpacity>

            {/* Removed Sepolia testnet - no longer supported in v2.0 */}
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {t("support.totalSupportAmount")}
          </Text>
          <Text style={styles.totalAmount}>${getFinalAmount().toFixed(2)}</Text>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <FontAwesome6 name="circle-info" size={16} color="#4ECDC4" />
          <Text style={styles.infoNoteText}>
            100% of your contribution goes directly to bird care. We never take
            fees.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[
            styles.supportButton,
            (getFinalAmount() < 1 || loading) && styles.supportButtonDisabled,
          ]}
          onPress={handleSupport}
          disabled={getFinalAmount() < 1 || loading}
        >
          <FontAwesome6 name="hand-holding-heart" size={20} color="#fff" />
          <Text style={styles.supportButtonText}>
            {loading
              ? "Processing..."
              : `Support with $${getFinalAmount().toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  birdCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  birdImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
  },
  birdInfo: {
    flex: 1,
    justifyContent: "center",
  },
  birdName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  birdSpecies: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  birdStats: {
    flexDirection: "row",
    gap: 12,
  },
  birdStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  birdStatText: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  messageCard: {
    backgroundColor: "#FFF9F0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE5CC",
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 12,
    color: "#5D6D7E",
    textAlign: "center",
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  cryptoSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
    marginTop: 16,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amountButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  amountButtonActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  amountButtonTextActive: {
    color: "#fff",
  },
  customAmountContainer: {
    marginTop: 16,
  },
  customAmountLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  customAmountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    paddingVertical: 16,
  },
  messageInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    padding: 16,
    fontSize: 13,
    color: "#2C3E50",
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 10,
    color: "#95A5A6",
    textAlign: "right",
    marginTop: 4,
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  paymentButtonActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  paymentButtonTextActive: {
    color: "#fff",
  },
  totalCard: {
    backgroundColor: "#667EEA",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#E0E7FF",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F8F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#2C3E50",
    lineHeight: 18,
  },
  bottomAction: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
  },
  supportButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  supportButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
