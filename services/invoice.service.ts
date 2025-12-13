/**
 * Invoice Service
 * Handles invoice creation, status checking, and receipt downloads
 */

import type {
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  Invoice,
  InvoiceListResponse,
  SubmitPaymentRequest,
} from "@/types/invoice";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiRequest } from "./api-helper";

const BASE_ENDPOINT = "/v1/invoices";

/**
 * Create a new invoice for donation/support
 */
export async function createInvoice(
  request: CreateInvoiceRequest
): Promise<CreateInvoiceResponse> {
  return apiRequest<CreateInvoiceResponse>({
    endpoint: `${BASE_ENDPOINT}`,
    method: "POST",
    body: request,
  });
}

/**
 * Get invoice status by ID
 */
export async function getInvoiceStatus(invoiceId: string): Promise<Invoice> {
  return apiRequest<Invoice>({
    endpoint: `${BASE_ENDPOINT}/${invoiceId}/status`,
    method: "GET",
  });
}

/**
 * Get invoice details by ID
 */
export async function getInvoice(invoiceId: string): Promise<Invoice> {
  return apiRequest<Invoice>({
    endpoint: `${BASE_ENDPOINT}/${invoiceId}`,
    method: "GET",
  });
}

/**
 * Get list of invoices for current user
 */
export async function getInvoiceList(
  page: number = 1,
  limit: number = 20
): Promise<InvoiceListResponse> {
  return apiRequest<InvoiceListResponse>({
    endpoint: `${BASE_ENDPOINT}?page=${page}&limit=${limit}`,
    method: "GET",
  });
}

/**
 * Submit payment transaction hash manually
 */
export async function submitPayment(
  request: SubmitPaymentRequest
): Promise<Invoice> {
  return apiRequest<Invoice>({
    endpoint: `/v1/payments/submit`,
    method: "POST",
    body: request,
  });
}

/**
 * Download and share invoice receipt PDF
 */
export async function downloadReceipt(
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  try {
    const downloadUrl = `${BASE_ENDPOINT}/${invoiceId}/download`;

    // Check if sharing is available
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    // Create filename
    const filename = `Wihngo_Receipt_${invoiceNumber}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download receipt: ${downloadResult.status}`);
    }

    // Share the file
    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Download Receipt",
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    console.error("Error downloading receipt:", error);
    throw error;
  }
}

/**
 * Cancel an invoice
 */
export async function cancelInvoice(invoiceId: string): Promise<Invoice> {
  return apiRequest<Invoice>({
    endpoint: `${BASE_ENDPOINT}/${invoiceId}/cancel`,
    method: "POST",
  });
}

/**
 * Poll invoice status with exponential backoff
 */
export async function pollInvoiceStatus(
  invoiceId: string,
  onStatusUpdate: (invoice: Invoice) => void,
  maxAttempts: number = 60,
  initialDelayMs: number = 2000
): Promise<void> {
  let attempts = 0;
  let delay = initialDelayMs;

  const poll = async () => {
    try {
      attempts++;
      const invoice = await getInvoiceStatus(invoiceId);
      onStatusUpdate(invoice);

      // Stop polling if terminal state reached
      if (
        invoice.payment_status === "CONFIRMED" ||
        invoice.payment_status === "FAILED" ||
        invoice.payment_status === "EXPIRED" ||
        invoice.payment_status === "CANCELLED"
      ) {
        return;
      }

      // Continue polling if not max attempts
      if (attempts < maxAttempts) {
        // Exponential backoff with max 10 seconds
        delay = Math.min(delay * 1.5, 10000);
        setTimeout(poll, delay);
      }
    } catch (error) {
      console.error("Error polling invoice status:", error);
      // Retry with backoff
      if (attempts < maxAttempts) {
        delay = Math.min(delay * 2, 10000);
        setTimeout(poll, delay);
      }
    }
  };

  poll();
}
