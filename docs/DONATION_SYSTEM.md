# Donation/Support System - Implementation Guide

## Overview

Complete donation and support UX system for Wihngo mobile app with full lifecycle from invoice creation to receipt download. Supports **PayPal**, **USDC/EURC on Solana**, and **USDC/EURC on Base**.

---

## Features

✅ **Multi-Payment Support**: PayPal, Solana (USDC/EURC), Base (USDC/EURC)  
✅ **Real-time Updates**: SSE-based invoice status monitoring  
✅ **Receipt System**: Automatic PDF receipt generation and download  
✅ **Wallet Integration**: Solana Pay + WalletConnect for Base/EVM  
✅ **Legal Compliance**: Clear "not a charitable donation" messaging  
✅ **Mobile-First UX**: Native React Native screens with QR codes  
✅ **Push Notifications**: Receipt-ready notifications via Expo  
✅ **Error Handling**: Exponential backoff, manual payment reporting

---

## Installation

### 1. Install Required Dependencies

```bash
npm install --save \
  expo-file-system \
  expo-sharing \
  react-native-qrcode-svg \
  react-native-svg
```

### 2. Optional Dependencies (for production)

For full WalletConnect v2 support:

```bash
npm install --save \
  @walletconnect/core \
  @walletconnect/react-native-compat \
  @walletconnect/utils
```

For SSE streaming (alternative to fetch-based):

```bash
npm install --save react-native-sse
```

---

## Project Structure

```
services/
├── invoice.service.ts           # Invoice CRUD operations
├── wallet.service.ts            # Solana Pay + Base/EVM wallet integration
├── sse.service.ts              # Server-sent events for real-time updates
├── donation.service.ts         # High-level donation flow orchestration
└── donation-notification.service.ts  # Push notification handling

app/donation/
├── index.tsx                   # DonationScreen: bird selection, amount input
├── checkout.tsx                # CheckoutScreen: invoice display, payment URIs
├── waiting.tsx                 # WaitingForPaymentScreen: status monitoring
├── result.tsx                  # PaymentResultScreen: confirmation + receipt
└── history.tsx                 # HistoryScreen: invoice list with downloads

types/
└── invoice.ts                  # TypeScript types for invoices

hooks/
└── use-paypal-deep-link.ts    # PayPal redirect handling

__tests__/
└── donation.test.ts           # Unit tests for payment helpers
```

---

## Environment Variables

Add to your `app.config.ts` or `.env`:

```typescript
export default {
  expo: {
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
      walletConnectProjectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID,
    },
  },
};
```

Create `.env`:

```bash
EXPO_PUBLIC_API_URL=https://api.wihngo.com/api
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

---

## Backend API Requirements

Your backend must implement these endpoints:

### Invoice Management

```typescript
POST /api/v1/invoices
// Create new invoice
// Body: { bird_id?, amount_fiat, fiat_currency, payment_method }
// Returns: { invoice, payment_uri?, qr_code_data? }

GET /api/v1/invoices/:id
// Get invoice details

GET /api/v1/invoices/:id/status
// Get invoice status (optimized endpoint)

GET /api/v1/invoices
// List user's invoices
// Query: ?page=1&limit=20

GET /api/v1/invoices/:id/download
// Download receipt PDF (requires issued_pdf_url)

POST /api/v1/invoices/:id/cancel
// Cancel pending invoice

GET /api/v1/invoices/:id/events
// SSE endpoint for real-time updates
// Returns: text/event-stream
```

### Payment Submission

```typescript
POST / api / v1 / payments / submit;
// Manually submit transaction hash
// Body: { invoice_id, transaction_hash, payer_address, network, token_symbol }
```

### Push Notifications

```typescript
POST / api / v1 / notifications / register - donation - device;
// Register Expo push token
// Body: { expo_push_token, platform }
```

---

## Usage

### 1. Navigate to Donation Screen

```typescript
import { useRouter } from "expo-router";

const router = useRouter();

// General donation
router.push("/donation");

// Bird-specific donation
router.push({
  pathname: "/donation",
  params: { birdId: "bird-123" },
});
```

### 2. Complete Flow

```
User Flow:
1. DonationScreen → Select bird (optional) + amount + payment method
2. CheckoutScreen → Create invoice, show payment URIs + expiration timer
3. WaitingForPaymentScreen → Open wallet / copy URI / show QR
4. PaymentResultScreen → Show confirmation + download receipt
5. HistoryScreen → View all invoices + download receipts
```

### 3. Deep Link Configuration

Add to `app.json`:

```json
{
  "expo": {
    "scheme": "wihngo",
    "ios": {
      "associatedDomains": ["applinks:wihngo.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "wihngo",
              "host": "donation"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 4. Initialize Deep Link Handler

In your `app/_layout.tsx`:

```typescript
import { usePayPalDeepLink } from "@/hooks/use-paypal-deep-link";

function RootLayout() {
  usePayPalDeepLink(); // Initialize PayPal redirect handling

  // ... rest of layout
}
```

### 5. Register for Push Notifications

```typescript
import { registerForDonationNotifications } from "@/services/donation-notification.service";

// On app start or user opt-in
await registerForDonationNotifications();
```

---

## SSE Event Handling

The app subscribes to invoice events via SSE:

```typescript
// Automatic in WaitingForPaymentScreen
const unsubscribe = await sseService.subscribeToInvoice(invoiceId, (event) => {
  console.log("Event:", event.event_type);

  switch (event.event_type) {
    case "PAYMENT_DETECTED":
      // Show "Payment detected, waiting for confirmation"
      break;
    case "PAYMENT_CONFIRMED":
      // Update status to CONFIRMED
      break;
    case "INVOICE_ISSUED":
      // Receipt is ready! Show download button
      break;
  }
});

// Cleanup
unsubscribe();
```

---

## Testing

### Run Unit Tests

```bash
npm test -- donation.test.ts
```

### Mock Backend for Development

Create a mock server or use `json-server`:

```bash
npm install -g json-server

# Create db.json with mock data
json-server --watch db.json --port 5000
```

Mock invoice response:

```json
{
  "invoices": [
    {
      "id": "inv-123",
      "invoice_number": "WIH-001",
      "invoice_date": "2025-12-12",
      "user_id": "user-1",
      "amount_fiat": 10,
      "fiat_currency": "USD",
      "payment_method": "solana_usdc",
      "payment_status": "PENDING_PAYMENT",
      "expected_token_amount": 10,
      "token_symbol": "USDC",
      "network": "solana",
      "merchant_address": "EjDzZ1qR8ckYzZGpTWqXj1xWHzLqvMdVhXmNdJ4FsN8v",
      "solana_pay_uri": "solana:...",
      "expires_at": "2025-12-12T12:15:00Z",
      "created_at": "2025-12-12T12:00:00Z",
      "updated_at": "2025-12-12T12:00:00Z"
    }
  ]
}
```

---

## Wallet Integration Details

### Solana Pay

Automatically builds URIs:

```
solana:<merchant_address>?
  amount=<token_amount>&
  spl-token=<token_mint>&
  reference=<invoice_id>&
  label=Wihngo Support&
  message=Invoice WIH-001
```

**Token Mints (Mainnet)**:

- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- EURC: `HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr`

### Base/EVM (WalletConnect)

Builds ERC-20 transfer:

```typescript
{
  to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract
  data: "0xa9059cbb000000000000000000000000<recipient>000000000000000000000000000000000000000000000000<amount_hex>",
  value: "0x0"
}
```

**Token Contracts (Base Mainnet)**:

- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- EURC: `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42`

---

## Legal Messaging

All screens display prominent legal notice:

> ⚠️ **Wihngo is a for-profit company.** Payments are contributions/support and are **not charitable donations**. Unless we explicitly state otherwise, payments are not tax deductible.

This appears on:

- DonationScreen (selection)
- CheckoutScreen (before payment)
- PaymentResultScreen (after confirmation)

---

## Error Handling

### Network Errors

All API calls use exponential backoff:

```typescript
// Implemented in api-helper.ts
const response = await apiRequest({
  endpoint: "/v1/invoices",
  method: "POST",
  body: data,
  retries: 3, // Automatic retry with backoff
});
```

### Payment Issues

If wrong chain/token sent:

1. User reports transaction via "Report Payment Manually"
2. App submits `POST /api/v1/payments/submit` with txHash
3. Backend manually reconciles or prompts support contact

### Receipt Not Available

If `issued_pdf_url` is `null`:

- Show "⏳ Receipt being generated" message
- Push notification sent when ready
- User can re-download from history

---

## Troubleshooting

### SSE Not Working

- Verify backend sends `Content-Type: text/event-stream`
- Check CORS headers allow EventSource
- Use polling fallback: `pollInvoiceStatus()` in `invoice.service.ts`

### WalletConnect Issues

- Ensure `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Install full WalletConnect packages (see Installation)
- For iOS: Add `Linking.canOpenURL()` whitelist

### Receipt Download Fails

- Check `expo-file-system` permissions
- Verify `expo-sharing` is available: `await Sharing.isAvailableAsync()`
- On Android, request WRITE_EXTERNAL_STORAGE permission

---

## Production Checklist

- [ ] Configure production API URL in `.env`
- [ ] Add WalletConnect Project ID
- [ ] Set up deep link domain association
- [ ] Test PayPal redirect flow with real PayPal account
- [ ] Test Solana Pay with Phantom/Solflare on device
- [ ] Test Base payments with MetaMask/Coinbase Wallet
- [ ] Verify push notifications on iOS and Android
- [ ] Test receipt download and sharing
- [ ] Add analytics events for each step
- [ ] Implement proper error logging (Sentry, etc.)
- [ ] Add rate limiting handling
- [ ] Test invoice expiration flow
- [ ] Verify legal messaging on all screens

---

## Support

For issues or questions:

- **Backend API**: Ensure all endpoints match spec above
- **Wallet Integration**: Check console logs for detailed errors
- **SSE Connection**: Monitor network tab in debugger
- **Receipt Generation**: Verify backend sets `issued_pdf_url` after confirmation

Contact: support@wihngo.com

---

## License

Proprietary - Wihngo © 2025
