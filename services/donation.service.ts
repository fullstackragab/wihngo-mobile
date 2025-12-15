/**
 * Donation Service
 * High-level service for managing the donation/support flow
 */

import type {
  CreateInvoiceRequest,
  Invoice,
  InvoiceEvent,
} from "@/types/invoice";
import { createInvoice } from "./invoice.service";
import { sseService } from "./sse.service";
import { buildSolanaPayUri, openSolanaPayUri } from "./wallet.service";

/**
 * Start donation flow
 */
export async function startDonation(
  request: CreateInvoiceRequest
): Promise<Invoice> {
  try {
    const response = await createInvoice(request);
    return response.invoice;
  } catch (error) {
    console.error("Error starting donation:", error);
    throw error;
  }
}

/**
 * Process Solana payment
 */
export async function processSolanaPayment(invoice: Invoice): Promise<void> {
  try {
    const uri = buildSolanaPayUri(invoice);
    await openSolanaPayUri(uri);
  } catch (error) {
    console.error("Error processing Solana payment:", error);
    throw error;
  }
}

/**
 * Process Base/EVM payment
 * @deprecated Base network is no longer supported. Use Solana only.
 */
export async function processBasePayment(invoice: Invoice): Promise<string> {
  throw new Error(
    "Base network is no longer supported. Please use Solana network for crypto payments."
  );
}

/**
 * Monitor invoice with SSE
 */
export async function monitorInvoice(
  invoiceId: string,
  onEvent: (event: InvoiceEvent) => void
): Promise<() => void> {
  try {
    return await sseService.subscribeToInvoice(invoiceId, onEvent);
  } catch (error) {
    console.error("Error monitoring invoice:", error);
    throw error;
  }
}

/**
 * Get payment instructions for invoice
 */
export function getPaymentInstructions(invoice: Invoice): {
  title: string;
  steps: string[];
} {
  const { payment_method } = invoice;

  if (payment_method === "paypal") {
    return {
      title: "Complete payment with PayPal",
      steps: [
        "You will be redirected to PayPal",
        "Log in to your PayPal account",
        "Complete the payment",
        "You will be redirected back to the app",
      ],
    };
  } else if (payment_method.startsWith("solana_")) {
    return {
      title: "Pay with Solana wallet",
      steps: [
        "Open your Solana wallet (Phantom, Solflare, etc.)",
        `Send ${invoice.expected_token_amount} ${invoice.token_symbol}`,
        `To address: ${invoice.merchant_address}`,
        "We will detect your payment automatically",
      ],
    };
  } else if (payment_method.startsWith("base_")) {
    return {
      title: "Pay with Base wallet",
      steps: [
        "Connect your Base-compatible wallet",
        `Approve transfer of ${invoice.expected_token_amount} ${invoice.token_symbol}`,
        "Confirm the transaction in your wallet",
        "We will detect your payment automatically",
      ],
    };
  }

  return {
    title: "Complete payment",
    steps: ["Follow the instructions to complete your payment"],
  };
}

/**
 * Format invoice amount for display
 */
export function formatInvoiceAmount(invoice: Invoice): string {
  const { amount_fiat, fiat_currency, expected_token_amount, token_symbol } =
    invoice;

  const fiatFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: fiat_currency,
  }).format(amount_fiat);

  if (expected_token_amount && token_symbol) {
    return `${fiatFormatted} (${expected_token_amount} ${token_symbol})`;
  }

  return fiatFormatted;
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: Invoice["payment_status"]): {
  text: string;
  color: string;
} {
  const statusMap: Record<
    Invoice["payment_status"],
    { text: string; color: string }
  > = {
    DRAFT: { text: "Draft", color: "#6B7280" },
    PENDING_PAYMENT: { text: "Awaiting Payment", color: "#F59E0B" },
    PROCESSING: { text: "Processing", color: "#3B82F6" },
    CONFIRMED: { text: "Confirmed", color: "#10B981" },
    FAILED: { text: "Failed", color: "#EF4444" },
    EXPIRED: { text: "Expired", color: "#6B7280" },
    CANCELLED: { text: "Cancelled", color: "#6B7280" },
  };

  return statusMap[status] || { text: "Unknown", color: "#6B7280" };
}

/**
 * Check if invoice is terminal (no further updates expected)
 */
export function isTerminalStatus(status: Invoice["payment_status"]): boolean {
  return ["CONFIRMED", "FAILED", "EXPIRED", "CANCELLED"].includes(status);
}

/**
 * Get time remaining until expiration
 */
export function getTimeRemaining(expiresAt: string): {
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { minutes: 0, seconds: 0, expired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { minutes, seconds, expired: false };
}
