/**
 * Invoice Types for Donation/Support System
 * Handles PayPal + USDC/EURC on Solana + Base
 */

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "CONFIRMED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export type PaymentMethod = "paypal" | "solana_usdc" | "solana_eurc";

export type InvoiceEventType =
  | "INVOICE_CREATED"
  | "PAYMENT_DETECTED"
  | "PAYMENT_CONFIRMED"
  | "INVOICE_ISSUED"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface Invoice {
  id: string;
  invoice_number?: string;
  invoice_date?: string;
  user_id: string;
  bird_id?: string;
  bird_name?: string;
  amount_fiat: number;
  fiat_currency: "USD" | "EUR";
  payment_method: PaymentMethod;
  payment_status: InvoiceStatus;

  // Crypto-specific fields
  expected_token_amount?: number;
  token_symbol?: string;
  network?: "solana";
  merchant_address?: string;

  // Payment URIs
  solana_pay_uri?: string;
  evm_payment_uri?: string;
  paypal_checkout_url?: string;

  // Transaction details
  payer_address?: string;
  transaction_hash?: string;
  blockchain_explorer_url?: string;

  // Receipt
  issued_pdf_url?: string;

  // Timestamps
  expires_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  bird_id?: string;
  amount_fiat: number;
  fiat_currency: "USD" | "EUR";
  payment_method: PaymentMethod;
}

export interface CreateInvoiceResponse {
  invoice: Invoice;
  payment_uri?: string;
  qr_code_data?: string;
}

export interface InvoiceEvent {
  event_type: InvoiceEventType;
  invoice_id: string;
  timestamp: string;
  data: {
    status?: InvoiceStatus;
    transaction_hash?: string;
    issued_pdf_url?: string;
    message?: string;
  };
}

/**
 * Payment source type indicating how the payment was made
 * - manual: User sent funds manually via any wallet app
 * - phantom: User approved payment directly through Phantom wallet
 */
export type PaymentSource = "manual" | "phantom";

export interface SubmitPaymentRequest {
  invoice_id: string;
  transaction_hash: string;
  payer_address: string;
  network: "solana";
  token_symbol: string;
  /** Optional: indicates how the payment was initiated */
  payment_source?: PaymentSource;
  /** Optional: memo attached to the transaction for reconciliation */
  memo?: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}
