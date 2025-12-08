import { useAuth } from "@/contexts/auth-context";
import { createSupportTransaction } from "@/services/support.service";
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
  TouchableOpacity,
  View,
} from "react-native";

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
  const { user } = useAuth();

  const supportAmounts = [
    { value: SupportAmount.Small, label: "$5", emoji: "☕" },
    { value: SupportAmount.Medium, label: "$10", emoji: "🍕" },
    { value: SupportAmount.Large, label: "$25", emoji: "🎁" },
    { value: SupportAmount.Generous, label: "$50", emoji: "💝" },
    { value: SupportAmount.VeryGenerous, label: "$100", emoji: "🌟" },
  ];

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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              {isPlatformSupport
                ? "Help us keep Wihngo running and support bird conservation!"
                : "Choose an amount to support this amazing bird"}
            </Text>

            <View style={styles.amountsContainer}>
              {supportAmounts.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.amountCard,
                    selectedAmount === item.value && styles.amountCardSelected,
                  ]}
                  onPress={() => handlePayPalPayment(item.value)}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                >
                  {isProcessing && selectedAmount === item.value ? (
                    <ActivityIndicator size="large" color="#0070ba" />
                  ) : (
                    <>
                      {/* <Feather
                        name="feather"
                        size={32}
                        color="#10b981"
                        style={{ marginBottom: 8 }}
                      /> */}
                      <FontAwesome6 name="paypal" size={24} color="black" />
                      <Text style={styles.amountLabel}>{item.label}</Text>
                      {/* <View style={styles.paypalBadge}>
                        <Text style={styles.paypalText}>PayPal</Text>
                      </View> */}
                    </>
                  )}
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.platformButton}
                  onPress={async () => {
                    const paypalUrl =
                      "https://www.paypal.com/ncp/payment/AECE9FQMFFETS";
                    const canOpen = await Linking.canOpenURL(paypalUrl);
                    if (canOpen) {
                      await Linking.openURL(paypalUrl);
                      onClose();
                    } else {
                      Alert.alert("Error", "Cannot open PayPal");
                    }
                  }}
                >
                  <Feather name="gift" size={20} color="#fff" />
                  <Text style={styles.platformButtonText}>Support Wihngo</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.disclaimer}>
              💳 Secure payment powered by PayPal
            </Text>
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
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
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
});
