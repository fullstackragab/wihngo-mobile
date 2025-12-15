import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function AddPayPalMethod() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!paypalEmail.trim()) {
      Alert.alert("Error", "Please enter your PayPal email");
      return;
    }

    if (!validateEmail(paypalEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // await payoutService.addPayoutMethod({
      //   methodType: 'paypal',
      //   paypalEmail: paypalEmail.trim().toLowerCase(),
      //   isDefault: true,
      // });

      Alert.alert("Success", "PayPal payment method added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to add PayPal method:", error);
      Alert.alert("Error", "Failed to add payment method. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="logo-paypal" size={48} color="#0070BA" />
          <Text style={styles.title}>Add PayPal</Text>
          <Text style={styles.subtitle}>
            Connect your PayPal account to receive instant payouts
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>PayPal Requirements:</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>Verified PayPal account</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>Business or Personal account</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>
                Account must be in good standing
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>
                Same email used for PayPal login
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              PayPal Email Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={paypalEmail}
              onChangeText={setPaypalEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <Text style={styles.hint}>
              Enter the email address associated with your PayPal account
            </Text>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why PayPal?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={20} color="#F39C12" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Instant Transfers</Text>
                <Text style={styles.benefitText}>
                  Receive your earnings immediately
                </Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="globe" size={20} color="#3498DB" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Worldwide</Text>
                <Text style={styles.benefitText}>
                  Available in 200+ countries
                </Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Secure</Text>
                <Text style={styles.benefitText}>
                  Buyer and seller protection
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fees Info */}
        <View style={styles.feesCard}>
          <Text style={styles.feesTitle}>PayPal Transfer Fees</Text>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>PayPal fee:</Text>
            <Text style={styles.feesValue}>~2-3%</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Processing time:</Text>
            <Text style={styles.feesValue}>Instant</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Wihngo platform fee:</Text>
            <Text style={styles.feesValue}>5%</Text>
          </View>
          <View style={styles.feesNote}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#7F8C8D"
            />
            <Text style={styles.feesNoteText}>
              PayPal fees are deducted from your payout amount
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="lock-closed" size={20} color="#7F8C8D" />
            <Text style={styles.securityTitle}>Privacy & Security</Text>
          </View>
          <Text style={styles.securityText}>
            We only store your PayPal email address. We never have access to
            your PayPal password or account balance. All transactions are
            processed securely through PayPal's API.
          </Text>
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
    backgroundColor: "#E8F4FD",
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
    fontSize: Typography.body,
    color: "#2C3E50",
  },
  hint: {
    fontSize: Typography.small,
    color: "#95A5A6",
  },
  benefitsCard: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  benefitsTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  benefitText: {
    fontSize: Typography.small,
    color: "#7F8C8D",
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
  feesNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  feesNoteText: {
    fontSize: 11,
    color: "#7F8C8D",
    flex: 1,
    lineHeight: 16,
  },
  securityCard: {
    backgroundColor: "#F8F9FA",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  securityTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
  },
  securityText: {
    fontSize: Typography.small,
    color: "#7F8C8D",
    lineHeight: 18,
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
