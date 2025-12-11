# Crypto Payment Frontend Integration Guide

## Wihngo - Expo React Native Mobile App

**Last Updated:** December 11, 2025  
**API Version:** 1.0  
**Backend Framework:** .NET 10 / ASP.NET Core

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Supported Cryptocurrencies](#supported-cryptocurrencies)
3. [API Endpoints](#api-endpoints)
4. [Payment Flow](#payment-flow)
5. [Implementation Guide](#implementation-guide)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Testing Checklist](#testing-checklist)
9. [Security Considerations](#security-considerations)

---

## 🎯 Overview

The crypto payment system is fully integrated into the Wihngo mobile app, supporting multiple cryptocurrencies and networks. Users can pay for premium subscriptions using cryptocurrency wallets.

### Key Features

- ✅ Multiple network support (Tron, Ethereum, BSC)
- ✅ Real-time payment verification
- ✅ QR code payment integration
- ✅ Automatic confirmation tracking
- ✅ Payment expiration (30 minutes)
- ✅ Payment history

### Project Structure

```
wihngo/
├── app/
│   └── crypto-payment.tsx          # Main payment screen
├── components/
│   ├── crypto-currency-selector.tsx
│   ├── crypto-payment-qr.tsx
│   ├── crypto-payment-status.tsx
│   └── network-selector.tsx
├── services/
│   └── crypto.service.ts           # API service layer
├── hooks/
│   └── usePaymentStatusPolling.ts  # Status polling hook
├── types/
│   └── crypto.ts                   # Type definitions
└── contexts/
    └── auth-context.tsx            # Authentication context
```

---

## 💰 Supported Cryptocurrencies

| Currency | Network  | Token Type | Decimals | Network Identifier    | Fee    |
| -------- | -------- | ---------- | -------- | --------------------- | ------ |
| **USDT** | Tron     | TRC-20     | 6        | `tron`                | Low    |
| **USDT** | Ethereum | ERC-20     | 6        | `ethereum`            | High   |
| **USDT** | BSC      | BEP-20     | **18**   | `binance-smart-chain` | Medium |
| USDC     | Ethereum | ERC-20     | 6        | `ethereum`            | High   |
| USDC     | BSC      | BEP-20     | 18       | `binance-smart-chain` | Medium |

**⚠️ CRITICAL:** BEP-20 USDT on Binance Smart Chain uses **18 decimals**, not 6!

### Network Confirmation Requirements

| Network  | Confirmations | Approximate Time |
| -------- | ------------- | ---------------- |
| Tron     | 19 blocks     | ~57 seconds      |
| Ethereum | 12 blocks     | ~2.4 minutes     |
| BSC      | 15 blocks     | ~45 seconds      |

---

## 🔌 API Endpoints

### Base URL

```
https://api.wihngo.com/api/payments/crypto
```

### Authentication

All endpoints (except rates) require JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Available Endpoints

#### 1. Get Exchange Rates (Public)

```http
GET /rates
```

#### 2. Get Specific Rate (Public)

```http
GET /rates/{currency}
```

#### 3. Get Platform Wallet (Public)

```http
GET /wallet/{currency}/{network}
```

#### 4. Create Payment Request (Authenticated)

```http
POST /create
```

**Request Body:**

```json
{
  "amountUsd": 9.99,
  "currency": "USDT",
  "network": "tron",
  "birdId": "123e4567-e89b-12d3-a456-426614174000",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

**Response:**

```json
{
  "paymentRequest": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "user-guid",
    "birdId": "bird-guid",
    "amountUsd": 9.99,
    "amountCrypto": 10.02,
    "currency": "USDT",
    "network": "tron",
    "exchangeRate": 0.9978,
    "walletAddress": "TXYZa1b2c3d4e5f6g7h8i9j0...",
    "qrCodeData": "TXYZa1b2c3d4e5f6g7h8i9j0...",
    "paymentUri": "TXYZa1b2c3d4e5f6g7h8i9j0...",
    "requiredConfirmations": 19,
    "status": "pending",
    "purpose": "premium_subscription",
    "plan": "monthly",
    "expiresAt": "2024-01-15T11:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 5. Verify Payment (Authenticated)

```http
POST /{paymentId}/verify
```

**Request Body:**

```json
{
  "transactionHash": "0xabc123...",
  "userWalletAddress": "TXYZuser123..."
}
```

#### 6. Get Payment Status (Authenticated)

```http
GET /{paymentId}
```

#### 7. Check Payment Status (Authenticated)

```http
POST /{paymentId}/check-status
```

#### 8. Get Payment History (Authenticated)

```http
GET /history?page=1&pageSize=20
```

#### 9. Cancel Payment (Authenticated)

```http
POST /{paymentId}/cancel
```

---

## 🔄 Payment Flow

### Complete User Journey

```
1. User selects premium plan
   ↓
2. User selects cryptocurrency (USDT/USDC)
   ↓
3. User selects network (Tron/Ethereum/BSC)
   ↓
4. App calls POST /create → Get payment details
   ↓
5. Display payment screen with:
   - Amount to pay (amountCrypto)
   - QR code (qrCodeData)
   - Wallet address (walletAddress)
   - Timer (30 min expiration)
   ↓
6. User opens crypto wallet and sends payment
   ↓
7. User submits transaction hash
   ↓
8. App calls POST /{paymentId}/verify
   ↓
9. Start polling: POST /{paymentId}/check-status (every 5s)
   ↓
10. Show confirmation progress:
    - confirming: X/Y confirmations
    - confirmed: Processing
    - completed: Success! Premium activated
```

### Payment States

| Status       | Description                | User Action               | Polling |
| ------------ | -------------------------- | ------------------------- | ------- |
| `pending`    | Waiting for transaction    | Send crypto & submit hash | ❌ No   |
| `confirming` | Transaction found, waiting | Wait                      | ✅ Yes  |
| `confirmed`  | Sufficient confirmations   | Wait                      | ✅ Yes  |
| `completed`  | Payment successful         | Done!                     | ❌ No   |
| `expired`    | Payment window expired     | Create new                | ❌ No   |
| `cancelled`  | User cancelled             | Create new                | ❌ No   |
| `failed`     | Verification failed        | Contact support           | ❌ No   |

---

## 🛠️ Implementation Guide

### Files Already Implemented

✅ **services/crypto.service.ts** - API service layer  
✅ **hooks/usePaymentStatusPolling.ts** - Status polling hook  
✅ **types/crypto.ts** - Type definitions  
✅ **app/crypto-payment.tsx** - Main payment screen  
✅ **components/crypto-currency-selector.tsx**  
✅ **components/network-selector.tsx**  
✅ **components/crypto-payment-qr.tsx**  
✅ **components/crypto-payment-status.tsx**

### Dependencies (Already Installed)

```json
{
  "expo-clipboard": "~7.0.0",
  "react-native-qrcode-svg": "^6.3.21",
  "react-native-svg": "^14.0.0"
}
```

---

## 📝 Code Examples

### 1. Create Payment Request

```typescript
import { createCryptoPayment } from "@/services/crypto.service";

const response = await createCryptoPayment({
  amountUsd: 9.99,
  currency: "USDT",
  network: "tron",
  birdId: "bird-guid",
  purpose: "premium_subscription",
  plan: "monthly",
});

console.log("Payment ID:", response.paymentRequest.id);
console.log("Wallet Address:", response.paymentRequest.walletAddress);
console.log("Amount:", response.paymentRequest.amountCrypto, "USDT");
```

### 2. Verify Payment

```typescript
import { verifyCryptoPayment } from "@/services/crypto.service";

const result = await verifyCryptoPayment(paymentId, {
  transactionHash: "0xabc123...",
  userWalletAddress: "TXYZuser...", // Optional
});

console.log("Status:", result.status);
console.log("Confirmations:", result.confirmations);
```

### 3. Poll Payment Status

```typescript
import { usePaymentStatusPolling } from "@/hooks/usePaymentStatusPolling";

const {
  status,
  confirmations,
  requiredConfirmations,
  paymentData,
  forceCheck,
} = usePaymentStatusPolling({
  paymentId: payment.id,
  authToken: token,
  enabled: true,
  onStatusChange: (updatedPayment) => {
    if (updatedPayment.status === "completed") {
      // Payment successful!
      router.push("/success");
    }
  },
});
```

### 4. Display QR Code

```typescript
import QRCode from "react-native-qrcode-svg";

<QRCode value={payment.walletAddress} size={200} backgroundColor="white" />;
```

### 5. Copy to Clipboard

```typescript
import * as Clipboard from "expo-clipboard";

const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  Alert.alert("Copied", "Address copied to clipboard");
};
```

### 6. Timer Countdown

```typescript
import { formatTimeRemaining } from "@/services/crypto.service";

const [timeRemaining, setTimeRemaining] = useState<string>("");

useEffect(() => {
  if (!payment?.expiresAt) return;

  const updateTimer = () => {
    setTimeRemaining(formatTimeRemaining(payment.expiresAt));
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [payment?.expiresAt]);
```

---

## 🚨 Error Handling

### Common Errors and Solutions

| Error                            | Cause                            | Solution                   |
| -------------------------------- | -------------------------------- | -------------------------- |
| `"Minimum payment amount is $5"` | Amount too low                   | Enforce minimum $5         |
| `"Exchange rate not available"`  | Currency not supported           | Check supported currencies |
| `"No wallet configured"`         | Network not set up               | Contact admin              |
| `"Transaction not found"`        | Invalid tx hash or not confirmed | Wait and retry             |
| `"Incorrect amount"`             | Amount mismatch                  | User sent wrong amount     |
| `"Incorrect recipient address"`  | Sent to wrong address            | User error - refund needed |
| `"Payment already {status}"`     | Duplicate verification           | Check current status       |
| `401 Unauthorized`               | Invalid/expired token            | Re-authenticate user       |

### Error Handling Example

```typescript
try {
  const payment = await createCryptoPayment(data);
} catch (error: any) {
  if (error.response?.status === 400) {
    // Validation error
    Alert.alert("Invalid Request", error.response.data.error);
  } else if (error.response?.status === 401) {
    // Authentication error
    router.replace("/welcome");
  } else if (error.response?.status === 404) {
    // Not found
    Alert.alert("Not Found", "Payment request not found");
  } else {
    // Server error
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
}
```

---

## 🧪 Testing Checklist

### Basic Flow Tests

- [ ] **Create Payment**

  - [ ] Test with USDT on Tron network
  - [ ] Test with USDT on Ethereum network
  - [ ] Test with USDT on BSC network
  - [ ] Test with minimum amount ($5)
  - [ ] Test with invalid amount (< $5)

- [ ] **Network Switching**

  - [ ] Change network before payment creation
  - [ ] Verify correct wallet address displayed
  - [ ] Verify correct decimal places (BEP-20 = 18!)

- [ ] **QR Code**

  - [ ] QR code displays correctly
  - [ ] QR code is scannable with wallet apps
  - [ ] Copy address button works

- [ ] **Payment Verification**

  - [ ] Submit valid transaction hash
  - [ ] Submit invalid transaction hash
  - [ ] Submit duplicate hash
  - [ ] Verify error messages

- [ ] **Status Updates**
  - [ ] Monitor confirmation progress (X/Y)
  - [ ] Test payment completion
  - [ ] Test payment expiration (30 min)
  - [ ] Test manual status refresh

### Edge Cases

- [ ] **Network Errors**

  - [ ] API timeout during creation
  - [ ] Connection lost during polling
  - [ ] Retry failed requests

- [ ] **App State**

  - [ ] App backgrounded during payment
  - [ ] App closed and reopened
  - [ ] Resume polling after restart

- [ ] **Authentication**

  - [ ] Token expiration during payment
  - [ ] Re-authentication flow
  - [ ] Maintain payment state after login

- [ ] **Timer**
  - [ ] Timer counts down correctly
  - [ ] Warning when < 5 minutes
  - [ ] Auto-expire at 0:00

### Integration Tests

- [ ] **End-to-End Flow**

  - [ ] Create payment → Send crypto → Verify → Complete
  - [ ] Test with real testnet transaction
  - [ ] Verify premium activation

- [ ] **Payment History**
  - [ ] View past payments
  - [ ] Pagination works
  - [ ] Filter by status

---

## 🔐 Security Considerations

### Best Practices

1. **Never Store Private Keys** - Only handle public addresses and tx hashes
2. **Validate Inputs** - Always validate transaction hash format
3. **Use HTTPS** - All API calls must use HTTPS
4. **Token Security** - Store JWT securely using Expo SecureStore
5. **Amount Verification** - Show exact amounts, no rounding
6. **Rate Limiting** - Don't poll too frequently (5s minimum)
7. **Error Messages** - Don't expose sensitive data in errors

### Validation Rules

```typescript
// Transaction hash validation
const validateTxHash = (hash: string, network: CryptoNetwork): boolean => {
  if (network === "tron") {
    return /^[a-fA-F0-9]{64}$/.test(hash);
  } else {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }
};

// Minimum amount validation
const MIN_PAYMENT_USD = 5;
if (amountUsd < MIN_PAYMENT_USD) {
  throw new Error(`Minimum payment amount is $${MIN_PAYMENT_USD}`);
}
```

---

## 📱 UI/UX Best Practices

### Payment Screen Requirements

1. **Clear Amount Display**

   - Show exact crypto amount (e.g., "10.023456 USDT")
   - Show USD equivalent
   - Highlight network fees

2. **Timer Display**

   - Show countdown (30 minutes)
   - Change color when < 5 minutes (red)
   - Auto-refresh on expiration

3. **QR Code**

   - Large, scannable QR code (200x200 minimum)
   - Include wallet address in QR
   - Provide manual copy option

4. **Status Indicators**

   - Pending: 🟡 Yellow/Orange
   - Confirming: 🔵 Blue with progress bar
   - Completed: 🟢 Green with checkmark
   - Failed/Expired: 🔴 Red with error icon

5. **User Guidance**
   - Step-by-step instructions
   - Network fee warnings
   - Support contact option

### Network Selection

```
📱 Tron (TRC-20)
   ⚡ Low Fee (~$1)
   ⏱️ Fast (~1 min)
   ✅ Recommended

📱 Ethereum (ERC-20)
   💰 High Fee (~$5-20)
   ⏱️ Medium (~2-5 min)
   ⚠️ High traffic

📱 BSC (BEP-20)
   💰 Medium Fee (~$0.50)
   ⏱️ Fast (~1 min)
   ✅ Good alternative
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** Payment not detected  
**Solution:** Verify transaction hash is correct, wait for blockchain confirmation

**Issue:** Timer shows wrong time  
**Solution:** Backend might send Unix timestamp instead of ISO string

**Issue:** QR code not scanning  
**Solution:** Ensure good lighting, increase QR size

**Issue:** Polling not updating  
**Solution:** Check token expiration, verify API endpoint

### Debug Logging

Enable debug logs in crypto.service.ts:

```typescript
console.log("💰 Creating payment:", paymentData);
console.log("🔍 Verifying transaction:", txHash);
console.log("📊 Payment status:", status);
console.log("⏰ Time remaining:", timeRemaining);
```

### Backend Logs

Check backend Hangfire dashboard:

```
https://api.wihngo.com/hangfire
```

---

## 📚 Additional Resources

- [Tron Developer Docs](https://developers.tron.network/)
- [Ethereum Developer Docs](https://ethereum.org/developers)
- [BSC Developer Docs](https://docs.bnbchain.org/)
- [React Native QR Code](https://github.com/awesomejerry/react-native-qrcode-svg)
- [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)

---

## 📝 API Response Type Reference

### CryptoPaymentRequest

```typescript
{
  id: string;
  userId: string;
  birdId?: string;
  amountUsd: number;
  amountCrypto: number;
  currency: "USDT" | "USDC" | ...;
  network: "tron" | "ethereum" | "binance-smart-chain" | ...;
  exchangeRate: number;
  walletAddress: string;
  userWalletAddress?: string;
  qrCodeData: string;
  paymentUri: string;
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  status: "pending" | "confirming" | "confirmed" | "completed" | "expired" | "cancelled" | "failed";
  purpose: "premium_subscription" | "donation" | "purchase";
  plan?: "monthly" | "yearly" | "lifetime";
  expiresAt: string; // ISO 8601
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎉 Integration Complete!

Your Wihngo app is now fully integrated with the crypto payment system. Users can:

✅ Select cryptocurrency and network  
✅ Scan QR code or copy wallet address  
✅ Submit transaction hash for verification  
✅ Track confirmation progress in real-time  
✅ Receive premium access automatically

**Happy coding! 🚀**

---

**For questions or issues:**

- Check this documentation
- Review backend API logs
- Test with small amounts first
- Contact backend team for API issues

**Last Updated:** December 11, 2025  
**Maintainer:** Wihngo Development Team
