# Cryptocurrency Payment Implementation Guide

## Overview

This guide covers the complete cryptocurrency payment system implemented in the WihNgo app. Users can now pay for premium subscriptions and make donations using Bitcoin, Ethereum, USDT, USDC, BNB, Solana, and Dogecoin.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Backend Requirements](#backend-requirements)
6. [Supported Cryptocurrencies](#supported-cryptocurrencies)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)

## Features

### ✅ Supported Features

- **Multi-Currency Support**: BTC, ETH, USDT, USDC, BNB, SOL, DOGE
- **Multi-Network Support**: Bitcoin, Ethereum, BSC, Polygon, Tron, Solana
- **Real-time Exchange Rates**: Live crypto-to-USD conversion
- **QR Code Payments**: Easy scanning for mobile wallets
- **Payment Tracking**: Real-time transaction monitoring
- **Confirmation Tracking**: Blockchain confirmation progress
- **Payment History**: Complete transaction history
- **Saved Wallets**: Save frequently used wallet addresses
- **Payment Expiration**: Automatic timeout for stale payment requests
- **Status Updates**: Real-time payment status polling

## Architecture

### File Structure

```
types/
  ├── crypto.ts                          # Crypto payment type definitions

services/
  ├── crypto.service.ts                  # Crypto payment service layer

components/
  ├── crypto-currency-selector.tsx       # Currency selection UI
  ├── crypto-payment-qr.tsx              # QR code display & payment info
  ├── crypto-payment-status.tsx          # Payment status indicator
  ├── network-selector.tsx               # Blockchain network selector
  └── premium-payment-options.tsx        # Payment method selector

app/
  ├── crypto-payment.tsx                 # Main crypto payment screen
  └── payment-methods.tsx                # Payment methods management (updated)
```

### Data Flow

1. **Payment Initiation**

   - User selects premium plan
   - User chooses cryptocurrency payment option
   - User selects currency and network

2. **Payment Creation**

   - App fetches current exchange rates
   - Calculates crypto amount from USD
   - Creates payment request via API
   - Receives payment address and QR code

3. **Payment Execution**

   - User sends crypto to provided address
   - Transaction broadcast to blockchain
   - App polls for transaction detection

4. **Confirmation**
   - Transaction detected on blockchain
   - Confirmations tracked in real-time
   - Payment completed after required confirmations
   - Premium features activated

## Setup

### 1. Install Dependencies

```bash
npm install expo-clipboard react-native-svg react-native-qrcode-svg
```

Or with yarn:

```bash
yarn add expo-clipboard react-native-svg react-native-qrcode-svg
```

### 2. Update Premium Types

The `PremiumProvider` type has been updated to include `"crypto"`:

```typescript
export type PremiumProvider = "stripe" | "apple" | "google" | "crypto";
```

### 3. Import Required Services

In your components:

```typescript
import {
  createCryptoPayment,
  getCryptoExchangeRate,
  pollPaymentStatus,
} from "@/services/crypto.service";
```

## Usage

### Basic Payment Flow

```typescript
import { router } from "expo-router";

// Navigate to crypto payment screen
router.push({
  pathname: "/crypto-payment",
  params: {
    birdId: "bird-123",
    plan: "monthly",
    amount: "9.99",
    purpose: "premium_subscription",
  },
});
```

### Creating a Payment Request

```typescript
import { createCryptoPayment } from "@/services/crypto.service";

const payment = await createCryptoPayment({
  birdId: "bird-123",
  amountUsd: 9.99,
  currency: "BTC",
  network: "bitcoin",
  purpose: "premium_subscription",
  plan: "monthly",
});

// payment.paymentRequest contains:
// - walletAddress: Where to send payment
// - amountCrypto: Amount in crypto
// - qrCodeData: QR code string
// - paymentUri: Payment URI for wallets
// - expiresAt: Expiration timestamp
```

### Polling for Payment Status

```typescript
import { pollPaymentStatus } from "@/services/crypto.service";

const interval = setInterval(async () => {
  const updated = await pollPaymentStatus(paymentId);

  if (updated.status === "completed") {
    clearInterval(interval);
    // Payment successful!
  }
}, 5000); // Poll every 5 seconds
```

### Display Payment QR Code

```typescript
import CryptoPaymentQR from "@/components/crypto-payment-qr";

<CryptoPaymentQR
  payment={paymentRequest}
  onExpired={() => {
    // Handle payment expiration
  }}
/>;
```

### Show Payment Status

```typescript
import CryptoPaymentStatus from "@/components/crypto-payment-status";

<CryptoPaymentStatus payment={paymentRequest} showDetails={true} />;
```

## Backend Requirements

Your backend API must implement the following endpoints:

### 1. Create Payment Request

```
POST /payments/crypto/create
Body: {
  birdId?: string,
  amountUsd: number,
  currency: string,
  network: string,
  purpose: string,
  plan?: string
}
Response: {
  paymentRequest: CryptoPaymentRequest,
  message: string
}
```

### 2. Get Payment Status

```
GET /payments/crypto/:paymentId
Response: CryptoPaymentRequest
```

### 3. Verify Payment

```
POST /payments/crypto/:paymentId/verify
Body: {
  transactionHash: string,
  userWalletAddress?: string
}
Response: CryptoPaymentRequest
```

### 4. Get Exchange Rates

```
GET /payments/crypto/rates
Response: CryptoExchangeRate[]

GET /payments/crypto/rates/:currency
Response: CryptoExchangeRate
```

### 5. Get Wallet Info

```
GET /payments/crypto/wallet/:currency/:network
Response: CryptoWalletInfo
```

### 6. Payment History

```
GET /payments/crypto/history?page=1&pageSize=20
Response: CryptoPaymentHistory
```

### 7. Saved Wallets Management

```
GET /payments/crypto/wallets
POST /payments/crypto/wallets
DELETE /payments/crypto/wallets/:walletId
PATCH /payments/crypto/wallets/:walletId/default
```

## Supported Cryptocurrencies

### Bitcoin (BTC)

- **Network**: Bitcoin
- **Min Amount**: $10
- **Confirmations**: 2
- **Estimated Time**: 10-30 minutes

### Ethereum (ETH)

- **Network**: Ethereum
- **Min Amount**: $5
- **Confirmations**: 12
- **Estimated Time**: 2-5 minutes

### Tether (USDT)

- **Networks**: Ethereum (ERC-20), Tron (TRC-20), BSC (BEP-20)
- **Min Amount**: $5
- **Confirmations**: 12 (varies by network)
- **Estimated Time**: 1-5 minutes

### USD Coin (USDC)

- **Networks**: Ethereum, Polygon, BSC
- **Min Amount**: $5
- **Confirmations**: 12 (varies by network)
- **Estimated Time**: 1-5 minutes

### Binance Coin (BNB)

- **Network**: Binance Smart Chain
- **Min Amount**: $5
- **Confirmations**: 15
- **Estimated Time**: 1-2 minutes

### Solana (SOL)

- **Network**: Solana
- **Min Amount**: $5
- **Confirmations**: 32
- **Estimated Time**: 30-60 seconds

### Dogecoin (DOGE)

- **Network**: Bitcoin (Dogecoin)
- **Min Amount**: $10
- **Confirmations**: 6
- **Estimated Time**: 5-15 minutes

## Security Considerations

### 1. Address Validation

Always validate wallet addresses before creating payments:

```typescript
import { validateWalletAddress } from "@/services/crypto.service";

const isValid = validateWalletAddress(address, "BTC");
```

### 2. Amount Verification

Users should verify the exact amount before sending:

- Display amount in both crypto and USD
- Show current exchange rate
- Highlight any discrepancies

### 3. Network Confirmation

Ensure users select the correct network:

- Multiple warnings for incorrect network
- Clear network labels
- Display network fees

### 4. Payment Expiration

All payment requests expire after 30 minutes (configurable):

- Prevents stale exchange rates
- Protects against price volatility
- Auto-cleanup of old requests

### 5. Transaction Verification

Backend should verify:

- Transaction exists on blockchain
- Correct amount sent
- Sent to correct address
- Sufficient confirmations
- No double-spending

### 6. Rate Limiting

Implement rate limiting for:

- Payment creation
- Status polling
- Exchange rate requests

## Testing

### Unit Testing

Test crypto service utilities:

```typescript
import {
  formatCryptoAmount,
  calculateCryptoAmount,
  validateWalletAddress,
} from "@/services/crypto.service";

// Test amount formatting
expect(formatCryptoAmount(0.00012345, "BTC")).toBe("0.00012345");
expect(formatCryptoAmount(1.23456789, "ETH")).toBe("1.234568");

// Test amount calculation
expect(calculateCryptoAmount(100, 50000)).toBe(0.002); // $100 at $50k/BTC

// Test address validation
expect(
  validateWalletAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "BTC")
).toBe(true);
expect(
  validateWalletAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "ETH")
).toBe(false);
```

### Integration Testing

Test payment flow:

```typescript
// 1. Create payment
const payment = await createCryptoPayment({
  amountUsd: 10,
  currency: "BTC",
  network: "bitcoin",
  purpose: "premium_subscription",
});

expect(payment.paymentRequest.amountUsd).toBe(10);
expect(payment.paymentRequest.currency).toBe("BTC");

// 2. Poll for status
const status = await pollPaymentStatus(payment.paymentRequest.id);
expect(status.status).toBe("pending");

// 3. Verify payment
const verified = await verifyCryptoPayment(payment.paymentRequest.id, {
  transactionHash: "0x...",
});
expect(verified.status).toBe("confirming");
```

### Manual Testing Checklist

- [ ] Select different cryptocurrencies
- [ ] Select different networks (for multi-network coins)
- [ ] Verify QR code generation
- [ ] Copy address to clipboard
- [ ] Test payment expiration
- [ ] Test status updates
- [ ] Verify confirmation progress
- [ ] Test saved wallets
- [ ] Test payment history
- [ ] Handle errors gracefully

## Best Practices

1. **Always show exchange rates**: Users need to see the current rate being used
2. **Clear expiration warnings**: Show countdown timer for payment window
3. **Network warnings**: Multiple confirmations about selected network
4. **Amount precision**: Display full crypto amount (not rounded)
5. **Transaction links**: Provide blockchain explorer links
6. **Error handling**: Clear error messages for all failure cases
7. **Loading states**: Show loading indicators during API calls
8. **Offline handling**: Detect and handle network issues
9. **Rate updates**: Refresh exchange rates periodically
10. **Confirmation UX**: Clear progress indicator for confirmations

## Common Issues & Solutions

### Issue: QR code not displaying

**Solution**: Ensure `react-native-svg` and `react-native-qrcode-svg` are installed

### Issue: Address validation failing

**Solution**: Update regex patterns in `validateWalletAddress` function

### Issue: Payment status not updating

**Solution**: Check polling interval is active and API is responding

### Issue: Incorrect crypto amount

**Solution**: Verify exchange rate is current and calculation is correct

### Issue: Network mismatch

**Solution**: Implement strict network validation on backend

## Future Enhancements

- [ ] Add more cryptocurrencies (XRP, ADA, MATIC, etc.)
- [ ] Lightning Network support for Bitcoin
- [ ] Crypto wallet integration (WalletConnect)
- [ ] Partial payment support
- [ ] Automatic refunds for overpayment
- [ ] Multi-signature wallet support
- [ ] Hardware wallet support
- [ ] Payment scheduling/recurring payments
- [ ] Discount for crypto payments
- [ ] Crypto rewards program

## Support

For issues or questions about the crypto payment implementation:

1. Check this documentation first
2. Review the code comments in service and component files
3. Check backend API logs for payment processing issues
4. Contact the development team

## License

This implementation is part of the WihNgo app and follows the app's license terms.
