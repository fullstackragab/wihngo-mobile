# Crypto Payment - Quick Reference Card

## 🚨 Backend Configuration Required

**Before testing Sepolia payments, ensure your backend is configured:**

1. ✅ Backend API supports `"sepolia"` network parameter
2. ✅ Sepolia wallet address configured: `0x4cc28f4cea7b440858b903b5c46685cb1478cdc4`
3. ✅ ETH exchange rate endpoint returns rates (used for both mainnet and Sepolia)
4. ✅ Blockchain verification supports Sepolia testnet

**If you get a 400 error when creating Sepolia payments:**

- Backend may not have Sepolia support implemented yet
- Check backend logs for specific error message
- Verify wallet configuration in backend settings
- Test with USDT on Tron network first (most supported)

---

## ⚠️ IMPORTANT: Sepolia Currency

**Always use `'ETH'` for Sepolia, NOT `'SepoliaETH'`**

```typescript
// ❌ WRONG - SepoliaETH doesn't exist
const networks = [
  { id: "sepolia", name: "Sepolia Testnet", currency: "SepoliaETH" },
];

// ✅ CORRECT - Use 'ETH' for both mainnet and Sepolia
const networks = [{ id: "sepolia", name: "Sepolia Testnet", currency: "ETH" }];

// ✅ CORRECT Payment Creation
const payment = await api.createPayment({
  amountUsd: 11,
  currency: "ETH", // ✅ Just "ETH"
  network: "sepolia", // ✅ Network is "sepolia"
  birdId: "your-bird-id",
  purpose: "premium_subscription",
  plan: "monthly",
});
```

**Key Points:**

- Sepolia is the **network** (testnet)
- ETH is the **currency** (Ethereum)
- Backend uses the same exchange rate for ETH on both mainnet and Sepolia
- The `network` parameter tells the backend which blockchain to verify on

---

## 🚀 Quick Start

### Navigate to Payment Screen

```typescript
import { router } from "expo-router";

router.push({
  pathname: "/crypto-payment",
  params: {
    amount: "10.00",
    birdId: "your-bird-id",
    plan: "monthly",
    purpose: "premium_subscription",
  },
});
```

## 🔑 Key Functions

### Get Currency for Network

```typescript
import { getCurrencyForNetwork } from "@/types/crypto";

const currency = getCurrencyForNetwork("sepolia"); // Returns "ETH"
const currency = getCurrencyForNetwork("tron"); // Returns "USDT"
```

### Validate Currency-Network Combo

```typescript
import { isValidCurrencyNetwork } from "@/types/crypto";

isValidCurrencyNetwork("ETH", "sepolia"); // true ✅
isValidCurrencyNetwork("USDT", "sepolia"); // false ❌
isValidCurrencyNetwork("USDT", "tron"); // true ✅
```

### Format Crypto Amount

```typescript
// ETH: 8 decimals
amount.toFixed(8); // 0.00333333 ETH

// USDT: 6 decimals
amount.toFixed(6); // 10.023456 USDT
```

## 📊 Network-Currency Mapping

| Network               | Currency | Testnet? | Confirmations | Time     |
| --------------------- | -------- | -------- | ------------- | -------- |
| `sepolia`             | `ETH`    | ✅ Yes   | 6             | ~1.2 min |
| `tron`                | `USDT`   | ❌ No    | 19            | ~57 sec  |
| `ethereum`            | `USDT`   | ❌ No    | 12            | ~2.4 min |
| `binance-smart-chain` | `USDT`   | ❌ No    | 15            | ~45 sec  |

## 🎨 UI Components

### Show Currency Dynamically

```tsx
<Text>Pay with {selectedCurrency}</Text>
<Text>
  {selectedCurrency === "ETH"
    ? amount.toFixed(8)
    : amount.toFixed(6)
  } {selectedCurrency}
</Text>
```

### Show Testnet Badge

```tsx
{
  network === "sepolia" && (
    <View style={styles.testnetBadge}>
      <Text>TESTNET</Text>
    </View>
  );
}
```

## 🔧 API Request Format

### Sepolia (Testnet)

```json
{
  "amountUsd": 10.0,
  "currency": "ETH",
  "network": "sepolia",
  "birdId": "bird-id",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

### Tron (Mainnet)

```json
{
  "amountUsd": 10.0,
  "currency": "USDT",
  "network": "tron",
  "birdId": "bird-id",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

## 🧪 Testing Steps

### 1. Get Testnet ETH

- Visit: https://sepoliafaucet.com/
- Request testnet ETH (no real value)

### 2. Configure MetaMask

- Network: Sepolia
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/YOUR_KEY

### 3. Create Payment

- Select Sepolia network
- Verify currency = ETH
- Verify TESTNET badge shows

### 4. Send Payment

- Copy platform address
- Send exact amount from MetaMask
- Copy transaction hash

### 5. Verify

- Paste transaction hash
- Wait for confirmations (6 for Sepolia)
- Check status updates

### 6. Block Explorer

- Visit: https://sepolia.etherscan.io
- Paste transaction hash
- Verify amount, recipient, confirmations

## ⚠️ Common Issues

### Issue: "Currency not supported"

**Fix:** Check `NETWORK_TO_CURRENCY` mapping

### Issue: Wrong decimals

**Fix:** Use 8 for ETH, 6 for USDT

### Issue: Validation fails

**Fix:** Use `isValidCurrencyNetwork()` before payment

### Issue: Sepolia not showing

**Fix:** Check backend wallet configuration

## 🎯 Best Practices

### DO ✅

- Use `getCurrencyForNetwork()` for currency selection
- Validate with `isValidCurrencyNetwork()`
- Show testnet badge for Sepolia
- Use correct decimals (8 for ETH, 6 for USDT)
- Test on Sepolia before mainnet

### DON'T ❌

- Don't use `SepoliaETH` type (removed)
- Don't hardcode currency as "USDT"
- Don't let users manually select currency
- Don't show Sepolia in production
- Don't use real money on testnet

## 📱 Platform Addresses

### Sepolia Testnet

```
0x4cc28f4cea7b440858b903b5c46685cb1478cdc4
```

### Tron Mainnet

```
(Configure in backend)
```

## 🔗 Quick Links

- [Full Guide](./CRYPTO_SEPOLIA_ETH_UPDATE.md)
- [Examples](./examples/crypto-payment-sepolia-examples.ts)
- [Implementation Summary](./SEPOLIA_ETH_IMPLEMENTATION_COMPLETE.md)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Explorer](https://sepolia.etherscan.io)

## 💡 Code Snippets

### Automatic Currency Selection

```typescript
useEffect(() => {
  if (selectedNetwork) {
    const currency = getCurrencyForNetwork(selectedNetwork);
    setSelectedCurrency(currency);
  }
}, [selectedNetwork]);
```

### Payment Creation with Validation

```typescript
const handleCreatePayment = async () => {
  if (!isValidCurrencyNetwork(selectedCurrency, selectedNetwork)) {
    alert("Invalid currency-network combination");
    return;
  }

  const payment = await createCryptoPayment({
    amountUsd: 10.0,
    currency: selectedCurrency, // Automatic!
    network: selectedNetwork,
    birdId: "bird-id",
    purpose: "premium_subscription",
    plan: "monthly",
  });
};
```

### Dynamic Amount Display

```typescript
const formatAmount = (amount: number, currency: CryptoCurrency) => {
  return currency === "ETH" ? amount.toFixed(8) : amount.toFixed(6);
};
```

---

**Version:** 2.0  
**Updated:** December 11, 2025  
**Status:** ✅ Ready to Use

## 📞 Need Help?

1. Check [Full Documentation](./CRYPTO_SEPOLIA_ETH_UPDATE.md)
2. Review [Code Examples](./examples/crypto-payment-sepolia-examples.ts)
3. Test with Sepolia testnet first
4. Verify backend configuration
5. Monitor confirmations on block explorer

**Remember:** Always test on Sepolia before using real money! 🧪
