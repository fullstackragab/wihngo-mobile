/**
 * Wallet Service
 * Handles Solana Pay integration for USDC and EURC payments
 */

import type { Invoice } from "@/types/invoice";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

/**
 * Solana Pay URI Builder
 * Builds Solana Pay URIs for USDC/EURC payments
 */
export function buildSolanaPayUri(invoice: Invoice): string {
  if (!invoice.solana_pay_uri) {
    // Fallback: build URI manually if backend doesn't provide it
    const {
      merchant_address,
      expected_token_amount,
      token_symbol,
      invoice_number,
    } = invoice;

    if (!merchant_address || !expected_token_amount || !token_symbol) {
      throw new Error("Missing required fields for Solana Pay URI");
    }

    // Solana Pay URI format: solana:<recipient>?amount=<amount>&spl-token=<mint>&reference=<reference>&label=<label>&message=<message>
    // Token mint addresses (mainnet)
    const TOKEN_MINTS: Record<string, string> = {
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      EURC: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    };

    const tokenMint = TOKEN_MINTS[token_symbol as keyof typeof TOKEN_MINTS];
    if (!tokenMint) {
      throw new Error(`Unsupported token: ${token_symbol}`);
    }

    const params = new URLSearchParams({
      amount: expected_token_amount.toString(),
      "spl-token": tokenMint,
      reference: invoice.id,
      label: "Wihngo Support",
      message: `Invoice ${invoice_number || invoice.id}`,
    });

    return `solana:${merchant_address}?${params.toString()}`;
  }

  return invoice.solana_pay_uri;
}

/**
 * Open Solana Pay URI in wallet app
 */
export async function openSolanaPayUri(uri: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(uri);

    if (canOpen) {
      await Linking.openURL(uri);
    } else {
      // If no wallet app is installed, we can show QR code or web wallet
      throw new Error(
        "No Solana wallet app found. Please install Phantom or another Solana wallet."
      );
    }
  } catch (error) {
    console.error("Error opening Solana Pay URI:", error);
    throw error;
  }
}

/**
 * Copy Solana Pay URI to clipboard
 */
export async function copySolanaPayUri(uri: string): Promise<void> {
  await Clipboard.setStringAsync(uri);
}


/**
 * Get blockchain explorer URL for transaction - Solana only
 */
export function getExplorerUrl(txHash: string, network: "solana"): string {
  return `https://explorer.solana.com/tx/${txHash}`;
}
