import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentMethods() {
  const paymentMethods = [
    {
      id: 1,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiry: "12/25",
      isDefault: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>

        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="credit-card" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No payment methods added</Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.cardInfo}>
                <FontAwesome6 name="credit-card" size={24} color="#007AFF" />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardBrand}>
                    {method.brand} •••• {method.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton}>
          <FontAwesome6 name="plus" size={16} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <FontAwesome6 name="shield-halved" size={20} color="#28a745" />
        <Text style={styles.infoText}>
          All payment information is encrypted and secure
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDetails: {
    gap: 4,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  cardExpiry: {
    fontSize: 13,
    color: "#666",
  },
  defaultBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
  },
});
