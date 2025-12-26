# Crypto Payment Quick Start Guide

## Wihngo Mobile App - Developer Reference

**Quick reference for implementing crypto payments in the Wihngo app**

---

## 🚀 Quick Start

### 1. Navigate to Payment Screen

```typescript
import { router } from "expo-router";

// From premium subscription screen
router.push({
  pathname: "/crypto-payment",
  params: {
    amount: "9.99",
    birdId: bird.id,
    plan: "monthly", // or 'yearly', 'lifetime'
    purpose: "premium_subscription",
  },
});
```

### 2. The Payment Flow

The `crypto-payment.tsx` screen handles everything:

```
User arrives → Select Network → Review Amount → Create Payment
→ Show QR Code → User Pays → Submit TX Hash → Poll Status
→ Show Confirmations → Complete!
```

**No additional code needed!** The screen is self-contained.

---

## 📚 API Service Functions

### Available Functions (crypto.service.ts)

```typescript
// Import service functions
import {
  createCryptoPayment,
  verifyCryptoPayment,
  checkPaymentStatus,
  getCryptoExchangeRates,
  getCryptoExchangeRate,
  getWalletInfo,
  getCryptoPaymentHistory,
  cancelCryptoPayment,
} from "@/services/crypto.service";
```

### 1. Create Payment

```typescript
const response = await createCryptoPayment({
  amountUsd: 9.99,
  currency: "USDT",
  network: "tron",
  birdId: "bird-guid",
  purpose: "premium_subscription",
  plan: "monthly",
});

// Response contains:
// - paymentRequest.id (payment ID)
// - paymentRequest.walletAddress (where to send)
// - paymentRequest.amountCrypto (exact amount to send)
// - paymentRequest.qrCodeData (for QR code)
// - paymentRequest.expiresAt (30 min expiration)
```

### 2. Verify Payment

```typescript
const result = await verifyCryptoPayment(paymentId, {
  transactionHash: "0xabc123...",
  userWalletAddress: "TXYZuser...", // optional
});

// Response contains updated payment with:
// - status: 'confirming' or 'confirmed'
// - confirmations: current confirmations
// - requiredConfirmations: needed confirmations
```

### 3. Check Status

```typescript
// Manual check
const payment = await checkPaymentStatus(paymentId);

// Or use the polling hook (recommended)
import { usePaymentStatusPolling } from "@/hooks/usePaymentStatusPolling";

const { status, confirmations, paymentData } = usePaymentStatusPolling({
  paymentId: payment.id,
  authToken: token,
  enabled: true,
  onStatusChange: (updated) => {
    if (updated.status === "completed") {
      // Payment successful!
    }
  },
});
```

### 4. Get Exchange Rates

```typescript
// All rates
const rates = await getCryptoExchangeRates();

// Specific currency
const usdtRate = await getCryptoExchangeRate("USDT");
// Returns: { currency: 'USDT', usdRate: 0.9998, lastUpdated: '...', source: 'CoinGecko' }
```

### 5. Get Payment History

```typescript
const history = await getCryptoPaymentHistory(1, 20);
// Returns paginated list of past payments
```

---

## 🎨 UI Components

### 1. Network Selector

```typescript
import NetworkSelector from "@/components/network-selector";

<NetworkSelector
  networks={["tron", "ethereum", "binance-smart-chain"]}
  selectedNetwork={selectedNetwork}
  onSelect={(network) => setSelectedNetwork(network)}
  currency="USDT"
/>;
```

### 2. Payment QR Code

```typescript
import CryptoPaymentQR from "@/components/crypto-payment-qr";

<CryptoPaymentQR
  payment={paymentRequest}
  onExpired={() => {
    // Handle expiration
  }}
/>;
```

### 3. Payment Status

```typescript
import CryptoPaymentStatus from "@/components/crypto-payment-status";

<CryptoPaymentStatus payment={paymentRequest} showDetails={true} />;
```

---

## 🔄 Payment Status Hook

### usePaymentStatusPolling

Automatically polls payment status every 5 seconds:

```typescript
import { usePaymentStatusPolling } from "@/hooks/usePaymentStatusPolling";

const {
  status, // Current status
  confirmations, // Current confirmations
  requiredConfirmations, // Required confirmations
  loading, // Is checking?
  error, // Any error message
  paymentData, // Full payment object
  forceCheck, // Manual check function
} = usePaymentStatusPolling({
  paymentId: payment.id,
  authToken: token,
  enabled: true, // Start/stop polling
  onStatusChange: (updatedPayment) => {
    console.log("Status changed:", updatedPayment.status);
  },
});

// Manual check
await forceCheck();
```

---

## 💡 Common Use Cases

### Use Case 1: Premium Subscription

```typescript
// User clicks "Upgrade to Premium"
const handleUpgrade = () => {
  router.push({
    pathname: "/crypto-payment",
    params: {
      amount: "9.99",
      birdId: currentBird.id,
      plan: "monthly",
      purpose: "premium_subscription",
    },
  });
};

// That's it! The payment screen handles everything.
```

### Use Case 2: Custom Payment Amount

```typescript
// Variable amount payment
const handleDonation = (amount: number) => {
  router.push({
    pathname: "/crypto-payment",
    params: {
      amount: amount.toString(),
      birdId: bird.id,
      purpose: "donation",
    },
  });
};
```

### Use Case 3: Check Past Payments

```typescript
const PaymentHistoryScreen = () => {
  const [history, setHistory] = useState<CryptoPaymentHistory | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getCryptoPaymentHistory(1, 20);
      setHistory(data);
    };
    loadHistory();
  }, []);

  return (
    <ScrollView>
      {history?.payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </ScrollView>
  );
};
```

---

## 🛠️ Utility Functions

### Format Amounts

```typescript
import {
  formatCryptoAmount,
  calculateCryptoAmount,
  calculateUsdAmount,
} from "@/services/crypto.service";

// Format for display
const displayAmount = formatCryptoAmount(10.023456, "USDT");
// Result: "10.02"

// Calculate crypto amount from USD
const cryptoAmount = calculateCryptoAmount(9.99, 0.9978);
// Result: 10.02 (USD / rate)

// Calculate USD from crypto
const usdAmount = calculateUsdAmount(10.02, 0.9978);
// Result: 9.99 (crypto * rate)
```

### Validate Addresses

```typescript
import { validateWalletAddress } from "@/services/crypto.service";

// Validate wallet address
const isValid = validateWalletAddress(
  "TXYZa1b2c3d4e5f6g7h8i9j0...",
  "USDT",
  "tron"
);

// Tron: Starts with 'T', 34 characters
// Ethereum/BSC: Starts with '0x', 42 characters
```

### Network Names

```typescript
import { getNetworkName } from "@/services/crypto.service";

const name = getNetworkName("tron");
// Result: "Tron (TRC-20)"

const name2 = getNetworkName("binance-smart-chain");
// Result: "Binance Smart Chain (BEP-20)"
```

### Estimated Fees

```typescript
import { getEstimatedFee } from "@/services/crypto.service";

const fee = getEstimatedFee("USDT", "tron");
// Result: 1.0 (USD)

const ethFee = getEstimatedFee("USDT", "ethereum");
// Result: 5.0 (USD)
```

### Time Remaining

```typescript
import { formatTimeRemaining } from "@/services/crypto.service";

// Payment expires in 30 minutes
const remaining = formatTimeRemaining(payment.expiresAt);
// Result: "29m 45s" or "Expired"
```

---

## ⚠️ Important Notes

### Decimal Places

**CRITICAL:** Different networks use different decimal places!

```typescript
// Tron (TRC-20) USDT: 6 decimals
// Ethereum (ERC-20) USDT: 6 decimals
// BSC (BEP-20) USDT: 18 decimals! ⚠️

// Always use backend-provided amountCrypto!
// Don't calculate decimals yourself.
```

### Minimum Amount

```typescript
// Backend enforces $5 minimum
if (amountUsd < 5) {
  throw new Error("Minimum payment amount is $5");
}
```

### Payment Expiration

```typescript
// Payments expire after 30 minutes
// Show timer to user
// Handle expiration gracefully
```

### Polling

```typescript
// Poll every 5 seconds when payment is active
// Stop polling when status is terminal:
const terminalStatuses = ["completed", "expired", "cancelled", "failed"];

if (terminalStatuses.includes(payment.status)) {
  // Stop polling
  setEnablePolling(false);
}
```

---

## 🔍 Debugging

### Enable Debug Logs

```typescript
// In crypto.service.ts - logs are already enabled
// Check console for:
// 💰 Creating payment
// 🔍 Verifying transaction
// 📊 Payment status
// ⏰ Time calculation
```

### Check Payment State

```typescript
// In development mode, payment screen shows debug info
{
  __DEV__ && (
    <View style={debugStyle}>
      <Text>
        Status: {payment.status}
        Polling: {enablePolling ? "ON" : "OFF"}
        Confirmations: {payment.confirmations}/{payment.requiredConfirmations}
      </Text>
    </View>
  );
}
```

### Common Issues

**Issue:** Payment not updating

```typescript
// Check if polling is enabled
console.log("Polling enabled:", enablePolling);

// Check token validity
console.log("Token:", token);

// Force manual check
await forceCheck();
```

**Issue:** Timer shows wrong time

```typescript
// Backend might send wrong format
// Check formatTimeRemaining() in crypto.service.ts
// It has fallback logic for wrong timestamps
```

---

## 📦 Type Definitions

### Payment Request

```typescript
type CryptoPaymentRequest = {
  id: string;
  userId: string;
  birdId?: string;
  amountUsd: number;
  amountCrypto: number; // Use this for display!
  currency: 'USDT' | 'USDC' | ...;
  network: 'tron' | 'ethereum' | 'binance-smart-chain' | ...;
  exchangeRate: number;
  walletAddress: string; // Platform address
  userWalletAddress?: string; // User's address (optional)
  qrCodeData: string; // For QR code
  paymentUri: string; // Payment URI
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  status: 'pending' | 'confirming' | 'confirmed' | 'completed' | 'expired' | 'cancelled' | 'failed';
  purpose: 'premium_subscription' | 'donation' | 'purchase';
  plan?: 'monthly' | 'yearly' | 'lifetime';
  expiresAt: string; // ISO timestamp
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Payment Response

```typescript
type CryptoPaymentResponse = {
  paymentRequest: CryptoPaymentRequest;
  message: string;
};
```

### Exchange Rate

```typescript
type CryptoExchangeRate = {
  currency: 'USDT' | 'USDC' | ...;
  usdRate: number; // e.g., 0.9998
  lastUpdated: string;
  source: string; // e.g., 'CoinGecko'
};
```

---

## 🎯 Testing Checklist

- [ ] Navigate to payment screen
- [ ] Select network (Tron/Ethereum/BSC)
- [ ] Create payment request
- [ ] Display QR code
- [ ] Copy wallet address
- [ ] Timer counts down
- [ ] Submit transaction hash
- [ ] Poll for status updates
- [ ] Show confirmation progress
- [ ] Complete payment
- [ ] Handle expiration
- [ ] View payment history

---

## 🔗 Related Files

- `app/crypto-payment.tsx` - Main payment screen
- `services/crypto.service.ts` - API service
- `hooks/usePaymentStatusPolling.ts` - Status polling
- `types/crypto.ts` - Type definitions
- `components/crypto-payment-qr.tsx` - QR code component
- `components/crypto-payment-status.tsx` - Status component
- `components/network-selector.tsx` - Network selector

---

## 📞 Support

- Review `CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md` for full details
- Check backend API docs for endpoint reference
- Test with small amounts first
- Contact backend team for API issues

---

**Last Updated:** December 11, 2025  
**Happy coding! 🚀**
