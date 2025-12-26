# Crypto Payment System - Complete Integration

## Wihngo Mobile App - Documentation Hub

**All documentation for the crypto payment integration**

---

## 📚 Documentation Files

### 1. **CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md** (Main Guide)

👉 **Start here!** Complete integration guide with:

- API endpoints reference
- Payment flow diagrams
- Implementation steps
- Code examples
- Error handling
- Testing checklist
- Security best practices

### 2. **CRYPTO_PAYMENT_QUICK_START.md** (Developer Reference)

Quick reference for developers:

- Common code snippets
- API function usage
- UI component examples
- Utility functions
- Type definitions
- Common use cases

### 3. **CRYPTO_PAYMENT_TESTING.md** (Testing Guide)

Manual testing instructions:

- cURL examples
- Test scripts
- Troubleshooting steps
- Test cases
- Debug tools

---

## 🎯 Quick Links

### For Developers

- **New to crypto payments?** → Start with `CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md`
- **Need code examples?** → Check `CRYPTO_PAYMENT_QUICK_START.md`
- **Testing the API?** → Use `CRYPTO_PAYMENT_TESTING.md`

### For Implementation

1. Read the integration guide
2. Review existing code in `app/crypto-payment.tsx`
3. Test with small amounts
4. Deploy to production

---

## ✅ What's Implemented

### Services

- ✅ `services/crypto.service.ts` - API service layer with all endpoints
- ✅ `services/api-helper.ts` - HTTP client wrapper

### Hooks

- ✅ `hooks/usePaymentStatusPolling.ts` - Auto-polling hook for payment status

### Screens

- ✅ `app/crypto-payment.tsx` - Complete payment flow screen

### Components

- ✅ `components/network-selector.tsx` - Blockchain network selector
- ✅ `components/crypto-currency-selector.tsx` - Currency picker
- ✅ `components/crypto-payment-qr.tsx` - QR code display with timer
- ✅ `components/crypto-payment-status.tsx` - Payment status indicator

### Types

- ✅ `types/crypto.ts` - TypeScript type definitions

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Navigate to Payment

```typescript
import { router } from "expo-router";

router.push({
  pathname: "/crypto-payment",
  params: {
    amount: "9.99",
    birdId: bird.id,
    plan: "monthly",
    purpose: "premium_subscription",
  },
});
```

### Step 2: Done! 🎉

The payment screen handles everything automatically:

- Network selection
- QR code display
- Transaction verification
- Status polling
- Completion handling

---

## 💰 Supported Cryptocurrencies

| Currency | Networks            | Decimals   | Fee            | Status    |
| -------- | ------------------- | ---------- | -------------- | --------- |
| **USDT** | Tron, Ethereum, BSC | 6, 6, 18\* | Low, High, Med | ✅ Active |
| **USDC** | Ethereum, BSC       | 6, 18      | High, Med      | ✅ Active |

**⚠️ Important:** BEP-20 USDT uses 18 decimals, not 6!

---

## 🔄 Payment Flow Overview

```
User Journey:
1. Select "Pay with Crypto"
2. Choose network (Tron/Ethereum/BSC)
3. Review amount
4. Create payment request
5. Scan QR code with wallet
6. Send crypto
7. Submit transaction hash
8. Wait for confirmations (auto-polling)
9. Payment complete! Premium activated ✨
```

**Time:** 1-5 minutes (depending on network)  
**Expiration:** 30 minutes from creation

---

## 📦 API Endpoints Summary

| Endpoint                       | Method | Auth | Purpose                |
| ------------------------------ | ------ | ---- | ---------------------- |
| `/rates`                       | GET    | No   | Get exchange rates     |
| `/wallet/{currency}/{network}` | GET    | No   | Get platform wallet    |
| `/create`                      | POST   | Yes  | Create payment request |
| `/{id}/verify`                 | POST   | Yes  | Verify transaction     |
| `/{id}/check-status`           | POST   | Yes  | Force status check     |
| `/{id}`                        | GET    | Yes  | Get payment details    |
| `/history`                     | GET    | Yes  | Payment history        |
| `/{id}/cancel`                 | POST   | Yes  | Cancel payment         |

**Base URL:** `https://api.wihngo.com/api/payments/crypto`

---

## 🔧 Configuration

### Environment Variables

```typescript
// app.config.ts
export default {
  extra: {
    apiUrl:
      process.env.APP_MODE === "production"
        ? "https://api.wihngo.com/api/"
        : "http://localhost:5000/api/",
  },
};
```

### Minimum Requirements

```typescript
// Backend enforces
const MIN_PAYMENT_USD = 5;
const PAYMENT_EXPIRATION_MINUTES = 30;
const POLLING_INTERVAL_SECONDS = 5;
```

---

## 🎨 UI Components Usage

### Network Selector

```typescript
<NetworkSelector
  networks={["tron", "ethereum", "binance-smart-chain"]}
  selectedNetwork={selectedNetwork}
  onSelect={(network) => setSelectedNetwork(network)}
  currency="USDT"
/>
```

### Payment QR

```typescript
<CryptoPaymentQR
  payment={paymentRequest}
  onExpired={() => handleExpiration()}
/>
```

### Status Display

```typescript
<CryptoPaymentStatus payment={paymentRequest} showDetails={true} />
```

---

## 🛡️ Security Features

✅ **Authentication Required** - All payment endpoints require valid JWT  
✅ **Payment Expiration** - Automatic timeout after 30 minutes  
✅ **Transaction Verification** - Blockchain confirmation required  
✅ **Amount Validation** - Backend validates exact amounts  
✅ **Address Validation** - Format checking for wallet addresses  
✅ **Rate Limiting** - Prevents spam/abuse

---

## 🧪 Testing

### Quick Test

```bash
# Get exchange rate (public endpoint)
curl https://api.wihngo.com/api/payments/crypto/rates/USDT

# Expected: { "currency": "USDT", "usdRate": 0.9998, ... }
```

### Full Test Flow

1. Create payment request
2. Get QR code and wallet address
3. Send crypto from wallet app
4. Submit transaction hash
5. Poll status until completed

**See `CRYPTO_PAYMENT_TESTING.md` for detailed test cases**

---

## 🐛 Debugging

### Enable Logs

```typescript
// Already enabled in crypto.service.ts
console.log("💰 Creating payment:", data);
console.log("🔍 Verifying transaction:", txHash);
console.log("📊 Payment status:", status);
```

### Debug Panel (Dev Mode)

```typescript
{
  __DEV__ && (
    <View>
      <Text>Status: {payment.status}</Text>
      <Text>Polling: {enablePolling ? "ON" : "OFF"}</Text>
      <Text>
        Confirmations: {confirmations}/{requiredConfirmations}
      </Text>
    </View>
  );
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "401 Unauthorized"

**Solution:** Check authentication token, re-login if expired

### Issue: "Transaction not found"

**Solution:** Wait for blockchain confirmation, verify correct network

### Issue: "Payment expired"

**Solution:** Create new payment request

### Issue: Timer shows wrong time

**Solution:** Check backend timestamp format, use `formatTimeRemaining()`

**See `CRYPTO_PAYMENT_TESTING.md` for full troubleshooting guide**

---

## 📈 Production Checklist

Before going live:

- [ ] Test all networks (Tron, Ethereum, BSC)
- [ ] Verify minimum amount ($5) enforced
- [ ] Test payment expiration (30 min)
- [ ] Verify transaction hash validation
- [ ] Test status polling
- [ ] Confirm premium activation
- [ ] Test error handling
- [ ] Review security settings
- [ ] Monitor Hangfire jobs
- [ ] Set up error tracking

---

## 🎓 Learning Resources

### Blockchain Networks

- [Tron Developer Docs](https://developers.tron.network/)
- [Ethereum Developer Docs](https://ethereum.org/developers)
- [BSC Developer Docs](https://docs.bnbchain.org/)

### React Native

- [React Native QR Code](https://github.com/awesomejerry/react-native-qrcode-svg)
- [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

## 📞 Support & Contact

### For Questions

- Review documentation files in this directory
- Check existing code implementation
- Test with small amounts first

### For Issues

- **Frontend:** Check React Native console logs
- **Backend:** Review Hangfire dashboard at `/hangfire`
- **API:** Test endpoints with cURL

### For Updates

- Check backend API version compatibility
- Review changelog for breaking changes
- Update documentation as needed

---

## 🎉 Success!

Your Wihngo app now supports cryptocurrency payments! Users can:

✅ Pay for premium subscriptions with USDT/USDC  
✅ Choose preferred blockchain network  
✅ Scan QR codes for easy payment  
✅ Track transaction confirmations  
✅ Get instant premium activation

**Happy coding! 🚀**

---

## 📝 File Structure

```
wihngo/
├── CRYPTO_PAYMENT_FRONTEND_INTEGRATION.md  ⭐ Main guide
├── CRYPTO_PAYMENT_QUICK_START.md          📖 Quick reference
├── CRYPTO_PAYMENT_TESTING.md              🧪 Testing guide
├── CRYPTO_PAYMENT_README.md               📚 This file
│
├── app/
│   └── crypto-payment.tsx                 💳 Payment screen
│
├── services/
│   └── crypto.service.ts                  🔧 API service
│
├── hooks/
│   └── usePaymentStatusPolling.ts         🔄 Polling hook
│
├── components/
│   ├── crypto-payment-qr.tsx              📱 QR component
│   ├── crypto-payment-status.tsx          📊 Status component
│   ├── network-selector.tsx               🌐 Network picker
│   └── crypto-currency-selector.tsx       💰 Currency picker
│
└── types/
    └── crypto.ts                          📋 Type definitions
```

---

**Last Updated:** December 11, 2025  
**Version:** 1.0  
**Maintainer:** Wihngo Development Team
