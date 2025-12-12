# ⚡ Quick Start - Crypto Payment v2.0

**Get started in 5 minutes**

---

## 🚀 Basic Usage

### 1. Import Payment Method Selector

```typescript
import PaymentMethodSelector from "@/components/payment-method-selector";
import { PaymentMethod } from "@/config/paymentMethods";
```

### 2. Add to Your Screen

```tsx
const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>();

<PaymentMethodSelector
  selectedMethodId={selectedMethod?.id}
  onSelect={setSelectedMethod}
/>;
```

### 3. Create Payment

```typescript
import { createCryptoPayment } from "@/services/crypto.service";

const payment = await createCryptoPayment({
  amountUsd: 10,
  currency: selectedMethod.currency, // 'USDT' | 'USDC' | 'ETH' | 'BNB'
  network: selectedMethod.network, // 'tron' | 'ethereum' | 'binance-smart-chain'
  purpose: "premium_subscription",
  plan: "monthly",
});

// Payment includes unique HD wallet address
console.log(payment.walletAddress);
```

### 4. Show QR Code

```typescript
<QRCode
  value={payment.qrCodeData}
  size={250}
/>
<Text>{payment.walletAddress}</Text>
```

### 5. Poll for Status

```typescript
import { checkPaymentStatus } from "@/services/crypto.service";

const interval = setInterval(async () => {
  const updated = await checkPaymentStatus(payment.id);

  if (updated.status === "completed") {
    clearInterval(interval);
    // Show success!
  }
}, 10000); // Every 10 seconds
```

---

## 📋 Supported Methods

| Method          | Fee    | Time   | Best For      |
| --------------- | ------ | ------ | ------------- |
| USDT (Tron) 🏆  | ~$0.01 | ~1 min | Everyone      |
| USDT (BSC)      | ~$0.05 | ~1 min | Alternative   |
| USDC (BSC)      | ~$0.05 | ~1 min | USDC users    |
| USDC (Ethereum) | $5-50  | ~3 min | Maximum trust |
| USDT (Ethereum) | $5-50  | ~3 min | ETH users     |
| ETH             | $5-50  | ~3 min | ETH holders   |
| BNB             | ~$0.05 | ~1 min | BNB holders   |

---

## 🎯 Recommended Default

```typescript
import { getRecommendedPaymentMethod } from "@/config/paymentMethods";

const recommended = getRecommendedPaymentMethod();
// Returns: USDT on Tron (lowest fees, fastest)

setSelectedMethod(recommended);
```

---

## ✅ Validation

```typescript
import { isValidCombination } from "@/types/payment";

// Check before creating payment
if (!isValidCombination(currency, network)) {
  throw new Error("Invalid combination");
}
```

---

## 📊 Analytics

```typescript
import {
  trackPaymentMethodSelected,
  trackPaymentCreated,
  trackPaymentCompleted,
} from "@/utils/paymentAnalytics";

// Track user actions
trackPaymentMethodSelected(method);
trackPaymentCreated(payment);
trackPaymentCompleted(payment);
```

---

## 🛠️ Helper Functions

### Get All Methods

```typescript
import { getEnabledPaymentMethods } from "@/config/paymentMethods";
const methods = getEnabledPaymentMethods();
```

### Get Methods by Currency

```typescript
import { getPaymentMethodsForCurrency } from "@/config/paymentMethods";
const usdtMethods = getPaymentMethodsForCurrency("USDT");
```

### Get Methods by Fee

```typescript
import { getPaymentMethodsByFeeCategory } from "@/config/paymentMethods";
const lowFeeMethods = getPaymentMethodsByFeeCategory("low");
```

### Get Fee Estimate

```typescript
import { getEstimatedFee } from "@/services/crypto.service";
const fee = getEstimatedFee("USDT", "tron"); // Returns 0.01
```

---

## 🎨 Complete Example

```tsx
import React, { useState, useEffect } from "react";
import { View, Button, Text } from "react-native";
import PaymentMethodSelector from "@/components/payment-method-selector";
import { PaymentMethod } from "@/config/paymentMethods";
import {
  createCryptoPayment,
  checkPaymentStatus,
} from "@/services/crypto.service";
import { isValidCombination } from "@/types/payment";
import {
  trackPaymentMethodSelected,
  trackPaymentCreated,
} from "@/utils/paymentAnalytics";

export default function CryptoPaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>();
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState("");

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    trackPaymentMethodSelected(method);
  };

  const handleCreatePayment = async () => {
    if (!selectedMethod) return;

    if (!isValidCombination(selectedMethod.currency, selectedMethod.network)) {
      alert("Invalid payment method");
      return;
    }

    try {
      const response = await createCryptoPayment({
        amountUsd: 10,
        currency: selectedMethod.currency,
        network: selectedMethod.network,
        purpose: "premium_subscription",
        plan: "monthly",
      });

      setPayment(response.paymentRequest);
      trackPaymentCreated(response.paymentRequest);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Failed to create payment");
    }
  };

  // Poll for payment status
  useEffect(() => {
    if (!payment) return;

    const interval = setInterval(async () => {
      try {
        const updated = await checkPaymentStatus(payment.id);
        setStatus(updated.status);

        if (updated.status === "completed") {
          clearInterval(interval);
          alert("Payment completed!");
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [payment]);

  return (
    <View style={{ padding: 20 }}>
      {!selectedMethod ? (
        <>
          <Text style={{ fontSize: 20, marginBottom: 20 }}>
            Select Payment Method
          </Text>
          <PaymentMethodSelector
            selectedMethodId={selectedMethod?.id}
            onSelect={handleMethodSelect}
          />
        </>
      ) : !payment ? (
        <>
          <Text>Selected: {selectedMethod.name}</Text>
          <Text>Fee: {selectedMethod.estimatedFee}</Text>
          <Text>Time: {selectedMethod.estimatedTime}</Text>
          <Button title="Create Payment" onPress={handleCreatePayment} />
        </>
      ) : (
        <>
          <Text>
            Send {payment.amountCrypto} {payment.currency} to:
          </Text>
          <Text>{payment.walletAddress}</Text>
          <Text>Status: {status}</Text>
          {/* Add QR Code here */}
        </>
      )}
    </View>
  );
}
```

---

## 🚨 Important Notes

### ❌ No Longer Supported

- Bitcoin (BTC)
- Solana (SOL)
- Polygon (MATIC)
- Sepolia testnet

### ✅ Currently Supported

- USDT (Tron, Ethereum, BSC)
- USDC (Ethereum, BSC)
- ETH (Ethereum)
- BNB (BSC)

### 💡 Best Practices

1. Always validate combinations before API calls
2. Use recommended method (USDT on Tron) as default
3. Track analytics events
4. Poll every 10-15 seconds for status
5. Handle errors gracefully
6. Show clear fee information

---

## 📚 More Resources

- [Complete Implementation Guide](MOBILE_CRYPTO_UPDATE_V2_COMPLETE.md)
- [Migration Guide](MIGRATION_GUIDE_V2.md)
- [Type Definitions](types/crypto.ts)
- [Payment Config](config/paymentMethods.ts)

---

## ❓ Quick Troubleshooting

### TypeScript Error

```
Type 'BTC' is not assignable to type 'CryptoCurrency'
```

**Solution:** Use 'USDT', 'USDC', 'ETH', or 'BNB'

### Invalid Combination Error

```
Currency ETH is not supported on network binance-smart-chain
```

**Solution:** Use `isValidCombination()` to check first

### Payment Not Detected

- Check network (mainnet vs testnet)
- Verify correct amount sent
- Wait for confirmations (19 for Tron, 12 for ETH, 15 for BSC)
- Try manual verification with transaction hash

---

**Ready to implement?** Start with the example above! 🚀

**Questions?** Check the comprehensive guides or contact the development team.
