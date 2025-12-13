/**
 * Donation History Screen
 * Lists all invoices with download buttons for receipts
 */

import {
  formatInvoiceAmount,
  getStatusDisplayText,
} from "@/services/donation.service";
import { downloadReceipt, getInvoiceList } from "@/services/invoice.service";
import type { Invoice } from "@/types/invoice";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DonationHistoryScreen() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await getInvoiceList(pageNum, 20);

      if (pageNum === 1) {
        setInvoices(response.invoices);
      } else {
        setInvoices((prev) => [...prev, ...response.invoices]);
      }

      setPage(pageNum);
      setHasMore(response.invoices.length === 20);
    } catch (error) {
      console.error("Error loading invoices:", error);
      Alert.alert("Error", "Failed to load invoice history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInvoices(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadInvoices(page + 1);
    }
  };

  const handleDownloadReceipt = async (invoice: Invoice) => {
    if (!invoice.issued_pdf_url || !invoice.invoice_number) {
      Alert.alert("Not Available", "Receipt is not yet available for download");
      return;
    }

    try {
      setDownloadingIds((prev) => new Set(prev).add(invoice.id));
      await downloadReceipt(invoice.id, invoice.invoice_number);
      Alert.alert("Success", "Receipt downloaded successfully!");
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      Alert.alert("Error", error.message || "Failed to download receipt");
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(invoice.id);
        return next;
      });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Navigate to result screen
    router.push({
      pathname: "/donation/result",
      params: { invoiceId: invoice.id },
    });
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const statusDisplay = getStatusDisplayText(item.payment_status);
    const isDownloading = downloadingIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => handleViewInvoice(item)}
        activeOpacity={0.7}
      >
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>
              {item.invoice_number || `Invoice #${item.id.slice(0, 8)}`}
            </Text>
            <Text style={styles.invoiceDate}>
              {new Date(
                item.invoice_date || item.created_at
              ).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusDisplay.color + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{formatInvoiceAmount(item)}</Text>
          </View>

          {item.bird_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supporting:</Text>
              <Text style={styles.detailValue}>{item.bird_name}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {getPaymentMethodName(item.payment_method)}
            </Text>
          </View>
        </View>

        {item.issued_pdf_url && item.payment_status === "CONFIRMED" && (
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloading && styles.downloadButtonDisabled,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleDownloadReceipt(item);
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <>
                <Text style={styles.downloadIcon}>📄</Text>
                <Text style={styles.downloadText}>Download Receipt</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!item.issued_pdf_url && item.payment_status === "CONFIRMED" && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳ Receipt being generated</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Donations Yet</Text>
      <Text style={styles.emptyText}>
        Your donation history will appear here once you make your first
        contribution.
      </Text>
      <TouchableOpacity
        style={styles.donateButton}
        onPress={() => router.push("/donation")}
      >
        <Text style={styles.donateButtonText}>Make a Donation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Donation History</Text>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
}

function getPaymentMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    paypal: "PayPal",
    solana_usdc: "USDC (Solana)",
    solana_eurc: "EURC (Solana)",
    base_usdc: "USDC (Base)",
    base_eurc: "EURC (Base)",
  };
  return methodMap[method] || method;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  invoiceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  downloadIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  pendingBadge: {
    backgroundColor: "#DBEAFE",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pendingText: {
    fontSize: 13,
    color: "#1E40AF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  donateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
