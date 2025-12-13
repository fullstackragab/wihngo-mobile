/**
 * Wallet Service
 * Handles Solana Pay and Base/EVM Reown AppKit integrations
 */

import "@walletconnect/react-native-compat";

import { appKit } from "@/config/AppKitConfig";
import type { Invoice } from "@/types/invoice";
import { type BrowserProvider } from "ethers";
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
 * EVM/Base Payment Types
 */
export interface EvmPaymentParams {
  invoice: Invoice;
  contractAddress?: string;
  useContract?: boolean;
}

/**
 * Build EVM transfer payload
 * For ERC-20 transfers (USDC/EURC on Base)
 */
export function buildEvmTransferPayload(invoice: Invoice): {
  to: string;
  data: string;
  value: string;
} {
  const { merchant_address, expected_token_amount, token_symbol } = invoice;

  if (!merchant_address || !expected_token_amount || !token_symbol) {
    throw new Error("Missing required fields for EVM transfer");
  }

  // Token contract addresses on Base mainnet
  const TOKEN_CONTRACTS: Record<string, string> = {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    EURC: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  };

  const tokenContract =
    TOKEN_CONTRACTS[token_symbol as keyof typeof TOKEN_CONTRACTS];
  if (!tokenContract) {
    throw new Error(`Unsupported token on Base: ${token_symbol}`);
  }

  // ERC-20 transfer function signature: transfer(address,uint256)
  const transferSignature = "0xa9059cbb";

  // Pad address to 32 bytes (remove 0x prefix, pad left with zeros)
  const recipientPadded = merchant_address.slice(2).padStart(64, "0");

  // Convert amount to token units (USDC/EURC have 6 decimals)
  const decimals = 6;
  const amountInUnits = Math.floor(
    expected_token_amount * Math.pow(10, decimals)
  );
  const amountHex = amountInUnits.toString(16).padStart(64, "0");

  // Construct data payload
  const data = `${transferSignature}${recipientPadded}${amountHex}`;

  return {
    to: tokenContract,
    data,
    value: "0x0", // No native token transfer
  };
}

/**
 * Reown AppKit Integration
 * Uses Reown AppKit (formerly WalletConnect) for EVM wallet connections
 */

/**
 * Connect wallet using Reown AppKit
 * Opens the wallet selection modal
 */
export async function connectWallet(): Promise<string> {
  try {
    // Open AppKit modal
    await appKit.open();

    // Wait for connection
    const account = appKit.getAccount();

    if (!account?.address) {
      throw new Error("No wallet connected");
    }

    return account.address;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

/**
 * Get connected wallet address
 */
export function getConnectedAddress(): string | null {
  const account = appKit.getAccount();
  return account?.address || null;
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  const account = appKit.getAccount();
  return account?.isConnected || false;
}

/**
 * Send EVM payment using connected wallet
 * Sends ERC-20 token transfer on Base network
 */
export async function sendEvmPayment(invoice: Invoice): Promise<string> {
  try {
    const account = appKit.getAccount();

    if (!account?.isConnected || !account.address) {
      throw new Error(
        "Wallet not connected. Please connect your wallet first."
      );
    }

    const payload = buildEvmTransferPayload(invoice);

    // Get the provider from AppKit
    const provider = appKit.getProvider() as BrowserProvider;

    if (!provider) {
      throw new Error("Provider not available");
    }

    // Send transaction
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: payload.to,
      data: payload.data,
      value: payload.value,
    });

    console.log("EVM payment sent:", tx.hash);

    // Wait for confirmation
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error("Error sending EVM payment:", error);
    throw error;
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  try {
    await appKit.disconnect();
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    throw error;
  }
}

/**
 * Get blockchain explorer URL for transaction
 */
export function getExplorerUrl(
  txHash: string,
  network: "solana" | "base"
): string {
  if (network === "solana") {
    return `https://explorer.solana.com/tx/${txHash}`;
  } else if (network === "base") {
    return `https://basescan.org/tx/${txHash}`;
  }
  return "";
}
