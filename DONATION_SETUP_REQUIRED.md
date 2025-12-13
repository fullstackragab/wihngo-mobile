# Donation System - Setup Required

## What I Need From You

### 1. ✅ Reown Project ID (COMPLETE)

Reown AppKit integration is complete with project ID: `8842071420a1989692bf6193ba936f15`

**What's Integrated:**

- Reown AppKit core packages installed
- EVM/Base wallet support via Ethers adapter
- Solana wallet support with Phantom & Solflare
- Wallet modal in app layout
- Donation screens updated
- Environment configured

### 2. Backend API Implementation

The following endpoints need to be implemented on your backend:

#### Invoice Endpoints

- `POST /api/v1/invoices` - Create invoice
- `GET /api/v1/invoices/:invoiceId` - Get invoice details
- `GET /api/v1/invoices` - List user's invoices
- `POST /api/v1/payments/submit` - Submit payment proof
- `GET /api/v1/invoices/:invoiceId/receipt` - Download receipt PDF
- `PUT /api/v1/invoices/:invoiceId/cancel` - Cancel invoice

#### SSE Endpoint

- `GET /api/v1/invoices/:invoiceId/events` - Server-Sent Events for real-time status

#### Notification Endpoint (Optional)

- `POST /api/v1/notifications/register-donation-device` - Register push token

### 3. Test the System

Once you have the WalletConnect Project ID and backend ready:

```bash
# Start the app
npm start
```

Navigate to a bird profile and look for the donation button to test the flow.

## What's Already Done

✅ All donation screens created (amount, checkout, waiting, result, history)
✅ Payment methods: PayPal, Solana USDC/EURC, Base USDC/EURC
✅ Real-time invoice monitoring via SSE
✅ Receipt download and sharing
✅ Deep link handling for PayPal returns
✅ Push notification setup
✅ Routes registered in app/\_layout.tsx
✅ TypeScript types and services
✅ Error handling and loading states

## File Structure

```
app/donation/
  ├── index.tsx          # Amount selection
  ├── checkout.tsx       # Invoice display + timer
  ├── waiting.tsx        # Payment monitoring
  ├── result.tsx         # Success/failure + receipt
  └── history.tsx        # Transaction history

services/
  ├── invoice.service.ts              # CRUD operations
  ├── wallet.service.ts               # Solana/Base payment URIs
  ├── sse.service.ts                  # Real-time events
  ├── donation.service.ts             # Orchestration
  └── donation-notification.service.ts # Push notifications

hooks/
  └── use-paypal-deep-link.ts         # PayPal redirect handler

types/
  └── invoice.ts                      # TypeScript definitions
```

## Questions?

Ask me if you need clarification on any backend API requirements.
