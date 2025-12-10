/**
 * TRON Wallet Address Validation Test
 *
 * This file verifies that the Wihngo TRON USDT wallet address is valid
 */

// Wallet details
const WIHNGO_TRON_WALLET = {
  name: "Wihngo",
  network: "TRON Mainnet (TronGrid)",
  currency: "USDT",
  address: "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
};

// TRON address validation function
function validateTronAddress(address: string): boolean {
  // TRON addresses:
  // - Start with 'T'
  // - Are exactly 34 characters long
  // - Contain alphanumeric characters (Base58)
  const tronRegex = /^T[a-zA-Z0-9]{33}$/;
  return tronRegex.test(address);
}

// Run validation
console.log("=== TRON Wallet Validation ===");
console.log("Wallet Name:", WIHNGO_TRON_WALLET.name);
console.log("Network:", WIHNGO_TRON_WALLET.network);
console.log("Currency:", WIHNGO_TRON_WALLET.currency);
console.log("Address:", WIHNGO_TRON_WALLET.address);
console.log("");

// Validate address format
const isValid = validateTronAddress(WIHNGO_TRON_WALLET.address);
console.log("Address Format Valid:", isValid ? "✅ YES" : "❌ NO");

// Additional checks
const addressLength = WIHNGO_TRON_WALLET.address.length;
const startsWithT = WIHNGO_TRON_WALLET.address.startsWith("T");

console.log(
  "Address Length:",
  addressLength,
  addressLength === 34 ? "✅" : "❌"
);
console.log("Starts with T:", startsWithT ? "✅ YES" : "❌ NO");

// Verify on TronScan
console.log("");
console.log("Verify on TronScan:");
console.log(`https://tronscan.org/#/address/${WIHNGO_TRON_WALLET.address}`);

// Export for use in application
export const TRON_WALLET_CONFIG = {
  address: WIHNGO_TRON_WALLET.address,
  network: "tron",
  currency: "USDT",
  isValid: isValid,
};

export default WIHNGO_TRON_WALLET;
