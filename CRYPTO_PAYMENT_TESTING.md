# Crypto Payment API Testing Guide

## Manual Testing & Troubleshooting

---

## 🧪 Testing with cURL

### 1. Get Exchange Rates (Public)

```bash
# Get all rates
curl -X GET https://api.wihngo.com/api/payments/crypto/rates

# Get specific rate
curl -X GET https://api.wihngo.com/api/payments/crypto/rates/USDT
```

**Expected Response:**

```json
{
  "currency": "USDT",
  "usdRate": 0.9998,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "source": "CoinGecko"
}
```

---

### 2. Get Platform Wallet (Public)

```bash
# Get Tron wallet for USDT
curl -X GET https://api.wihngo.com/api/payments/crypto/wallet/USDT/tron

# Get Ethereum wallet for USDT
curl -X GET https://api.wihngo.com/api/payments/crypto/wallet/USDT/ethereum

# Get BSC wallet for USDT
curl -X GET https://api.wihngo.com/api/payments/crypto/wallet/USDT/binance-smart-chain
```

**Expected Response:**

```json
{
  "currency": "USDT",
  "network": "tron",
  "address": "TXYZa1b2c3d4e5f6g7h8i9j0...",
  "qrCode": "TXYZa1b2c3d4e5f6g7h8i9j0...",
  "isActive": true
}
```

---

### 3. Create Payment (Authenticated)

```bash
curl -X POST https://api.wihngo.com/api/payments/crypto/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amountUsd": 9.99,
    "currency": "USDT",
    "network": "tron",
    "birdId": "123e4567-e89b-12d3-a456-426614174000",
    "purpose": "premium_subscription",
    "plan": "monthly"
  }'
```

**Expected Response:**

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
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Payment request created successfully"
}
```

---

### 4. Verify Payment (Authenticated)

```bash
curl -X POST https://api.wihngo.com/api/payments/crypto/{PAYMENT_ID}/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "0xabc123def456...",
    "userWalletAddress": "TXYZuser123..."
  }'
```

---

### 5. Check Payment Status (Authenticated)

```bash
# Get current status
curl -X GET https://api.wihngo.com/api/payments/crypto/{PAYMENT_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Force blockchain check
curl -X POST https://api.wihngo.com/api/payments/crypto/{PAYMENT_ID}/check-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 6. Get Payment History (Authenticated)

```bash
curl -X GET https://api.wihngo.com/api/payments/crypto/history?page=1&pageSize=20 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Cancel Payment (Authenticated)

```bash
curl -X POST https://api.wihngo.com/api/payments/crypto/{PAYMENT_ID}/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🧪 Testing in React Native App

### Test Script 1: Create Payment

```typescript
// Add this to a test screen or button handler
const testCreatePayment = async () => {
  try {
    console.log("🧪 Testing payment creation...");

    const response = await createCryptoPayment({
      amountUsd: 9.99,
      currency: "USDT",
      network: "tron",
      birdId: "test-bird-id",
      purpose: "premium_subscription",
      plan: "monthly",
    });

    console.log("✅ Payment created:", {
      id: response.paymentRequest.id,
      walletAddress: response.paymentRequest.walletAddress,
      amountCrypto: response.paymentRequest.amountCrypto,
      expiresAt: response.paymentRequest.expiresAt,
    });

    return response.paymentRequest;
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};
```

### Test Script 2: Verify Payment

```typescript
const testVerifyPayment = async (paymentId: string, txHash: string) => {
  try {
    console.log("🧪 Testing payment verification...");

    const result = await verifyCryptoPayment(paymentId, {
      transactionHash: txHash,
      userWalletAddress: "TXYZuser...",
    });

    console.log("✅ Verification result:", {
      status: result.status,
      confirmations: result.confirmations,
      requiredConfirmations: result.requiredConfirmations,
    });

    return result;
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};
```

### Test Script 3: Poll Status

```typescript
const testPolling = async (paymentId: string) => {
  console.log("🧪 Testing status polling...");

  let attempts = 0;
  const maxAttempts = 12; // 1 minute

  const poll = setInterval(async () => {
    attempts++;

    try {
      const status = await checkPaymentStatus(paymentId);
      console.log(`🔄 Poll ${attempts}/${maxAttempts}:`, {
        status: status.status,
        confirmations: status.confirmations,
      });

      if (status.status === "completed" || attempts >= maxAttempts) {
        clearInterval(poll);
        console.log("✅ Polling complete");
      }
    } catch (error) {
      console.error("❌ Poll failed:", error);
      clearInterval(poll);
    }
  }, 5000); // Every 5 seconds
};
```

---

## 🔍 Troubleshooting

### Issue 1: "401 Unauthorized"

**Cause:** Invalid or expired JWT token

**Solution:**

```typescript
// Check token
import { useAuth } from "@/contexts/auth-context";

const { token, isAuthenticated } = useAuth();

if (!isAuthenticated || !token) {
  console.error("Not authenticated");
  // Re-login
}
```

---

### Issue 2: "Exchange rate not available"

**Cause:** Backend can't fetch crypto rates

**Solution:**

- Check backend logs
- Verify CoinGecko API is working
- Use cached rate temporarily

---

### Issue 3: "No wallet configured"

**Cause:** Platform wallet not set up for network

**Solution:**

- Contact backend admin
- Check appsettings.json for wallet addresses

---

### Issue 4: "Transaction not found"

**Cause:**

- Invalid transaction hash
- Transaction not yet confirmed on blockchain
- Wrong network selected

**Solution:**

```typescript
// Validate TX hash format
const validateTxHash = (hash: string, network: string) => {
  if (network === "tron") {
    return /^[a-fA-F0-9]{64}$/.test(hash);
  } else {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }
};

// Wait for blockchain confirmation
// Then retry verification
```

---

### Issue 5: "Incorrect amount"

**Cause:** User sent wrong amount

**Solution:**

- Display exact amount clearly: `{payment.amountCrypto} USDT`
- Warn about network fees
- User needs to send refund transaction

---

### Issue 6: Timer shows wrong time

**Cause:** Backend sends wrong timestamp format

**Solution:**

```typescript
// Check formatTimeRemaining() function
// It has fallback logic for wrong formats
import { formatTimeRemaining } from "@/services/crypto.service";

const remaining = formatTimeRemaining(payment.expiresAt);
console.log("Time remaining:", remaining);
```

---

## 📊 Test Cases

### Test Case 1: Basic Payment Flow

```
1. Create payment with $9.99 USDT on Tron
2. Verify payment request returned
3. Check wallet address is valid (starts with 'T')
4. Check amount is calculated correctly
5. Verify QR code data is present
6. Check expiration is ~30 minutes from now
```

### Test Case 2: Network Switching

```
1. Create payment with Tron network
2. Note wallet address
3. Create payment with Ethereum network
4. Verify wallet address changed (now starts with '0x')
5. Verify amountCrypto recalculated (rate may differ)
```

### Test Case 3: Transaction Verification

```
1. Create payment
2. Send crypto from wallet app (use testnet!)
3. Copy transaction hash
4. Call verify endpoint
5. Verify status changes to 'confirming'
6. Poll status until 'completed'
```

### Test Case 4: Payment Expiration

```
1. Create payment
2. Wait 30 minutes (or modify expiration in backend)
3. Verify status changes to 'expired'
4. Verify cannot verify expired payment
5. User must create new payment
```

### Test Case 5: Error Handling

```
1. Create payment with amount < $5
   Expected: Error "Minimum payment amount is $5"

2. Verify with invalid TX hash
   Expected: Error "Transaction not found"

3. Create payment without auth token
   Expected: 401 Unauthorized

4. Verify expired payment
   Expected: Error "Payment already expired"
```

---

## 🎯 Testing Checklist

### Backend Tests

- [ ] Exchange rates API working
- [ ] Platform wallets configured
- [ ] Create payment endpoint working
- [ ] Verify payment endpoint working
- [ ] Status polling endpoint working
- [ ] Payment history endpoint working
- [ ] Hangfire background jobs running

### Frontend Tests

- [ ] Navigation to payment screen
- [ ] Network selection displays correctly
- [ ] QR code renders properly
- [ ] Timer counts down
- [ ] Copy address to clipboard works
- [ ] Transaction hash input validation
- [ ] Status polling updates UI
- [ ] Confirmation progress displays
- [ ] Completion screen shows
- [ ] Error handling works

### Integration Tests

- [ ] Create payment → Verify → Poll → Complete
- [ ] Payment expiration handling
- [ ] Network switching
- [ ] Multiple payment attempts
- [ ] Payment history display

---

## 🛠️ Development Tools

### Console Logging

Enable verbose logging:

```typescript
// In crypto.service.ts
console.log("💰 Creating payment:", data);
console.log("🔍 Verifying transaction:", txHash);
console.log("📊 Payment status:", status);
console.log("⏰ Time calculation:", timeData);
```

### React Native Debugger

```typescript
// Add debug panel to payment screen
{
  __DEV__ && (
    <View style={styles.debugPanel}>
      <Text>Payment ID: {payment?.id}</Text>
      <Text>Status: {payment?.status}</Text>
      <Text>Polling: {enablePolling ? "ON" : "OFF"}</Text>
      <Text>
        Confirmations: {confirmations}/{requiredConfirmations}
      </Text>
    </View>
  );
}
```

### Network Inspector

Monitor API calls in Chrome DevTools:

```bash
# Run app with remote debugging
expo start --tunnel

# Open Chrome DevTools
# Network tab → Filter: XHR
# Watch API requests
```

---

## 📝 Test Data

### Valid Test Transaction Hashes

**Tron (TRC-20):**

```
64 hex characters (no 0x prefix)
Example: a1b2c3d4e5f6789012345678901234567890123456789012345678901234
```

**Ethereum (ERC-20):**

```
0x + 64 hex characters
Example: 0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234
```

**BSC (BEP-20):**

```
0x + 64 hex characters
Example: 0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234
```

### Test Wallet Addresses

**Tron:**

```
TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
(34 characters, starts with T)
```

**Ethereum/BSC:**

```
0x1234567890123456789012345678901234567890
(42 characters, starts with 0x)
```

---

## 🎉 Success Criteria

Payment flow is successful when:

1. ✅ User can create payment
2. ✅ QR code displays correctly
3. ✅ Timer counts down accurately
4. ✅ Transaction verification works
5. ✅ Status updates in real-time
6. ✅ Confirmation progress shows
7. ✅ Payment completes successfully
8. ✅ Premium access is granted

---

## 📞 Support

**Backend Issues:**

- Check Hangfire dashboard: `/hangfire`
- Review server logs
- Verify wallet addresses in config

**Frontend Issues:**

- Check React Native console
- Enable debug logging
- Test with small amounts first

---

**Last Updated:** December 11, 2025  
**Happy testing! 🧪**
