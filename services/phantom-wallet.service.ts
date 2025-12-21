/**
 * Phantom Wallet Service
 * Handles Phantom wallet connection and payments via deep linking
 * Works with Expo without native modules
 */

import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import { Platform } from "react-native";
import bs58 from "bs58";

// Solana RPC endpoint (mainnet)
const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Token mint addresses (mainnet)
export const TOKEN_MINTS = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  EURC: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
  SOL: "", // Native SOL doesn't have a mint
} as const;

// Token decimals
export const TOKEN_DECIMALS = {
  SOL: 9,
  USDC: 6,
  EURC: 6,
} as const;

// App scheme for deep linking callbacks
const APP_SCHEME = "wihngo";

// Phantom deep link base URLs
const PHANTOM_CONNECT_URL = "https://phantom.app/ul/v1/connect";
const PHANTOM_SIGN_AND_SEND_URL = "https://phantom.app/ul/v1/signAndSendTransaction";

export type SupportedToken = keyof typeof TOKEN_MINTS;

export interface PhantomPaymentParams {
  recipientAddress: string;
  amount: number;
  token: SupportedToken;
  invoiceId: string;
  memo?: string;
}

export interface PhantomPaymentResult {
  success: boolean;
  signature?: string;
  error?: string;
  senderAddress?: string;
}

export interface WalletConnectionResult {
  success: boolean;
  publicKey?: string;
  error?: string;
}

/**
 * Check if Phantom wallet is installed
 */
export async function isPhantomInstalled(): Promise<boolean> {
  try {
    // Check if Phantom app is installed via deep link
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const canOpen = await Linking.canOpenURL("phantom://");
      return canOpen;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Open Phantom app store page for installation
 */
export async function openPhantomInstallPage(): Promise<void> {
  const url =
    Platform.OS === "ios"
      ? "https://apps.apple.com/app/phantom-solana-wallet/id1598432977"
      : "https://play.google.com/store/apps/details?id=app.phantom";
  await Linking.openURL(url);
}

/**
 * Build Solana Pay URI for Phantom
 * This creates a Solana Pay compatible URI that Phantom can process
 *
 * Solana Pay spec: https://docs.solanapay.com/spec
 */
function buildSolanaPayUri(params: {
  recipient: string;
  amount: number;
  token: SupportedToken;
  memo: string;
}): string {
  const { recipient, amount, token, memo } = params;

  // Base Solana Pay URI
  let uri = `solana:${recipient}`;
  const queryParams: string[] = [];

  // Add amount (required)
  queryParams.push(`amount=${amount}`);

  // Add SPL token mint if not SOL
  if (token !== "SOL" && TOKEN_MINTS[token]) {
    queryParams.push(`spl-token=${TOKEN_MINTS[token]}`);
  }

  // Add label (shown in wallet)
  queryParams.push(`label=${encodeURIComponent("Wihngo")}`);

  // Add message (shown to user in wallet)
  queryParams.push(`message=${encodeURIComponent("Support payment")}`);

  // Add memo (included in transaction on-chain)
  queryParams.push(`memo=${encodeURIComponent(memo)}`);

  if (queryParams.length > 0) {
    uri += `?${queryParams.join("&")}`;
  }

  return uri;
}

/**
 * Open Phantom with Solana Pay URI
 * This is the simplest and most reliable way to trigger payments in Phantom
 */
export async function executePhantomPayment(
  params: PhantomPaymentParams
): Promise<PhantomPaymentResult> {
  const { recipientAddress, amount, token, invoiceId, memo } = params;

  // Build memo string with invoice ID for backend reconciliation
  const memoString = memo || `WIHNGO:${invoiceId}`;

  try {
    // Build Solana Pay URI
    const solanaPayUri = buildSolanaPayUri({
      recipient: recipientAddress,
      amount,
      token,
      memo: memoString,
    });

    console.log("Opening Solana Pay URI:", solanaPayUri);

    // Phantom deep link to browse/open a Solana Pay URL
    // Format: https://phantom.app/ul/browse/{encoded_url}?ref={app_url}
    const appUrl = encodeURIComponent("https://wihngo.com");
    const encodedSolanaPayUri = encodeURIComponent(solanaPayUri);

    // Try different Phantom deep link formats
    const phantomBrowseUrl = `https://phantom.app/ul/browse/${encodedSolanaPayUri}?ref=${appUrl}`;
    const phantomDirectUrl = `phantom://browse/${encodedSolanaPayUri}`;

    console.log("Trying Phantom browse URL:", phantomBrowseUrl);

    try {
      // First try the universal link (works better on iOS)
      await Linking.openURL(phantomBrowseUrl);

      // For Solana Pay URIs, Phantom handles the transaction
      // The user will return to the app after completing/rejecting
      // We return success: true to indicate the request was sent
      // The backend will verify the actual transaction on-chain
      return {
        success: true,
        // Note: We don't have the signature here because Phantom handles the tx
        // The backend will detect the payment via blockchain scanning
      };
    } catch (universalLinkError: any) {
      console.error("Universal link failed, trying direct:", universalLinkError);

      try {
        // Try direct phantom:// scheme
        await Linking.openURL(phantomDirectUrl);
        return {
          success: true,
        };
      } catch (directError: any) {
        console.error("Direct phantom link also failed:", directError);

        // Last resort: try opening the solana: URI directly
        try {
          await Linking.openURL(solanaPayUri);
          return {
            success: true,
          };
        } catch {
          return {
            success: false,
            error: "Could not open Phantom wallet. Please make sure Phantom is installed.",
          };
        }
      }
    }
  } catch (error: any) {
    console.error("Phantom payment failed:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Connect to Phantom wallet and get public key using deep link
 * Note: This is a simplified flow - for production, you'd want to handle
 * the callback properly with expo-linking
 */
export async function connectPhantomWallet(): Promise<WalletConnectionResult> {
  try {
    const phantomInstalled = await isPhantomInstalled();
    if (!phantomInstalled) {
      return {
        success: false,
        error: "Phantom wallet is not installed",
      };
    }

    // Build connect URL with redirect
    const redirectUrl = Linking.createURL("phantom-callback");
    const params = new URLSearchParams({
      app_url: "https://wihngo.com",
      dapp_encryption_public_key: "", // Would need to generate keypair for encryption
      redirect_link: redirectUrl,
      cluster: "mainnet-beta",
    });

    const connectUrl = `${PHANTOM_CONNECT_URL}?${params.toString()}`;

    await Linking.openURL(connectUrl);

    // Note: In a full implementation, you'd set up a deep link listener
    // to receive the callback with the connected wallet info
    return {
      success: true,
      publicKey: undefined, // Would be returned via callback
    };
  } catch (error: any) {
    console.error("Failed to connect Phantom wallet:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Copy Solana Pay URI to clipboard for manual pasting
 */
export async function copySolanaPayUri(params: PhantomPaymentParams): Promise<void> {
  const { recipientAddress, amount, token, invoiceId, memo } = params;
  const memoString = memo || `WIHNGO:${invoiceId}`;

  const uri = buildSolanaPayUri({
    recipient: recipientAddress,
    amount,
    token,
    reference: invoiceId,
    memo: memoString,
  });

  await Clipboard.setStringAsync(uri);
}

/**
 * Get Solana explorer URL for a transaction
 */
export function getSolanaExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`;
}

/**
 * Format error message for display
 */
function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    if (error.message.includes("insufficient funds")) {
      return "Insufficient balance to complete transaction";
    }
    if (error.message.includes("User rejected")) {
      return "Transaction was cancelled";
    }
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Check if a URL is a Phantom callback
 */
export function isPhantomCallback(url: string): boolean {
  return url.includes("phantom-callback") || url.includes("phantom://");
}

/**
 * Parse Phantom callback URL to extract data
 * This would be used with Linking.addEventListener to handle callbacks
 */
export function parsePhantomCallback(url: string): {
  type: "connect" | "signAndSend" | "unknown";
  data?: any;
  error?: string;
} {
  try {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;

    // Check for error
    const errorCode = params.get("errorCode");
    if (errorCode) {
      const errorMessage = params.get("errorMessage") || "Unknown error";
      return {
        type: "unknown",
        error: decodeURIComponent(errorMessage),
      };
    }

    // Check for connect response
    const phantomPublicKey = params.get("phantom_encryption_public_key");
    if (phantomPublicKey) {
      return {
        type: "connect",
        data: {
          phantomPublicKey,
          session: params.get("session"),
          publicKey: params.get("public_key"),
        },
      };
    }

    // Check for signAndSend response
    const signature = params.get("signature");
    if (signature) {
      return {
        type: "signAndSend",
        data: {
          signature: decodeURIComponent(signature),
        },
      };
    }

    return { type: "unknown" };
  } catch (error) {
    console.error("Failed to parse Phantom callback:", error);
    return { type: "unknown", error: "Failed to parse callback" };
  }
}
