# Crypto Payment Quick Start Guide

## 🚀 Quick Implementation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

Required packages (already in package.json):

- `expo-clipboard` - Copy wallet addresses
- `react-native-svg` - QR code rendering
- `react-native-qrcode-svg` - QR code generation

### 2. Navigate to Crypto Payment

```typescript
import { router } from "expo-router";

// For premium subscription
router.push({
  pathname: "/crypto-payment",
  params: {
    birdId: "bird-123",
    plan: "monthly", // or "yearly", "lifetime"
    amount: "9.99",
    purpose: "premium_subscription",
  },
});

// For donation
router.push({
  pathname: "/crypto-payment",
  params: {
    amount: "25.00",
    purpose: "donation",
  },
});
```

### 3. Add to Payment Methods

Already integrated in `/app/payment-methods.tsx`:

- Shows saved crypto wallets
- "Pay with Crypto" button
- Manages wallet removal and defaults

### 4. Use in Premium Flow

```typescript
import PremiumPaymentOptions from "@/components/premium-payment-options";

<PremiumPaymentOptions
  birdId={birdId}
  plan="monthly"
  amount={9.99}
  onSelectPayment={(method) => {
    // Handle other payment methods
    if (method === "card") {
      // Process card payment
    }
  }}
/>;
```

## 📋 Available Components

### CryptoCurrencySelector

Select which cryptocurrency to use:

```typescript
import CryptoCurrencySelector from "@/components/crypto-currency-selector";

<CryptoCurrencySelector
  selectedCurrency={selectedCurrency}
  onSelect={(currency) => setSelectedCurrency(currency)}
/>;
```

### NetworkSelector

Choose blockchain network (for multi-network coins):

```typescript
import NetworkSelector from "@/components/network-selector";

<NetworkSelector
  networks={["ethereum", "polygon", "binance-smart-chain"]}
  selectedNetwork={selectedNetwork}
  onSelect={(network) => setSelectedNetwork(network)}
  currency="USDT"
/>;
```

### CryptoPaymentQR

Display payment QR code and details:

```typescript
import CryptoPaymentQR from "@/components/crypto-payment-qr";

<CryptoPaymentQR
  payment={paymentRequest}
  onExpired={() => {
    Alert.alert("Payment Expired", "Please create a new payment");
  }}
/>;
```

### CryptoPaymentStatus

Show payment status with progress:

```typescript
import CryptoPaymentStatus from "@/components/crypto-payment-status";

<CryptoPaymentStatus payment={paymentRequest} showDetails={true} />;
```

## 🔧 Service Functions

### Create Payment

```typescript
import { createCryptoPayment } from "@/services/crypto.service";

const response = await createCryptoPayment({
  birdId: "bird-123",
  amountUsd: 9.99,
  currency: "BTC",
  network: "bitcoin",
  purpose: "premium_subscription",
  plan: "monthly",
});

console.log(response.paymentRequest);
```

### Get Exchange Rate

```typescript
import { getCryptoExchangeRate } from "@/services/crypto.service";

const rate = await getCryptoExchangeRate("BTC");
console.log(`1 BTC = $${rate.usdRate}`);
```

### Poll Payment Status

```typescript
import { pollPaymentStatus } from "@/services/crypto.service";

const interval = setInterval(async () => {
  const payment = await pollPaymentStatus(paymentId);

  if (payment.status === "completed") {
    clearInterval(interval);
    // Handle success
  }
}, 5000);
```

### Format Amounts

```typescript
import {
  formatCryptoAmount,
  calculateCryptoAmount,
} from "@/services/crypto.service";

const btcAmount = formatCryptoAmount(0.00012345, "BTC");
// "0.00012345"

const cryptoAmount = calculateCryptoAmount(100, 50000);
// 0.002 (for $100 at $50k/BTC)
```

### Validate Address

```typescript
import { validateWalletAddress } from "@/services/crypto.service";

const isValid = validateWalletAddress(
  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "BTC"
);
```

## 🎨 Supported Cryptocurrencies

| Currency     | Code | Networks               | Min Amount |
| ------------ | ---- | ---------------------- | ---------- |
| Bitcoin      | BTC  | Bitcoin                | $10        |
| Ethereum     | ETH  | Ethereum               | $5         |
| Tether       | USDT | Ethereum, BSC, Tron    | $5         |
| USD Coin     | USDC | Ethereum, Polygon, BSC | $5         |
| Binance Coin | BNB  | BSC                    | $5         |
| Solana       | SOL  | Solana                 | $5         |
| Dogecoin     | DOGE | Bitcoin                | $10        |

## 🔐 Security Checklist

- [x] Wallet address validation
- [x] Payment expiration (30 minutes)
- [x] Amount verification
- [x] Network confirmation warnings
- [x] Transaction verification
- [x] Secure data transmission
- [x] No private key storage on frontend
- [x] Rate limiting on backend

## 📱 User Flow

1. **Select Payment Method** → Choose "Cryptocurrency"
2. **Select Currency** → Pick BTC, ETH, USDT, etc.
3. **Select Network** → Choose blockchain (if multiple)
4. **Review Amount** → See crypto amount and exchange rate
5. **Get Payment Address** → Receive wallet address + QR code
6. **Send Payment** → User sends from their wallet
7. **Await Confirmation** → Track blockchain confirmations
8. **Complete** → Premium activated!

## 🐛 Troubleshooting

### QR Code Not Showing

```bash
npm install react-native-svg react-native-qrcode-svg
```

### Clipboard Not Working

```bash
npm install expo-clipboard
```

### Exchange Rate Errors

Check backend API is running and returning rates from `/payments/crypto/rates`

### Payment Not Detected

- Verify transaction on blockchain explorer
- Check correct network was used
- Ensure amount matches exactly
- Wait for transaction broadcast (can take a few minutes)

## 📊 Payment States

```typescript
type CryptoPaymentStatus =
  | "pending" // Waiting for payment
  | "confirming" // Transaction detected, awaiting confirmations
  | "confirmed" // Confirmed but not yet processed
  | "completed" // Successfully processed
  | "expired" // Payment window expired
  | "failed" // Payment failed
  | "refunded"; // Payment refunded
```

## 🔄 Payment Lifecycle

```
pending → confirming → confirmed → completed
   ↓           ↓            ↓
expired    expired      expired
```

## 💡 Best Practices

1. **Always validate addresses** before creating payments
2. **Show exchange rates prominently** so users know the conversion
3. **Display countdown timer** for payment expiration
4. **Poll status regularly** but not too frequently (5s interval is good)
5. **Handle all error states** gracefully
6. **Show clear instructions** for first-time crypto users
7. **Provide blockchain explorer links** for transparency
8. **Send confirmation notifications** when payment completes

## 🆘 Support

For issues:

1. Check the full documentation in `/docs/CRYPTO_PAYMENT_GUIDE.md`
2. Review backend requirements in `/docs/CRYPTO_BACKEND_IMPLEMENTATION.md`
3. Check console logs for errors
4. Verify backend API endpoints are working
5. Test with small amounts first

## 📚 Documentation Files

- `CRYPTO_PAYMENT_GUIDE.md` - Complete frontend guide
- `CRYPTO_BACKEND_IMPLEMENTATION.md` - Backend API guide
- `CRYPTO_QUICKSTART.md` - This file

## 🎯 Example: Complete Payment Flow

```typescript
import { useState } from "react";
import {
  createCryptoPayment,
  pollPaymentStatus,
} from "@/services/crypto.service";

function PaymentExample() {
  const [payment, setPayment] = useState(null);

  // 1. Create payment
  const handleCreatePayment = async () => {
    const response = await createCryptoPayment({
      birdId: "bird-123",
      amountUsd: 9.99,
      currency: "BTC",
      network: "bitcoin",
      purpose: "premium_subscription",
      plan: "monthly",
    });

    setPayment(response.paymentRequest);
    startPolling(response.paymentRequest.id);
  };

  // 2. Poll for updates
  const startPolling = (paymentId) => {
    const interval = setInterval(async () => {
      const updated = await pollPaymentStatus(paymentId);
      setPayment(updated);

      if (updated.status === "completed") {
        clearInterval(interval);
        handleSuccess();
      }
    }, 5000);
  };

  // 3. Handle success
  const handleSuccess = () => {
    Alert.alert("Success!", "Your payment is complete!");
  };

  return (
    <View>
      {!payment ? (
        <Button title="Pay with Crypto" onPress={handleCreatePayment} />
      ) : (
        <>
          <CryptoPaymentQR payment={payment} />
          <CryptoPaymentStatus payment={payment} />
        </>
      )}
    </View>
  );
}
```

That's it! You're ready to accept crypto payments! 🎉
