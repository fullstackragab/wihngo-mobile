/**
 * Crypto Payment Integration - Testing Examples
 * @deprecated This file contains legacy examples for Sepolia and other networks.
 * As of v3.0, only Solana network is supported for crypto payments.
 * See CRYPTO_SOLANA_ONLY_UPDATE.md for current implementation.
 */

import type { CryptoCurrency, CryptoNetwork } from "@/types/crypto";
import { getCurrencyForNetwork, isValidCurrencyNetwork } from "@/types/crypto";

// ============================================================================
// EXAMPLE 1: Network Selection with Automatic Currency Detection
// ============================================================================

/**
 * When user selects a network, currency is automatically determined
 */
function exampleNetworkSelection() {
  const networks: CryptoNetwork[] = [
    "tron",
    "ethereum",
    "binance-smart-chain",
    "sepolia",
  ];

  networks.forEach((network) => {
    const currency = getCurrencyForNetwork(network);
    console.log(`${network} → ${currency}`);
  });

  // Output:
  // tron → USDT
  // ethereum → USDT
  // binance-smart-chain → USDT
  // sepolia → ETH ✅
}

// ============================================================================
// EXAMPLE 2: Payment Creation with Sepolia
// ============================================================================

/**
 * Creating a Sepolia testnet payment
 */
async function exampleSepoliaPayment() {
  const selectedNetwork: CryptoNetwork = "sepolia";
  const selectedCurrency = getCurrencyForNetwork(selectedNetwork); // "ETH"

  // Validate combination
  if (!isValidCurrencyNetwork(selectedCurrency, selectedNetwork)) {
    throw new Error("Invalid currency-network combination");
  }

  const paymentData = {
    amountUsd: 10.0,
    currency: selectedCurrency, // "ETH"
    network: selectedNetwork, // "sepolia"
    birdId: "test-bird-id",
    purpose: "premium_subscription" as const,
    plan: "monthly" as const,
  };

  console.log("Creating Sepolia payment:", paymentData);

  // Expected API request:
  // POST /api/payments/crypto/create
  // {
  //   "amountUsd": 10.00,
  //   "currency": "ETH",      ← Native ETH
  //   "network": "sepolia",   ← Testnet
  //   "birdId": "test-bird-id",
  //   "purpose": "premium_subscription",
  //   "plan": "monthly"
  // }

  // Expected API response:
  // {
  //   "paymentRequest": {
  //     "id": "payment-guid",
  //     "currency": "ETH",
  //     "network": "sepolia",
  //     "amountCrypto": 0.00333333,  ← Small amount (ETH is expensive)
  //     "exchangeRate": 3000.00,      ← ~$3000 per ETH
  //     "walletAddress": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
  //     "requiredConfirmations": 6,   ← Faster than mainnet
  //     "status": "pending"
  //   }
  // }
}

// ============================================================================
// EXAMPLE 3: Payment Creation with Tron USDT
// ============================================================================

/**
 * Creating a Tron mainnet payment
 */
async function exampleTronPayment() {
  const selectedNetwork: CryptoNetwork = "tron";
  const selectedCurrency = getCurrencyForNetwork(selectedNetwork); // "USDT"

  const paymentData = {
    amountUsd: 9.99,
    currency: selectedCurrency, // "USDT"
    network: selectedNetwork, // "tron"
    birdId: "real-bird-id",
    purpose: "premium_subscription" as const,
    plan: "monthly" as const,
  };

  console.log("Creating Tron payment:", paymentData);

  // Expected API request:
  // {
  //   "amountUsd": 9.99,
  //   "currency": "USDT",     ← Stablecoin
  //   "network": "tron",      ← Mainnet
  //   "birdId": "real-bird-id",
  //   "purpose": "premium_subscription",
  //   "plan": "monthly"
  // }

  // Expected API response:
  // {
  //   "paymentRequest": {
  //     "currency": "USDT",
  //     "network": "tron",
  //     "amountCrypto": 10.02,        ← Nearly 1:1 with USD
  //     "exchangeRate": 0.9978,       ← ~$1 per USDT
  //     "requiredConfirmations": 19,  ← Standard Tron confirmations
  //     "status": "pending"
  //   }
  // }
}

// ============================================================================
// EXAMPLE 4: Currency Display Formatting
// ============================================================================

/**
 * Formatting amounts for display based on currency
 */
function exampleFormatAmount() {
  interface Payment {
    amountCrypto: number;
    currency: CryptoCurrency;
  }

  const payments: Payment[] = [
    { amountCrypto: 0.00333333, currency: "ETH" },
    { amountCrypto: 10.023456, currency: "USDT" },
    { amountCrypto: 0.12345678, currency: "BTC" },
  ];

  payments.forEach(({ amountCrypto, currency }) => {
    let formatted: string;

    if (currency === "ETH") {
      formatted = amountCrypto.toFixed(8); // 8 decimals for ETH
    } else if (currency === "USDT" || currency === "USDC") {
      formatted = amountCrypto.toFixed(6); // 6 decimals for stablecoins
    } else if (currency === "BTC") {
      formatted = amountCrypto.toFixed(8); // 8 decimals for BTC
    } else {
      formatted = amountCrypto.toFixed(4); // Default 4 decimals
    }

    console.log(`${formatted} ${currency}`);
  });

  // Output:
  // 0.00333333 ETH
  // 10.023456 USDT
  // 0.12345678 BTC
}

// ============================================================================
// EXAMPLE 5: Validation Before Payment Creation
// ============================================================================

/**
 * Validate currency-network combinations
 */
function exampleValidation() {
  const validCombinations = [
    { currency: "ETH" as CryptoCurrency, network: "sepolia" as CryptoNetwork },
    { currency: "ETH" as CryptoCurrency, network: "ethereum" as CryptoNetwork },
    { currency: "USDT" as CryptoCurrency, network: "tron" as CryptoNetwork },
    {
      currency: "USDT" as CryptoCurrency,
      network: "binance-smart-chain" as CryptoNetwork,
    },
  ];

  const invalidCombinations = [
    { currency: "ETH" as CryptoCurrency, network: "tron" as CryptoNetwork },
    { currency: "USDT" as CryptoCurrency, network: "sepolia" as CryptoNetwork },
    { currency: "BTC" as CryptoCurrency, network: "ethereum" as CryptoNetwork },
  ];

  console.log("Valid combinations:");
  validCombinations.forEach(({ currency, network }) => {
    const isValid = isValidCurrencyNetwork(currency, network);
    console.log(`  ${currency} on ${network}: ${isValid ? "✅" : "❌"}`);
  });

  console.log("\nInvalid combinations:");
  invalidCombinations.forEach(({ currency, network }) => {
    const isValid = isValidCurrencyNetwork(currency, network);
    console.log(`  ${currency} on ${network}: ${isValid ? "✅" : "❌"}`);
  });

  // Output:
  // Valid combinations:
  //   ETH on sepolia: ✅
  //   ETH on ethereum: ✅
  //   USDT on tron: ✅
  //   USDT on binance-smart-chain: ✅
  //
  // Invalid combinations:
  //   ETH on tron: ❌
  //   USDT on sepolia: ❌
  //   BTC on ethereum: ❌
}

// ============================================================================
// EXAMPLE 6: React Component Usage
// ============================================================================

/**
 * Example React component using the crypto payment system
 */
/*
import { getCurrencyForNetwork, isValidCurrencyNetwork } from "@/types/crypto";
import { useState, useEffect } from "react";

function CryptoPaymentExample() {
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>("sepolia");
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>("ETH");

  // Automatically update currency when network changes
  useEffect(() => {
    if (selectedNetwork) {
      const currency = getCurrencyForNetwork(selectedNetwork);
      setSelectedCurrency(currency);
      console.log(`Network changed to ${selectedNetwork}, using currency ${currency}`);
    }
  }, [selectedNetwork]);

  const handleCreatePayment = async () => {
    // Validate before creating payment
    if (!isValidCurrencyNetwork(selectedCurrency, selectedNetwork)) {
      alert(`${selectedCurrency} is not supported on ${selectedNetwork}`);
      return;
    }

    // Create payment with dynamic currency
    const payment = await createCryptoPayment({
      amountUsd: 10.00,
      currency: selectedCurrency,  // ← Automatically selected
      network: selectedNetwork,
      birdId: "bird-id",
      purpose: "premium_subscription",
      plan: "monthly"
    });

    console.log("Payment created:", payment);
  };

  return (
    <View>
      <Text>Pay with {selectedCurrency}</Text>
      <Text>Network: {selectedNetwork}</Text>
      <Button onPress={handleCreatePayment} title="Create Payment" />
    </View>
  );
}
*/

// ============================================================================
// EXAMPLE 7: Network Information Display
// ============================================================================

/**
 * Display network information with currency
 */
function exampleNetworkInfo() {
  interface NetworkInfo {
    network: CryptoNetwork;
    name: string;
    speed: string;
    confirmations: number;
  }

  const networks: NetworkInfo[] = [
    {
      network: "sepolia",
      name: "Sepolia Testnet",
      speed: "Fast (1-2 min)",
      confirmations: 6,
    },
    {
      network: "tron",
      name: "Tron (TRC-20)",
      speed: "Fast (1-2 min)",
      confirmations: 19,
    },
    {
      network: "ethereum",
      name: "Ethereum (ERC-20)",
      speed: "Medium (2-5 min)",
      confirmations: 12,
    },
    {
      network: "binance-smart-chain",
      name: "BSC (BEP-20)",
      speed: "Fast (1-3 min)",
      confirmations: 15,
    },
  ];

  networks.forEach((info) => {
    const currency = getCurrencyForNetwork(info.network);
    const isTestnet = info.network === "sepolia";

    console.log(`
┌─────────────────────────────────────┐
│ ${info.name.padEnd(35)} │
│ ${("Uses " + currency).padEnd(35)} │
│ ${isTestnet ? "[TESTNET]".padEnd(35) : "".padEnd(35)} │
│ ${info.speed.padEnd(35)} │
│ ${`${info.confirmations} confirmations`.padEnd(35)} │
└─────────────────────────────────────┘
    `);
  });
}

// ============================================================================
// EXAMPLE 8: Testing Workflow
// ============================================================================

/**
 * Complete testing workflow for Sepolia
 */
async function exampleTestingWorkflow() {
  console.log("=== STEP 1: Get Testnet ETH ===");
  console.log("Visit https://sepoliafaucet.com/");
  console.log("Request test ETH (no real value)");

  console.log("\n=== STEP 2: Configure MetaMask ===");
  console.log("Network Name: Sepolia");
  console.log("RPC URL: https://sepolia.infura.io/v3/YOUR_KEY");
  console.log("Chain ID: 11155111");
  console.log("Currency Symbol: ETH");

  console.log("\n=== STEP 3: Create Payment ===");
  const selectedNetwork: CryptoNetwork = "sepolia";
  const selectedCurrency = getCurrencyForNetwork(selectedNetwork);

  console.log(`Currency: ${selectedCurrency}`);
  console.log(`Network: ${selectedNetwork}`);
  console.log(`Amount: $10.00 USD → ~0.00333 ETH`);

  console.log("\n=== STEP 4: Send Test ETH ===");
  console.log("From: Your MetaMask wallet");
  console.log("To: 0x4cc28f4cea7b440858b903b5c46685cb1478cdc4");
  console.log("Amount: Exact amount shown in payment screen");

  console.log("\n=== STEP 5: Submit Transaction Hash ===");
  console.log("Copy transaction hash from MetaMask");
  console.log("Paste into payment screen");
  console.log("Click 'Verify Payment'");

  console.log("\n=== STEP 6: Monitor Confirmations ===");
  console.log("Required: 6 confirmations");
  console.log("Time: ~1.2 minutes");
  console.log("Status updates automatically");

  console.log("\n=== STEP 7: Verify on Block Explorer ===");
  console.log("Visit https://sepolia.etherscan.io");
  console.log("Search your transaction hash");
  console.log("Verify: amount, recipient, confirmations");
}

// ============================================================================
// Export examples for testing
// ============================================================================

export const examples = {
  networkSelection: exampleNetworkSelection,
  sepoliaPayment: exampleSepoliaPayment,
  tronPayment: exampleTronPayment,
  formatAmount: exampleFormatAmount,
  validation: exampleValidation,
  networkInfo: exampleNetworkInfo,
  testingWorkflow: exampleTestingWorkflow,
};

// Run examples (uncomment to test)
// exampleNetworkSelection();
// exampleValidation();
// exampleFormatAmount();
// exampleNetworkInfo();
