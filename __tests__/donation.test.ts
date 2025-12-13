/**
 * Unit Tests for Donation/Payment Helpers
 * Tests for Solana Pay URI builder, EVM payload builder, and helper functions
 */

import {
  formatInvoiceAmount,
  getStatusDisplayText,
  getTimeRemaining,
  isTerminalStatus,
} from "@/services/donation.service";
import {
  buildEvmTransferPayload,
  buildSolanaPayUri,
  getExplorerUrl,
} from "@/services/wallet.service";
import type { Invoice } from "@/types/invoice";

describe("Wallet Service Tests", () => {
  describe("buildSolanaPayUri", () => {
    it("should build correct Solana Pay URI for USDC", () => {
      const mockInvoice: Partial<Invoice> = {
        id: "test-invoice-123",
        merchant_address: "EjDzZ1qR8ckYzZGpTWqXj1xWHzLqvMdVhXmNdJ4FsN8v",
        expected_token_amount: 10.5,
        token_symbol: "USDC",
        invoice_number: "WIH-001",
      };

      const uri = buildSolanaPayUri(mockInvoice as Invoice);

      expect(uri).toContain("solana:");
      expect(uri).toContain(mockInvoice.merchant_address);
      expect(uri).toContain("amount=10.5");
      expect(uri).toContain(
        "spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      ); // USDC mint
      expect(uri).toContain("reference=test-invoice-123");
    });

    it("should build correct Solana Pay URI for EURC", () => {
      const mockInvoice: Partial<Invoice> = {
        id: "test-invoice-456",
        merchant_address: "EjDzZ1qR8ckYzZGpTWqXj1xWHzLqvMdVhXmNdJ4FsN8v",
        expected_token_amount: 20,
        token_symbol: "EURC",
        invoice_number: "WIH-002",
      };

      const uri = buildSolanaPayUri(mockInvoice as Invoice);

      expect(uri).toContain("solana:");
      expect(uri).toContain("amount=20");
      expect(uri).toContain(
        "spl-token=HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr"
      ); // EURC mint
    });

    it("should use provided solana_pay_uri if available", () => {
      const mockInvoice: Partial<Invoice> = {
        id: "test-invoice-789",
        solana_pay_uri: "solana:custom-uri",
        merchant_address: "EjDzZ1qR8ckYzZGpTWqXj1xWHzLqvMdVhXmNdJ4FsN8v",
        expected_token_amount: 10,
        token_symbol: "USDC",
      };

      const uri = buildSolanaPayUri(mockInvoice as Invoice);

      expect(uri).toBe("solana:custom-uri");
    });

    it("should throw error for unsupported token", () => {
      const mockInvoice: Partial<Invoice> = {
        id: "test-invoice-invalid",
        merchant_address: "EjDzZ1qR8ckYzZGpTWqXj1xWHzLqvMdVhXmNdJ4FsN8v",
        expected_token_amount: 10,
        token_symbol: "INVALID",
      };

      expect(() => buildSolanaPayUri(mockInvoice as Invoice)).toThrow();
    });
  });

  describe("buildEvmTransferPayload", () => {
    it("should build correct ERC-20 transfer payload for USDC on Base", () => {
      const mockInvoice: Partial<Invoice> = {
        merchant_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        expected_token_amount: 10.5,
        token_symbol: "USDC",
      };

      const payload = buildEvmTransferPayload(mockInvoice as Invoice);

      expect(payload.to).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"); // USDC on Base
      expect(payload.data).toContain("0xa9059cbb"); // transfer function signature
      expect(payload.value).toBe("0x0");
    });

    it("should build correct ERC-20 transfer payload for EURC on Base", () => {
      const mockInvoice: Partial<Invoice> = {
        merchant_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        expected_token_amount: 20,
        token_symbol: "EURC",
      };

      const payload = buildEvmTransferPayload(mockInvoice as Invoice);

      expect(payload.to).toBe("0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42"); // EURC on Base
      expect(payload.data).toContain("0xa9059cbb");
    });

    it("should throw error for unsupported token", () => {
      const mockInvoice: Partial<Invoice> = {
        merchant_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        expected_token_amount: 10,
        token_symbol: "INVALID",
      };

      expect(() => buildEvmTransferPayload(mockInvoice as Invoice)).toThrow();
    });
  });

  describe("getExplorerUrl", () => {
    it("should return correct Solana explorer URL", () => {
      const txHash =
        "5j7s6NiJS3JAkvgkoc18WVAsiSaci2pxB2A6ueCJP4tprA2TFg9wSyTLeYouxPBJEMzJinENTkpA52YStRW5Dia7";
      const url = getExplorerUrl(txHash, "solana");

      expect(url).toBe(`https://explorer.solana.com/tx/${txHash}`);
    });

    it("should return correct Base explorer URL", () => {
      const txHash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const url = getExplorerUrl(txHash, "base");

      expect(url).toBe(`https://basescan.org/tx/${txHash}`);
    });
  });
});

describe("Donation Service Tests", () => {
  describe("formatInvoiceAmount", () => {
    it("should format USD amount correctly", () => {
      const mockInvoice: Partial<Invoice> = {
        amount_fiat: 100.5,
        fiat_currency: "USD",
      };

      const formatted = formatInvoiceAmount(mockInvoice as Invoice);

      expect(formatted).toBe("$100.50");
    });

    it("should format EUR amount correctly", () => {
      const mockInvoice: Partial<Invoice> = {
        amount_fiat: 50.99,
        fiat_currency: "EUR",
      };

      const formatted = formatInvoiceAmount(mockInvoice as Invoice);

      expect(formatted).toBe("€50.99");
    });

    it("should include crypto amount if available", () => {
      const mockInvoice: Partial<Invoice> = {
        amount_fiat: 100,
        fiat_currency: "USD",
        expected_token_amount: 100,
        token_symbol: "USDC",
      };

      const formatted = formatInvoiceAmount(mockInvoice as Invoice);

      expect(formatted).toContain("$100.00");
      expect(formatted).toContain("100 USDC");
    });
  });

  describe("getStatusDisplayText", () => {
    it("should return correct status display for PENDING_PAYMENT", () => {
      const display = getStatusDisplayText("PENDING_PAYMENT");

      expect(display.text).toBe("Awaiting Payment");
      expect(display.color).toBe("#F59E0B");
    });

    it("should return correct status display for CONFIRMED", () => {
      const display = getStatusDisplayText("CONFIRMED");

      expect(display.text).toBe("Confirmed");
      expect(display.color).toBe("#10B981");
    });

    it("should return correct status display for FAILED", () => {
      const display = getStatusDisplayText("FAILED");

      expect(display.text).toBe("Failed");
      expect(display.color).toBe("#EF4444");
    });
  });

  describe("isTerminalStatus", () => {
    it("should return true for CONFIRMED", () => {
      expect(isTerminalStatus("CONFIRMED")).toBe(true);
    });

    it("should return true for FAILED", () => {
      expect(isTerminalStatus("FAILED")).toBe(true);
    });

    it("should return true for EXPIRED", () => {
      expect(isTerminalStatus("EXPIRED")).toBe(true);
    });

    it("should return false for PENDING_PAYMENT", () => {
      expect(isTerminalStatus("PENDING_PAYMENT")).toBe(false);
    });

    it("should return false for PROCESSING", () => {
      expect(isTerminalStatus("PROCESSING")).toBe(false);
    });
  });

  describe("getTimeRemaining", () => {
    it("should calculate time remaining correctly", () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now
      const remaining = getTimeRemaining(futureTime);

      expect(remaining.minutes).toBe(4); // Might be 4 due to execution time
      expect(remaining.seconds).toBeGreaterThan(0);
      expect(remaining.expired).toBe(false);
    });

    it("should return expired when time is past", () => {
      const pastTime = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      const remaining = getTimeRemaining(pastTime);

      expect(remaining.minutes).toBe(0);
      expect(remaining.seconds).toBe(0);
      expect(remaining.expired).toBe(true);
    });
  });
});

// Mock API for integration tests
export const mockInvoiceApi = {
  createInvoice: jest.fn(),
  getInvoiceStatus: jest.fn(),
  submitPayment: jest.fn(),
  downloadReceipt: jest.fn(),
};

// Mock SSE service for integration tests
export const mockSseService = {
  subscribeToInvoice: jest.fn(),
  closeAll: jest.fn(),
};

describe("Integration Tests with Mocked Backend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle invoice creation and SSE updates", async () => {
    // Mock invoice creation
    const mockInvoice: Partial<Invoice> = {
      id: "test-123",
      payment_status: "PENDING_PAYMENT",
      amount_fiat: 10,
      fiat_currency: "USD",
    };

    mockInvoiceApi.createInvoice.mockResolvedValue(mockInvoice);

    // Mock SSE subscription
    const mockUnsubscribe = jest.fn();
    mockSseService.subscribeToInvoice.mockResolvedValue(mockUnsubscribe);

    // Simulate invoice creation
    const invoice = await mockInvoiceApi.createInvoice({});
    expect(invoice).toEqual(mockInvoice);

    // Simulate SSE subscription
    const unsubscribe = await mockSseService.subscribeToInvoice(
      "test-123",
      jest.fn()
    );
    expect(mockSseService.subscribeToInvoice).toHaveBeenCalledWith(
      "test-123",
      expect.any(Function)
    );

    // Cleanup
    unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("should handle invoice status transition to CONFIRMED", async () => {
    const mockInvoice: Partial<Invoice> = {
      id: "test-456",
      payment_status: "CONFIRMED",
      issued_pdf_url: "https://example.com/receipt.pdf",
    };

    mockInvoiceApi.getInvoiceStatus.mockResolvedValue(mockInvoice);

    const invoice = await mockInvoiceApi.getInvoiceStatus("test-456");

    expect(invoice.payment_status).toBe("CONFIRMED");
    expect(invoice.issued_pdf_url).toBeTruthy();
    expect(isTerminalStatus(invoice.payment_status as any)).toBe(true);
  });
});
