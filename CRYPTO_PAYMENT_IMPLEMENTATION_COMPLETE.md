# Crypto Payment Integration - Implementation Guide

## Wihngo Expo React Native Mobile App

> **Status:** ✅ Fully Integrated  
> **Last Updated:** December 11, 2025  
> **Backend API:** `https://api.wihngo.com/api/payments/crypto`

---

## 📋 Overview

This document provides a complete guide to the cryptocurrency payment system integrated into the Wihngo mobile app. The system supports multiple cryptocurrencies and networks, with real-time payment verification and status tracking.

### ✨ Features Implemented

- ✅ Multiple network support (Tron, Ethereum, BSC, Sepolia Testnet)
- ✅ Real-time payment verification via polling
- ✅ QR code payment integration
- ✅ Automatic confirmation tracking
- ✅ Payment expiration handling (30 minutes)
- ✅ Payment history viewing
- ✅ Manual transaction verification
- ✅ Testnet support for development (Sepolia)

---

## 🏗️ Architecture

### File Structure

```
services/
  ├── cryptoPaymentApi.ts         # API service class (NEW)
  ├── crypto.service.ts            # Utility functions & helpers (UPDATED)
  └── api-helper.ts                # Base API helper

hooks/
  ├── useCryptoPayment.ts          # Main payment hook (NEW)
  └── usePaymentStatusPolling.ts   # Status polling hook (EXISTING)

app/
  └── crypto-payment.tsx           # Main payment screen (EXISTING)

components/
  ├── crypto-currency-selector.tsx # Currency selection
  ├── crypto-payment-qr.tsx        # QR code display
  ├── crypto-payment-status.tsx    # Status indicator
  └── network-selector.tsx         # Network selection (UPDATED)

types/
  └── crypto.ts                    # TypeScript types (UPDATED)
```

---

## 💰 Supported Cryptocurrencies

| Currency | Network  | Token Type | Decimals | Network ID            | Status          |
| -------- | -------- | ---------- | -------- | --------------------- | --------------- |
| **USDT** | Tron     | TRC-20     | 6        | `tron`                | ✅ Production   |
| **USDT** | Ethereum | ERC-20     | 6        | `ethereum`            | ✅ Production   |
| **USDT** | BSC      | BEP-20     | **18**   | `binance-smart-chain` | ✅ Production   |
| **ETH**  | Ethereum | Native     | 18       | `ethereum`            | ✅ Production   |
| **ETH**  | Sepolia  | Native     | 18       | `sepolia`             | 🧪 Testnet Only |
| USDC     | Ethereum | ERC-20     | 6        | `ethereum`            | ✅ Production   |
| USDC     | BSC      | BEP-20     | 18       | `binance-smart-chain` | ✅ Production   |

### ⚠️ Important Notes

- **BEP-20 USDT uses 18 decimals** (not 6 like TRC-20 and ERC-20!)
- **Sepolia is a testnet** for development only - requires test ETH with no real value
- Minimum payment amount: **$5 USD**
- Payment window: **30 minutes**

---

## 🔌 API Integration

### 1. CryptoPaymentAPI Class

Located in `services/cryptoPaymentApi.ts`, this class provides a clean interface to all backend endpoints.

**Usage Example:**

```typescript
import { CryptoPaymentAPI } from "@/services/cryptoPaymentApi";

// Initialize with auth token
const api = new CryptoPaymentAPI(authToken);

// Create payment
const response = await api.createPayment({
  amountUsd: 9.99,
  currency: "USDT",
  network: "tron",
  birdId: "bird-id",
  purpose: "premium_subscription",
  plan: "monthly",
});

// Verify payment
const verified = await api.verifyPayment(
  paymentId,
  transactionHash,
  userWalletAddress
);

// Check status
const status = await api.checkPaymentStatus(paymentId);
```

**Available Methods:**

- `getExchangeRates()` - Get all exchange rates (public)
- `getExchangeRate(currency)` - Get specific rate (public)
- `getPlatformWallet(currency, network)` - Get receiving wallet (public)
- `createPayment(data)` - Create new payment (authenticated)
- `verifyPayment(id, hash, wallet)` - Verify transaction (authenticated)
- `getPaymentStatus(id)` - Get current status (authenticated)
- `checkPaymentStatus(id)` - Force blockchain check (authenticated)
- `getPaymentHistory(page, size)` - Get payment history (authenticated)
- `cancelPayment(id)` - Cancel payment (authenticated)

---

### 2. useCryptoPayment Hook

Located in `hooks/useCryptoPayment.ts`, this hook manages payment state and operations.

**Usage Example:**

```typescript
import { useCryptoPayment } from '@/hooks/useCryptoPayment';

function PaymentComponent() {
  const { token } = useAuth();
  const {
    payment,
    loading,
    error,
    createPayment,
    verifyPayment,
    checkStatus,
    clearError
  } = useCryptoPayment(token);

  const handlePay = async () => {
    const result = await createPayment({
      amountUsd: 10.00,
      currency: 'USDT',
      network: 'tron',
      purpose: 'premium_subscription',
      plan: 'monthly'
    });

    if (result) {
      console.log('Payment created:', result.id);
    } else {
      console.error('Error:', error);
    }
  };

  return (
    // Your UI here
  );
}
```

**Hook Returns:**

```typescript
{
  payment: CryptoPaymentRequest | null;
  loading: boolean;
  error: string | null;
  createPayment: (data) => Promise<CryptoPaymentRequest | null>;
  verifyPayment: (id, hash, wallet?) => Promise<CryptoPaymentRequest | null>;
  checkStatus: (id) => Promise<CryptoPaymentRequest | null>;
  cancelPayment: (id) => Promise<CryptoPaymentRequest | null>;
  getPaymentHistory: (page?, size?) => Promise<CryptoPaymentHistory | null>;
  getExchangeRates: () => Promise<CryptoExchangeRate[] | null>;
  getExchangeRate: (currency) => Promise<CryptoExchangeRate | null>;
  getPlatformWallet: (currency, network) => Promise<CryptoWalletInfo | null>;
  clearError: () => void;
  setPayment: (payment) => void;
}
```

---

## 🔄 Payment Flow

### Complete User Journey

```
┌─────────────────────────────────────────┐
│ 1. User selects premium plan           │
│    → Opens crypto-payment.tsx           │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. Select Network                       │
│    → Tron / Ethereum / BSC / Sepolia    │
│    → Shows fees and confirmation times  │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Review Amount                        │
│    → USD → Crypto conversion            │
│    → Exchange rate display              │
│    → Network fee estimate               │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. Payment Address                      │
│    → QR Code display                    │
│    → Copy wallet address                │
│    → 30-minute timer starts             │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 5. User sends payment from wallet       │
│    → Trust Wallet / MetaMask / etc.     │
│    → Copies transaction hash            │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 6. Submit Transaction Hash              │
│    → Manual verification OR             │
│    → Automatic detection (polling)      │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 7. Confirming                           │
│    → Shows X/Y confirmations            │
│    → Polls every 5 seconds              │
│    → Progress bar                       │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 8. Completed                            │
│    → Premium activated                  │
│    → Success message                    │
│    → Return to app                      │
└─────────────────────────────────────────┘
```

### Payment States

| Status       | Description                | User Action               | Auto-Polling |
| ------------ | -------------------------- | ------------------------- | ------------ |
| `pending`    | Awaiting transaction       | Send crypto & submit hash | ❌ No        |
| `confirming` | Transaction found, waiting | Wait for confirmations    | ✅ Yes       |
| `confirmed`  | Sufficient confirmations   | Wait for processing       | ✅ Yes       |
| `completed`  | Payment successful         | Done!                     | ❌ No        |
| `expired`    | 30 min window passed       | Create new payment        | ❌ No        |
| `cancelled`  | User cancelled             | Create new payment        | ❌ No        |
| `failed`     | Verification failed        | Contact support           | ❌ No        |

---

## 🧪 Testing with Sepolia Testnet

### Setup Instructions

1. **Get Sepolia Test ETH** (No real value - safe for testing!)

   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Alternative: [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
   - Request test ETH (may require social verification)
   - Wait 1-2 minutes for test ETH to arrive

2. **Configure MetaMask**

   - Open MetaMask browser extension or mobile app
   - Click network dropdown → "Show test networks" in settings
   - Select "Sepolia" from network list
   - Verify you see your test ETH balance

3. **Test Payment Flow**

   ```typescript
   // Create Sepolia testnet payment
   const payment = await createPayment({
     amountUsd: 10.0,
     currency: "ETH", // Native Sepolia ETH
     network: "sepolia", // Testnet
     birdId: "test-bird-id",
     purpose: "premium_subscription",
     plan: "monthly",
   });

   // Platform receive address (testnet):
   // 0x4cc28f4cea7b440858b903b5c46685cb1478cdc4

   // Send test ETH from MetaMask to the address
   // Copy transaction hash and verify
   await verifyPayment(
     payment.id,
     "your-tx-hash-from-metamask",
     "your-wallet-address"
   );
   ```

4. **Monitor Transaction**
   - View on [Sepolia Etherscan](https://sepolia.etherscan.io)
   - Check confirmations (requires 6 blocks ≈ 1.2 minutes)
   - Verify payment status in app

### ⚠️ Testing Best Practices

✅ **DO:**

- Use Sepolia for integration testing
- Test error scenarios (invalid hash, insufficient amount)
- Test payment expiration (wait 30+ minutes)
- Test network switching
- Verify status polling works correctly

❌ **DON'T:**

- Use real money on testnet
- Deploy to production with Sepolia enabled
- Share private keys or seed phrases
- Expect testnet to be 100% reliable (it can be slow)

---

## 🚨 Error Handling

### Common Errors

| Error                            | Cause                   | Solution                  |
| -------------------------------- | ----------------------- | ------------------------- |
| `"Minimum payment amount is $5"` | Amount < $5             | Increase amount           |
| `"Exchange rate not available"`  | Currency not supported  | Use supported currency    |
| `"No wallet configured"`         | Network not set up      | Contact admin             |
| `"Transaction not found"`        | Invalid tx hash         | Wait or retry             |
| `"Incorrect amount"`             | Amount mismatch         | User sent wrong amount    |
| `"Incorrect recipient address"`  | Wrong receiving address | User error - needs refund |
| `"Payment already {status}"`     | Duplicate verification  | Check current status      |
| `401 Unauthorized`               | Invalid/expired token   | Re-authenticate           |

### Error Handling Pattern

```typescript
try {
  const payment = await api.createPayment(data);
  // Success
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("Minimum payment")) {
      // Show minimum amount error
    } else if (error.message.includes("401")) {
      // Re-authenticate user
    } else {
      // Generic error handling
    }
  }
}
```

---

## 📱 Components

### 1. CryptoPaymentQR Component

Displays QR code and payment address with timer.

**Location:** `components/crypto-payment-qr.tsx`

**Features:**

- QR code generation
- Copy-to-clipboard
- 30-minute countdown timer
- Expiration warning (< 5 minutes)

### 2. CryptoPaymentStatus Component

Shows current payment status with visual indicators.

**Location:** `components/crypto-payment-status.tsx`

**Features:**

- Status badge with color coding
- Confirmation progress (X/Y confirmations)
- Transaction hash display
- Blockchain explorer links

### 3. NetworkSelector Component

Network selection with fees and confirmation times.

**Location:** `components/network-selector.tsx` (UPDATED)

**Features:**

- Visual network cards
- Fee estimates
- Confirmation time estimates
- Testnet indicator for Sepolia

---

## 🔐 Security Considerations

1. **Never Store Private Keys** - Only handle public addresses and transaction hashes
2. **Validate All Inputs** - Use `validateWalletAddress()` utility
3. **Use HTTPS Only** - All API calls must use HTTPS
4. **Secure Token Storage** - Store JWT in Expo SecureStore
5. **Amount Precision** - Always show exact amounts, never round
6. **Testnet Separation** - Never mix testnet and mainnet addresses
7. **Rate Limiting** - Backend enforces rate limits on payment creation

---

## 📦 Dependencies

All required dependencies are already installed in `package.json`:

```json
{
  "expo-clipboard": "~7.0.0", // Copy to clipboard
  "react-native-qrcode-svg": "^6.3.21", // QR code generation
  "react-native-svg": "^15.12.0", // SVG support for QR
  "@expo/vector-icons": "^15.0.3" // Icons
}
```

No additional installation needed! ✅

---

## 🚀 Usage in Your App

### Navigate to Payment Screen

From any component:

```typescript
import { router } from "expo-router";

// Navigate to crypto payment
router.push({
  pathname: "/crypto-payment",
  params: {
    amount: "9.99",
    birdId: "your-bird-id",
    plan: "monthly",
    purpose: "premium_subscription",
  },
});
```

### In Premium Subscription Flow

```typescript
// In premium-subscription-manager.tsx or similar
const handleCryptoPayment = () => {
  router.push({
    pathname: "/crypto-payment",
    params: {
      amount: selectedPlan.price.toString(),
      birdId: currentBird.id,
      plan: selectedPlan.type, // 'monthly' | 'yearly' | 'lifetime'
      purpose: "premium_subscription",
    },
  });
};
```

---

## 📊 Monitoring & Debugging

### Console Logs

The system includes comprehensive logging:

```
💰 Creating crypto payment: {currency, network, amountUsd}
✅ Payment created: {paymentId, expiresAt, status}
🔍 Verifying payment: {paymentId, transactionHash}
🔄 Checking payment status: {paymentId}
📊 Payment status result: {status, confirmations}
⏰ Time calculation: {expiresAt, remaining minutes}
```

### Development Mode Debug Info

When `__DEV__` is true, the payment screen shows:

- Polling status (ON/OFF)
- Current payment status
- Polling hook status
- Real-time updates

### Testing Checklist

- [ ] Create payment with all networks
- [ ] Verify QR code displays correctly
- [ ] Test timer countdown
- [ ] Submit transaction hash
- [ ] Monitor confirmation progress
- [ ] Test payment expiration (30 min)
- [ ] Test cancellation
- [ ] View payment history
- [ ] Test with Sepolia testnet
- [ ] Test error scenarios

---

## 🔗 Related Documentation

- [CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md](./CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md) - Original integration guide
- [CRYPTO_PAYMENT_API_IMPLEMENTATION.md](./CRYPTO_PAYMENT_API_IMPLEMENTATION.md) - Backend API docs
- [CRYPTO_PAYMENT_TESTING.md](./CRYPTO_PAYMENT_TESTING.md) - Testing guide

---

## 📞 Support

### Backend API Issues

- Check Hangfire dashboard at `/hangfire`
- Review server logs
- Verify wallet addresses are configured
- Check exchange rate API connectivity

### Frontend Issues

- Check browser/app console logs
- Verify authentication token is valid
- Test with Sepolia testnet first
- Check network connectivity

### For Help

- Review this documentation
- Check console logs for detailed errors
- Test with small amounts first
- Use Sepolia testnet for development

---

## ✅ Implementation Status

| Feature             | Status      | Notes                              |
| ------------------- | ----------- | ---------------------------------- |
| API Service Class   | ✅ Complete | `services/cryptoPaymentApi.ts`     |
| Payment Hook        | ✅ Complete | `hooks/useCryptoPayment.ts`        |
| Payment Screen      | ✅ Complete | `app/crypto-payment.tsx`           |
| Network Support     | ✅ Complete | Tron, ETH, BSC, Sepolia            |
| QR Code Display     | ✅ Complete | `components/crypto-payment-qr.tsx` |
| Status Polling      | ✅ Complete | `hooks/usePaymentStatusPolling.ts` |
| Manual Verification | ✅ Complete | Transaction hash input             |
| Payment History     | ✅ Complete | Via API service                    |
| Error Handling      | ✅ Complete | Comprehensive error messages       |
| Testnet Support     | ✅ Complete | Sepolia testnet ready              |

---

**Last Updated:** December 11, 2025  
**Version:** 1.0.0  
**Maintained By:** Wihngo Development Team
