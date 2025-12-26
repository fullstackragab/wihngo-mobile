# Crypto Payment - Sepolia ETH Support Update

## 🎯 Overview

This document describes the updates made to support Sepolia testnet ETH payments with dynamic currency selection based on the blockchain network.

## 🚨 Key Changes

### 1. Currency Type Update

**Before:**

```typescript
export type CryptoCurrency = "ETH" | "USDT" | "SepoliaETH"; // ❌ Separate type for Sepolia
```

**After:**

```typescript
export type CryptoCurrency =
  | "ETH" // ✅ Includes mainnet and Sepolia testnet
  | "USDT"
  | "USDC";
// ... other currencies
```

### 2. Network-to-Currency Mapping

Added automatic currency detection based on network:

```typescript
export const NETWORK_TO_CURRENCY: Record<CryptoNetwork, CryptoCurrency> = {
  sepolia: "ETH", // Sepolia testnet uses native ETH
  ethereum: "USDT", // Ethereum mainnet typically uses USDT
  tron: "USDT", // Tron uses USDT (TRC-20)
  "binance-smart-chain": "USDT", // BSC uses USDT (BEP-20)
  bitcoin: "BTC",
  polygon: "USDT",
  solana: "SOL",
};

export function getCurrencyForNetwork(network: CryptoNetwork): CryptoCurrency {
  return NETWORK_TO_CURRENCY[network] || "USDT";
}
```

### 3. Dynamic Currency Selection

The app now automatically selects the correct currency when a network is chosen:

```typescript
// In crypto-payment.tsx
useEffect(() => {
  if (selectedNetwork) {
    const currency = getCurrencyForNetwork(selectedNetwork);
    setSelectedCurrency(currency);
  }
}, [selectedNetwork]);
```

### 4. Currency Validation

Added validation to ensure valid currency-network combinations:

```typescript
export function isValidCurrencyNetwork(
  currency: CryptoCurrency,
  network: CryptoNetwork
): boolean {
  const validCombinations: Record<CryptoCurrency, CryptoNetwork[]> = {
    ETH: ["ethereum", "sepolia"],
    USDT: ["tron", "ethereum", "binance-smart-chain", "polygon"],
    USDC: ["ethereum", "binance-smart-chain", "polygon"],
    BTC: ["bitcoin"],
    BNB: ["binance-smart-chain"],
    SOL: ["solana"],
    DOGE: [],
  };
  return validCombinations[currency]?.includes(network) || false;
}
```

## 📱 UI Updates

### Network Selector

- ✅ Shows which currency each network uses
- ✅ Displays "TESTNET" badge for Sepolia
- ✅ Orange left border for testnet networks
- ✅ Dynamic currency display

Example:

```
┌─────────────────────────────────┐
│ Ethereum Sepolia  [TESTNET]     │
│ Uses ETH                        │
│ ⏱ Fast (1-2 min) 💵 Fee: ~$0.10│
└─────────────────────────────────┘
```

### Payment Screen

- ✅ Dynamic "Pay with {currency}" header
- ✅ Shows correct currency symbol in all displays
- ✅ Uses 8 decimals for ETH, 6 for USDT
- ✅ Dynamic exchange rate display

### Amount Display

**Before (Hardcoded):**

```tsx
<Text>{cryptoAmount.toFixed(2)} USDT</Text>
```

**After (Dynamic):**

```tsx
<Text>
  {selectedCurrency === "ETH"
    ? cryptoAmount.toFixed(8)
    : cryptoAmount.toFixed(6)}{" "}
  {selectedCurrency}
</Text>
```

## 🔧 Updated Files

### Core Files

1. **`types/crypto.ts`**

   - Removed `SepoliaETH` type
   - Added `NETWORK_TO_CURRENCY` mapping
   - Added `getCurrencyForNetwork()` helper
   - Added `isValidCurrencyNetwork()` validator

2. **`app/crypto-payment.tsx`**

   - Added automatic currency selection on network change
   - Updated all display logic to use dynamic currency
   - Added currency-network validation
   - Updated decimal formatting for different currencies

3. **`components/network-selector.tsx`**

   - Shows currency for each network
   - Displays testnet badge
   - Uses network-specific currency for fee calculation

4. **`services/crypto.service.ts`**
   - Updated `formatCryptoAmount()` to use 8 decimals for ETH
   - Updated USDT to 6 decimals for better display

## 🧪 Testing Guide

### 1. Test Sepolia ETH Payment

```typescript
// Navigate to payment screen with Sepolia
router.push({
  pathname: "/crypto-payment",
  params: {
    amount: 10.0,
    birdId: "test-bird-id",
    plan: "monthly",
    purpose: "premium_subscription",
  },
});

// Select Sepolia network
// Expected behavior:
// - Currency automatically changes to ETH
// - Shows "Pay with ETH" in header
// - Amount displayed with 8 decimals
// - Shows TESTNET badge
// - Network displays "Uses ETH"
```

### 2. Test Tron USDT Payment

```typescript
// Select Tron network
// Expected behavior:
// - Currency automatically changes to USDT
// - Shows "Pay with USDT" in header
// - Amount displayed with 6 decimals
// - No testnet badge
// - Network displays "Uses USDT"
```

### 3. Test Currency Display

```typescript
// For Sepolia (ETH):
// Amount: $10.00 USD
// Expected: ~0.00333333 ETH (at ~$3000/ETH)

// For Tron (USDT):
// Amount: $10.00 USD
// Expected: ~10.020000 USDT (at ~$0.999/USDT)
```

### 4. Test Payment Creation

```typescript
// Sepolia payment request
const payment = await createCryptoPayment({
  amountUsd: 10.00,
  currency: "ETH",        // ✅ Automatic from network
  network: "sepolia",
  birdId: "bird-id",
  purpose: "premium_subscription",
  plan: "monthly"
});

// Expected response:
{
  currency: "ETH",
  network: "sepolia",
  amountCrypto: 0.00333333,
  exchangeRate: 3000.00,
  requiredConfirmations: 6
}
```

## 📊 Network Configuration

| Network     | Currency | Decimals       | Use Case   | Confirmations |
| ----------- | -------- | -------------- | ---------- | ------------- |
| **Sepolia** | **ETH**  | 18 (display 8) | Testing    | 6 (~1.2 min)  |
| Tron        | USDT     | 6              | Production | 19 (~57 sec)  |
| Ethereum    | USDT     | 6              | Production | 12 (~2.4 min) |
| BSC         | USDT     | 18 (display 6) | Production | 15 (~45 sec)  |
| Bitcoin     | BTC      | 8              | Production | 2 (~20 min)   |

## 🚀 API Request Examples

### Sepolia Testnet (ETH)

```json
{
  "amountUsd": 10.0,
  "currency": "ETH",
  "network": "sepolia",
  "birdId": "bird-guid",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

### Tron Mainnet (USDT)

```json
{
  "amountUsd": 10.0,
  "currency": "USDT",
  "network": "tron",
  "birdId": "bird-guid",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

## ⚠️ Important Notes

### For Developers

1. **Never use `SepoliaETH` type** - Use `"ETH"` for both Sepolia and mainnet
2. **Always use `getCurrencyForNetwork()`** when network is selected
3. **Use `isValidCurrencyNetwork()`** before creating payments
4. **Format amounts based on currency:**
   - ETH: 8 decimals (0.00123456 ETH)
   - USDT: 6 decimals (10.123456 USDT)
   - BTC: 8 decimals (0.00012345 BTC)

### For Testing

1. **Sepolia testnet uses real ETH decimals** (18) but display with 8 for UX
2. **Get testnet ETH** from faucets:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia
3. **Sepolia ETH has no real value** - safe for testing
4. **Always test on Sepolia before mainnet** deployment

### For Production

1. **Hide Sepolia in production** - Add environment check:

   ```typescript
   const networks = allNetworks.filter((n) => __DEV__ || n !== "sepolia");
   ```

2. **Backend must support Sepolia** - Ensure API has Sepolia configuration
3. **Set correct platform receive address** for Sepolia:
   ```
   0x4cc28f4cea7b440858b903b5c46685cb1478cdc4
   ```

## 🎨 Visual Changes

### Before

```
Pay with USDT
Select your preferred blockchain network

[Ethereum Sepolia]
Fast (1-2 min) | Fee: ~$0.10
```

### After

```
Pay with ETH
Select your preferred blockchain network

[Ethereum Sepolia] [TESTNET]
Uses ETH
⏱ Fast (1-2 min) | 💵 Fee: ~$0.10
```

## ✅ Migration Checklist

- [x] Remove `SepoliaETH` from `CryptoCurrency` type
- [x] Add `NETWORK_TO_CURRENCY` mapping
- [x] Add `getCurrencyForNetwork()` helper
- [x] Add `isValidCurrencyNetwork()` validator
- [x] Update crypto-payment.tsx with dynamic currency selection
- [x] Update network selector to show currency
- [x] Add testnet badge to network selector
- [x] Update formatCryptoAmount() for ETH (8 decimals)
- [x] Update all hardcoded "USDT" displays to use `{currency}`
- [x] Add currency-network validation in payment creation
- [x] Test Sepolia ETH payment flow
- [x] Test mainnet USDT payment flows
- [ ] Backend API supports Sepolia network
- [ ] Backend has Sepolia wallet configured
- [ ] Test end-to-end Sepolia payment with real testnet ETH

## 📚 Additional Resources

- [Sepolia Testnet Documentation](https://sepolia.dev/)
- [Ethereum Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Block Explorer](https://sepolia.etherscan.io)
- [MetaMask Sepolia Setup Guide](https://docs.metamask.io/guide/ethereum-provider.html#sepolia-test-network)

## 🐛 Troubleshooting

### Issue: "Currency not supported on network"

**Solution:** Network configuration missing. Check `NETWORK_TO_CURRENCY` mapping.

### Issue: Amount shows wrong decimals

**Solution:** Check `formatCryptoAmount()` in crypto.service.ts

### Issue: Sepolia not showing in network selector

**Solution:**

1. Check if backend has Sepolia wallet configured
2. Verify `getWalletAddressForNetwork()` returns address for Sepolia
3. Ensure not in production mode (Sepolia should be hidden in production)

### Issue: Payment creation fails with Sepolia

**Solution:**

1. Verify backend API endpoint supports `sepolia` network
2. Check if currency is correctly set to `"ETH"`
3. Verify validation in `isValidCurrencyNetwork()`

## 📝 Summary

This update enables seamless support for Sepolia testnet ETH payments while maintaining backward compatibility with existing USDT payment flows. The key innovation is **automatic currency detection based on network**, eliminating manual currency selection and reducing user errors.

**Benefits:**

- ✅ Simplified user experience
- ✅ Reduced configuration errors
- ✅ Clear testnet identification
- ✅ Consistent decimal formatting
- ✅ Type-safe currency-network validation

---

**Updated:** December 11, 2025  
**Version:** 2.0  
**Status:** ✅ Complete
