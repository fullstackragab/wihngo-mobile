# Donation System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

New packages added:

- `expo-file-system` - Receipt PDF downloads
- `expo-sharing` - Share downloaded receipts

### 2. Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

### 3. Configure Deep Links

Update `app.json`:

```json
{
  "expo": {
    "scheme": "wihngo",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "wihngo", "host": "donation" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 4. Start Development Server

```bash
npm start
```

---

## 📱 Testing the Flow

### Option A: With Mock Backend

1. **Start mock server** (requires backend running on `localhost:5000`)

2. **Navigate to donation screen**:

   ```typescript
   // From any screen
   router.push("/donation");
   ```

3. **Test flow**:
   - Select amount: $10
   - Choose payment method: Solana USDC
   - Click "Continue to Payment"
   - Click "Open Wallet" (will show error if no wallet app)
   - Click "Copy Address" to copy merchant address
   - Click "Show QR" to display QR code

### Option B: Full Integration Test

1. **Backend must support**:

   - `POST /api/v1/invoices` - Create invoice
   - `GET /api/v1/invoices/:id/status` - Get status
   - `GET /api/v1/invoices/:id/events` - SSE stream
   - `GET /api/v1/invoices/:id/download` - PDF download

2. **Test with real wallet**:
   - Install Phantom (Solana) or MetaMask (Base)
   - Create test invoice
   - Send test transaction
   - Verify receipt generation

---

## 🎯 Key Files to Review

| File                          | Purpose                    |
| ----------------------------- | -------------------------- |
| `services/invoice.service.ts` | API calls for invoices     |
| `services/wallet.service.ts`  | Solana Pay + WalletConnect |
| `services/sse.service.ts`     | Real-time updates          |
| `app/donation/index.tsx`      | Amount selection screen    |
| `app/donation/checkout.tsx`   | Payment display            |
| `app/donation/waiting.tsx`    | Status monitoring          |
| `app/donation/result.tsx`     | Receipt download           |
| `types/invoice.ts`            | TypeScript types           |

---

## 🧪 Run Tests

```bash
npm test -- donation.test.ts
```

---

## 🔧 Troubleshooting

### "Cannot read property 'data' of undefined" in QRCode

**Fix**: Ensure `react-native-qrcode-svg` and `react-native-svg` are installed:

```bash
npm install react-native-qrcode-svg react-native-svg
```

### SSE connection fails

**Workaround**: Use polling instead. In `waiting.tsx`, replace SSE subscription with:

```typescript
import { pollInvoiceStatus } from "@/services/invoice.service";

pollInvoiceStatus(
  invoiceId,
  (invoice) => {
    setInvoice(invoice);
  },
  60,
  2000
);
```

### Receipt download fails on Android

**Fix**: Add permissions to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    }
  }
}
```

### WalletConnect not working

**Install full packages**:

```bash
npm install @walletconnect/core @walletconnect/react-native-compat
```

Then update `wallet.service.ts` to use real WalletConnect client (see commented code).

---

## 📚 Next Steps

1. ✅ Read full documentation: `docs/DONATION_SYSTEM.md`
2. ✅ Configure backend endpoints
3. ✅ Test with real wallets on device
4. ✅ Set up push notifications
5. ✅ Add analytics tracking
6. ✅ Deploy to production

---

## 🆘 Support

- **Documentation**: `docs/DONATION_SYSTEM.md`
- **API Spec**: See "Backend API Requirements" section
- **Issues**: Check console logs for detailed errors
- **Contact**: support@wihngo.com

---

## ✅ Feature Checklist

- [x] Multi-payment support (PayPal, Solana, Base)
- [x] Invoice creation and tracking
- [x] Real-time SSE updates
- [x] Solana Pay URI generation
- [x] Base/EVM transfer payloads
- [x] QR code display
- [x] Receipt PDF download
- [x] Payment history list
- [x] Legal compliance messaging
- [x] Deep link handling (PayPal)
- [x] Push notifications
- [x] Error handling with retries
- [x] Manual payment reporting
- [x] Unit tests

---

**Ready to accept donations! 🎉**
