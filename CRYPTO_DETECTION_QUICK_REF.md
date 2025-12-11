# 🎯 Automatic Crypto Payment Detection - Quick Reference

## 🚀 For Developers

### **TL;DR**

Users send crypto → Backend auto-detects → Frontend polls → Payment completes. **No manual transaction hash needed!**

---

## 📡 Key Endpoints

### **Create Payment**

```
POST /api/payments/crypto/create
Headers: Authorization: Bearer {token}
Body: { amountUsd, currency, network, purpose, plan?, birdId? }
Returns: { paymentRequest: {...}, message: "..." }
```

### **Check Payment Status** ⭐ **PRIMARY**

```
POST /api/payments/crypto/{paymentId}/check-status
Headers: Authorization: Bearer {token}
Returns: Updated CryptoPaymentRequest object
```

### **Get Payment Details**

```
GET /api/payments/crypto/{paymentId}
Headers: Authorization: Bearer {token}
Returns: CryptoPaymentRequest object
```

---

## 🔄 Status Flow

```
pending → confirming → confirmed → completed ✅
   ↓          ↓            ↓
expired    cancelled    failed ❌
```

---

## ⏱️ Polling Intervals

```typescript
const INTERVALS = {
  pending: 10000, // 10 seconds
  confirming: 15000, // 15 seconds
  confirmed: 5000, // 5 seconds
  completed: 0, // Stop
  expired: 0, // Stop
  cancelled: 0, // Stop
  failed: 0, // Stop
};
```

---

## 💻 Usage Example

```typescript
import {
  createCryptoPayment,
  checkPaymentStatus,
} from "@/services/crypto.service";

// 1. Create payment
const response = await createCryptoPayment({
  amountUsd: 9.99,
  currency: "USDT",
  network: "tron",
  purpose: "premium_subscription",
  plan: "monthly",
});

const payment = response.paymentRequest;

// 2. Show QR code to user
<CryptoPaymentQR payment={payment} />;

// 3. Poll for status (automatic with hook)
const { status, confirmations } = usePaymentStatusPolling({
  paymentId: payment.id,
  authToken: token,
  enabled: true,
  onStatusChange: (updated) => {
    if (updated.status === "completed") {
      // Payment complete!
      router.push("/success");
    }
  },
});

// Or manually:
const interval = setInterval(async () => {
  const updated = await checkPaymentStatus(payment.id);

  if (["completed", "expired", "failed"].includes(updated.status)) {
    clearInterval(interval);
  }
}, 10000);
```

---

## 🎨 UI Components

### **Show Payment Address**

```tsx
<CryptoPaymentQR payment={payment} onExpired={() => handleExpiration()} />
```

### **Show Payment Status**

```tsx
<CryptoPaymentStatus payment={payment} showDetails={true} />
```

---

## 🔑 Key Functions

```typescript
// Service Functions
createCryptoPayment(dto); // Create new payment
checkPaymentStatus(paymentId); // Check status (automatic detection)
getCryptoPayment(paymentId); // Get payment details
verifyCryptoPayment(id, dto); // Manual verification (optional)
cancelCryptoPayment(paymentId); // Cancel payment
getCryptoExchangeRates(); // Get current rates
getPollingInterval(status); // Get recommended polling interval

// Hook
usePaymentStatusPolling({
  // Automatic polling hook
  paymentId,
  authToken,
  enabled,
  onStatusChange,
});
```

---

## 🐛 Quick Debugging

```typescript
// Check if polling is enabled
console.log("Polling:", enablePolling ? "ON" : "OFF");

// Check payment status
console.log("Payment:", payment?.status, payment?.confirmations);

// Force status check
await checkPaymentStatus(paymentId);

// Check backend logs
// Look for: 🔍 Scanning wallet, ✅ Transaction detected
```

---

## ⚡ Pro Tips

1. **Always use `checkPaymentStatus`** (POST) for polling, not `getCryptoPayment` (GET)
2. **Stop polling** when terminal status is reached
3. **Handle expiration** after 30 minutes
4. **Show countdown timer** for better UX
5. **Log detection time** for monitoring
6. **Manual verification** is optional, not required
7. **Test with Tron testnet** before mainnet
8. **Backend scans every 30s**, frontend polls every 10-15s

---

## 🔗 Important Files

```
services/crypto.service.ts         - API calls
hooks/usePaymentStatusPolling.ts   - Polling logic
components/crypto-payment-qr.tsx   - QR display
app/crypto-payment.tsx             - Main screen
types/crypto.ts                    - Type definitions
```

---

## 📞 Support

- **Backend Logs**: Check for emoji logs (🔍, ✅, 📊, ❌)
- **Frontend Logs**: Check console for "🔄 Checking payment status"
- **Hangfire Dashboard**: `/hangfire` for background job status
- **Documentation**: See `AUTOMATIC_CRYPTO_DETECTION_GUIDE.md`

---

**Version**: 1.0.0  
**Last Updated**: December 11, 2025
