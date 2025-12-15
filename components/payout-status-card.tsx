import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface PayoutStatusInfo {
  status: "pending" | "payable" | "paid";
  balance: number;
  nextPayoutDate?: string;
  minimumPayout: number;
}

interface PayoutStatusCardProps {
  info: PayoutStatusInfo;
}

export default function PayoutStatusCard({ info }: PayoutStatusCardProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (info.status) {
      case "pending":
        return {
          icon: "time-outline" as const,
          color: "#F39C12",
          backgroundColor: "#FEF5E7",
          title: t("payout.pending"),
          description: t("payout.statusPending"),
        };
      case "payable":
        return {
          icon: "checkmark-circle-outline" as const,
          color: "#27AE60",
          backgroundColor: "#D5F4E6",
          title: t("payout.payable"),
          description: t("payout.statusPayable"),
        };
      case "paid":
        return {
          icon: "checkmark-done-circle" as const,
          color: "#3498DB",
          backgroundColor: "#EBF5FB",
          title: t("payout.paid"),
          description: t("payout.statusPaid"),
        };
    }
  };

  const config = getStatusConfig();
  const formattedDate = info.nextPayoutDate
    ? new Date(info.nextPayoutDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor, borderColor: config.color },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={24} color="#fff" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.statusTitle, { color: config.color }]}>
            {config.title}
          </Text>
          {info.status === "pending" && info.balance < info.minimumPayout && (
            <Text style={styles.balanceText}>
              €{info.balance.toFixed(2)} / €{info.minimumPayout.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.description}>{config.description}</Text>

      {formattedDate && info.status !== "paid" && (
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            {t("payout.nextPayout")}: {formattedDate}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  balanceText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
});
