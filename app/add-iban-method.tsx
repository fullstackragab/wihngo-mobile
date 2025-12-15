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

export default function AddIbanMethod() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    iban: "",
    bic: "",
    bankName: "",
  });

  const validateIban = (iban: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, "").toUpperCase();

    // Basic IBAN validation (length and format)
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      return false;
    }

    // Check if starts with 2 letters followed by 2 digits
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    return ibanRegex.test(cleanIban);
  };

  const formatIban = (value: string): string => {
    // Remove all spaces
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    // Add space every 4 characters
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  };

  const handleIbanChange = (text: string) => {
    const formatted = formatIban(text);
    setFormData({ ...formData, iban: formatted });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.accountHolderName.trim()) {
      Alert.alert("Error", "Please enter account holder name");
      return;
    }

    if (!formData.iban.trim()) {
      Alert.alert("Error", "Please enter IBAN");
      return;
    }

    const cleanIban = formData.iban.replace(/\s/g, "");
    if (!validateIban(cleanIban)) {
      Alert.alert("Error", "Please enter a valid IBAN");
      return;
    }

    setLoading(true);
    try {
      // TODO: Uncomment when backend is ready
      // await payoutService.addPayoutMethod({
      //   methodType: 'iban',
      //   accountHolderName: formData.accountHolderName,
      //   iban: cleanIban,
      //   bic: formData.bic || undefined,
      //   bankName: formData.bankName || undefined,
      //   isDefault: true,
      // });

      Alert.alert("Success", "IBAN payment method added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to add IBAN method:", error);
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
          <Ionicons name="card-outline" size={48} color="#4ECDC4" />
          <Text style={styles.title}>Add IBAN (SEPA)</Text>
          <Text style={styles.subtitle}>
            Enter your bank account details to receive payouts
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What you need:</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>
                Your full name (as on bank account)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>IBAN number (required)</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>BIC/SWIFT code (optional)</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.infoText}>Bank name (optional)</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Account Holder Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={formData.accountHolderName}
              onChangeText={(text) =>
                setFormData({ ...formData, accountHolderName: text })
              }
              autoCapitalize="words"
            />
            <Text style={styles.hint}>
              Must match the name on your bank account
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              IBAN <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DE89 3704 0044 0532 0130 00"
              value={formData.iban}
              onChangeText={handleIbanChange}
              autoCapitalize="characters"
              keyboardType="default"
            />
            <Text style={styles.hint}>International Bank Account Number</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>BIC/SWIFT Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="COBADEFFXXX"
              value={formData.bic}
              onChangeText={(text) =>
                setFormData({ ...formData, bic: text.toUpperCase() })
              }
              autoCapitalize="characters"
              maxLength={11}
            />
            <Text style={styles.hint}>
              Required for some international transfers
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bank Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Commerzbank"
              value={formData.bankName}
              onChangeText={(text) =>
                setFormData({ ...formData, bankName: text })
              }
              autoCapitalize="words"
            />
            <Text style={styles.hint}>
              Your bank's name for easier identification
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
            <Text style={styles.securityTitle}>Your data is secure</Text>
          </View>
          <Text style={styles.securityText}>
            Your bank details are encrypted and stored securely. We never share
            your financial information with third parties.
          </Text>
        </View>

        {/* Fees Info */}
        <View style={styles.feesCard}>
          <Text style={styles.feesTitle}>SEPA Transfer Fees</Text>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Transaction fee:</Text>
            <Text style={styles.feesValue}>€0 - €1</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={styles.feesLabel}>Processing time:</Text>
            <Text style={styles.feesValue}>1-3 business days</Text>
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
  form: {
    padding: Spacing.md,
    gap: Spacing.lg,
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
  securityCard: {
    backgroundColor: "#E8F8F5",
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A9DFBF",
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
    color: "#27AE60",
  },
  securityText: {
    fontSize: Typography.small,
    color: "#2C3E50",
    lineHeight: 18,
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
