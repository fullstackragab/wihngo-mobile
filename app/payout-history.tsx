import { Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { PayoutHistoryItem } from "@/types/payout";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PayoutHistory() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<PayoutHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadPayoutHistory();
    }
  }, [isAuthenticated]);

  const loadPayoutHistory = async (pageNum: number = 1) => {
    try {
      setLoading(pageNum === 1);

      // TODO: Uncomment when backend is ready
      // const response = await payoutService.getPayoutHistory(pageNum, 20);
      // if (pageNum === 1) {
      //   setTransactions(response.items);
      // } else {
      //   setTransactions(prev => [...prev, ...response.items]);
      // }
      // setHasMore(pageNum < response.totalPages);
      // setPage(pageNum);

      // Mock data for now
      setTransactions([]);
      setHasMore(false);
    } catch (error) {
      console.error("Failed to load payout history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayoutHistory(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPayoutHistory(page + 1);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#27AE60";
      case "pending":
      case "processing":
        return "#F39C12";
      case "failed":
      case "cancelled":
        return "#E74C3C";
      default:
        return "#7F8C8D";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "pending":
        return "time-outline";
      case "processing":
        return "sync-outline";
      case "failed":
        return "close-circle";
      case "cancelled":
        return "ban-outline";
      default:
        return "help-circle-outline";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMethodType = (type: string): string => {
    const typeMap: Record<string, string> = {
      iban: "IBAN/SEPA",
      paypal: "PayPal",
      "usdc-solana": "USDC (Solana)",
      "eurc-solana": "EURC (Solana)",
      "usdc-base": "USDC (Base)",
      "eurc-base": "EURC (Base)",
    };
    return typeMap[type] || type;
  };

  const renderTransaction = ({ item }: { item: PayoutHistoryItem }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status) as any}
              size={20}
              color={getStatusColor(item.status)}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionAmount}>
              €{item.netAmount.toFixed(2)}
            </Text>
            <Text style={styles.transactionMethod}>
              {formatMethodType(item.methodType)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.transactionDate}>
            {formatDate(item.completedAt || item.scheduledAt)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gross amount:</Text>
          <Text style={styles.detailValue}>€{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform fee (5%):</Text>
          <Text style={styles.detailValue}>
            -€{item.platformFee.toFixed(2)}
          </Text>
        </View>
        {item.providerFee > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Provider fee:</Text>
            <Text style={styles.detailValue}>
              -€{item.providerFee.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.detailRow, styles.detailRowTotal]}>
          <Text style={styles.detailLabelTotal}>Net amount:</Text>
          <Text style={styles.detailValueTotal}>
            €{item.netAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      {item.transactionId && (
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionId}>ID: {item.transactionId}</Text>
        </View>
      )}

      {item.status === "failed" && item.failureReason && (
        <View style={styles.errorCard}>
          <Ionicons name="warning" size={16} color="#E74C3C" />
          <Text style={styles.errorText}>{item.failureReason}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyText}>No payout history yet</Text>
      <Text style={styles.emptySubtext}>
        Your payout transactions will appear here
      </Text>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color="#BDC3C7" />
        <Text style={styles.emptyText}>
          Please log in to view payout history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={loading ? null : renderEmptyState()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && transactions.length > 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#4ECDC4" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: "#F8F9FA",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.h3,
    fontWeight: "600",
    color: "#7F8C8D",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.small,
    color: "#95A5A6",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: Typography.h2,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: Typography.small,
    color: "#7F8C8D",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  transactionDate: {
    fontSize: Typography.small,
    color: "#95A5A6",
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: Typography.small,
    color: "#7F8C8D",
  },
  detailValue: {
    fontSize: Typography.small,
    color: "#2C3E50",
  },
  detailRowTotal: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  detailLabelTotal: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: "#2C3E50",
  },
  detailValueTotal: {
    fontSize: Typography.body,
    fontWeight: "bold",
    color: "#27AE60",
  },
  transactionFooter: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  transactionId: {
    fontSize: 11,
    color: "#95A5A6",
    fontFamily: "monospace",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  errorText: {
    fontSize: Typography.small,
    color: "#E74C3C",
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});
