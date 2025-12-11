/**
 * Example: Integrating Crypto Payment into Premium Subscription Flow
 *
 * This example shows how to add a "Pay with Crypto" button to your
 * premium subscription component.
 */

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ============================================
// Advanced Example: Using the Hook Directly
// ============================================

import { useAuth } from "@/contexts/auth-context";
import { useCryptoPayment } from "@/hooks/useCryptoPayment";
import { useState } from "react";

// Example integration in your premium subscription component
function PremiumSubscriptionExample() {
  const selectedPlan = {
    type: "monthly", // 'monthly' | 'yearly' | 'lifetime'
    price: 9.99, // USD price
    name: "Monthly Premium",
  };

  const currentBird = {
    id: "your-bird-id",
    name: "Tweety",
  };

  /**
   * Navigate to crypto payment screen
   */
  const handlePayWithCrypto = () => {
    router.push({
      pathname: "/crypto-payment",
      params: {
        amount: selectedPlan.price.toString(),
        birdId: currentBird.id,
        plan: selectedPlan.type,
        purpose: "premium_subscription",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Your existing premium subscription UI */}

      {/* Add this button to your payment options */}
      <TouchableOpacity
        style={styles.cryptoPaymentButton}
        onPress={handlePayWithCrypto}
      >
        <FontAwesome6 name="bitcoin" size={20} color="#fff" />
        <Text style={styles.cryptoPaymentText}>Pay with Cryptocurrency</Text>
      </TouchableOpacity>

      {/* Or add as a payment option alongside credit cards */}
      <View style={styles.paymentOptions}>
        <TouchableOpacity style={styles.paymentOption}>
          <FontAwesome6 name="credit-card" size={24} color="#007AFF" />
          <Text>Credit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={handlePayWithCrypto}
        >
          <FontAwesome6 name="bitcoin" size={24} color="#F7931A" />
          <Text>Crypto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cryptoPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7931A",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  cryptoPaymentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  paymentOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  paymentOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
});

export default PremiumSubscriptionExample;

function AdvancedCryptoPaymentExample() {
  const { token } = useAuth();
  const { payment, loading, error, createPayment, verifyPayment, checkStatus } =
    useCryptoPayment(token || "");

  const [txHash, setTxHash] = useState("");

  // Step 1: Create payment
  const handleCreatePayment = async () => {
    const result = await createPayment({
      amountUsd: 9.99,
      currency: "USDT",
      network: "tron",
      birdId: "bird-id",
      purpose: "premium_subscription",
      plan: "monthly",
    });

    if (result) {
      console.log("✅ Payment created:", result.id);
      console.log("📱 Show QR code for:", result.walletAddress);
      console.log("💰 Amount:", result.amountCrypto, result.currency);
      // Display QR code and payment details to user
    } else {
      console.error("❌ Error:", error);
    }
  };

  // Step 2: Verify transaction after user pays
  const handleVerifyTransaction = async () => {
    if (!payment?.id || !txHash) return;

    const result = await verifyPayment(payment.id, txHash);
    if (result) {
      console.log("✅ Transaction verified:", result.status);
      // Start polling for confirmations
    }
  };

  // Step 3: Check status manually
  const handleCheckStatus = async () => {
    if (!payment?.id) return;

    const result = await checkStatus(payment.id);
    if (result) {
      console.log("📊 Status:", result.status);
      console.log(
        "🔗 Confirmations:",
        result.confirmations,
        "/",
        result.requiredConfirmations
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Your custom UI here */}
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {!payment && (
        <TouchableOpacity onPress={handleCreatePayment}>
          <Text>Create Payment</Text>
        </TouchableOpacity>
      )}

      {payment && payment.status === "pending" && (
        <View>
          <Text>
            Send {payment.amountCrypto} {payment.currency}
          </Text>
          <Text>To: {payment.walletAddress}</Text>
          {/* Show QR code here */}

          <TextInput
            value={txHash}
            onChangeText={setTxHash}
            placeholder="Enter transaction hash"
          />
          <TouchableOpacity onPress={handleVerifyTransaction}>
            <Text>Verify Transaction</Text>
          </TouchableOpacity>
        </View>
      )}

      {payment && payment.status === "confirming" && (
        <View>
          <Text>
            Confirming: {payment.confirmations}/{payment.requiredConfirmations}
          </Text>
          <TouchableOpacity onPress={handleCheckStatus}>
            <Text>Check Status</Text>
          </TouchableOpacity>
        </View>
      )}

      {payment && payment.status === "completed" && (
        <View>
          <Text>✅ Payment Complete!</Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// Simplest Example: Just Navigate
// ============================================

function SimpleExample() {
  const navigateToCryptoPayment = () => {
    router.push({
      pathname: "/crypto-payment",
      params: {
        amount: "9.99",
        birdId: "bird-id",
        plan: "monthly",
        purpose: "premium_subscription",
      },
    });
  };

  return (
    <TouchableOpacity onPress={navigateToCryptoPayment}>
      <Text>Pay with Crypto</Text>
    </TouchableOpacity>
  );
}

// ============================================
// Where to Add This in Your App
// ============================================

/*
Typical locations to add crypto payment option:

1. Premium Subscription Screen
   - File: app/premium-subscription.tsx (if exists)
   - Component: premium-subscription-manager.tsx
   - Add as payment method alongside credit cards

2. Bird Profile Upgrade Flow
   - File: components/premium-bird-upgrade-flow.tsx
   - Add crypto option in payment selection

3. Payment Methods Settings
   - File: app/payment-methods.tsx
   - Show saved crypto wallets (future feature)

4. Checkout/Cart Screen
   - Add crypto as payment option
   - Calculate totals in crypto automatically

Example Integration Points:
- After user selects premium plan
- In payment method selection
- As alternative to Apple Pay/Google Pay
- In settings for recurring payments
*/
