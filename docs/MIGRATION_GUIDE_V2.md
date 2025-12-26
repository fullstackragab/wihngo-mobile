# 🔄 Quick Migration Guide - Crypto Payment v2.0

**For developers updating existing crypto payment implementations**

---

## ⚡ Quick Changes Required

### 1. Update Import Statements

**Before:**

```typescript
import { CryptoCurrency, CryptoNetwork } from "@/types/crypto";
// Uses old types that included BTC, SOL, etc.
```

**After:**

```typescript
import {
  CryptoCurrency,
  CryptoNetwork,
  VALID_COMBINATIONS,
} from "@/types/crypto";
import { isValidCombination } from "@/types/payment";
// Now restricted to: USDT, USDC, ETH, BNB
// Networks: tron, ethereum, binance-smart-chain
```

---

### 2. Replace Payment Method Lists

**Before:**

```typescript
const currencies = ["BTC", "ETH", "USDT", "USDC", "SOL"];
```

**After:**

```typescript
import {
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
} from "@/config/paymentMethods";

const paymentMethods = getEnabledPaymentMethods();
// Returns 7 pre-configured payment options
```

---

### 3. Update Payment Creation

**Before:**

```typescript
const payment = await createCryptoPayment({
  amountUsd: 10,
  currency: "BTC", // ❌ No longer supported
  network: "bitcoin",
  purpose: "premium_subscription",
});
```

**After:**

```typescript
import { isValidCombination } from "@/types/payment";

// Validate first
if (!isValidCombination("USDT", "tron")) {
  throw new Error("Invalid combination");
}

const payment = await createCryptoPayment({
  amountUsd: 10,
  currency: "USDT", // ✅ Supported
  network: "tron", // ✅ Lowest fees
  purpose: "premium_subscription",
});
```

---

### 4. Replace UI Components

**Before:**

```typescript
// Custom currency selector
<CurrencySelector currencies={["BTC", "ETH", "SOL"]} onSelect={handleSelect} />
```

**After:**

```typescript
import PaymentMethodSelector from "@/components/payment-method-selector";

<PaymentMethodSelector
  selectedMethodId={selectedMethod?.id}
  onSelect={handleMethodSelect}
/>;
```

---

### 5. Add Analytics Tracking

**New - Add to your payment flow:**

```typescript
import {
  trackPaymentMethodSelected,
  trackPaymentCreated,
  trackPaymentCompleted,
} from "@/utils/paymentAnalytics";

// When user selects method
trackPaymentMethodSelected(selectedMethod);

// When payment created
trackPaymentCreated(payment);

// When payment completes
trackPaymentCompleted(payment);
```

---

### 6. Update Error Handling

**Add validation for currency-network combinations:**

```typescript
try {
  // Validate combination before API call
  if (!isValidCombination(currency, network)) {
    throw new Error(
      `${currency} is not supported on ${network}. ` +
      `Supported networks: ${VALID_COMBINATIONS[currency].join(', ')}`
    );
  }

  const payment = await createCryptoPayment({ ... });
} catch (error) {
  // Handle invalid combination errors
  if (error.message.includes('not supported')) {
    showUserFriendlyError('This payment method is not available');
  }
}
```

---

### 7. Remove Old References

**Search and remove these:**

```typescript
// ❌ Remove all references to:
"BTC" | "bitcoin";
"SOL" | "solana";
"MATIC" | "polygon";
"sepolia"(testnet);
"DOGE" | "dogecoin";
```

**Search command:**

```bash
# Search for old currency references
grep -r "BTC\|SOL\|MATIC\|sepolia\|bitcoin\|solana\|polygon" app/ components/ services/
```

---

### 8. Update Network Fee Estimates

**Before:**

```typescript
const fees = {
  "BTC-bitcoin": 2.5,
  "SOL-solana": 0.01,
  // ...
};
```

**After:**

```typescript
import { getEstimatedFee } from "@/services/crypto.service";

const fee = getEstimatedFee(currency, network);
// Returns updated estimates:
// USDT-tron: $0.01 (RECOMMENDED)
// USDT-bsc: $0.05
// USDT-ethereum: $5.00
// etc.
```

---

## 🎯 Recommended Payment Method

**Always recommend USDT on Tron as default:**

```typescript
import { getRecommendedPaymentMethod } from "@/config/paymentMethods";

const recommended = getRecommendedPaymentMethod();
// Returns USDT on Tron (lowest fees, fastest)

setSelectedMethod(recommended);
```

---

## 🔍 Validation Checklist

Before committing your changes:

- [ ] No references to BTC, SOL, MATIC, Sepolia
- [ ] All payment creation uses `isValidCombination()`
- [ ] Payment method selector uses new component
- [ ] Analytics tracking added
- [ ] Error handling updated
- [ ] Fee estimates updated
- [ ] Tests updated
- [ ] User-facing text updated

---

## 🚨 Breaking Changes

### Type Changes

```typescript
// ❌ OLD - String types
currency: string;
network: string;

// ✅ NEW - Strict types
currency: SupportedCurrency; // 'USDT' | 'USDC' | 'ETH' | 'BNB'
network: SupportedNetwork; // 'tron' | 'ethereum' | 'binance-smart-chain'
```

### API Changes

```typescript
// ❌ OLD - Accepted any currency
POST /api/payments/crypto/create
{
  "currency": "BTC",
  "network": "bitcoin"
}

// ✅ NEW - Only accepts supported combinations
POST /api/payments/crypto/create
{
  "currency": "USDT",
  "network": "tron"
}
// Invalid combinations return 400 error
```

---

## 📱 User-Facing Changes

### Update App Text

**Payment selection screen:**

```
Old: "Choose from Bitcoin, Ethereum, Solana, and more"
New: "Choose from USDT, USDC, ETH, and BNB"
```

**Info messages:**

```
Old: "Bitcoin and Solana supported"
New: "USDT on Tron recommended (lowest fees ~$0.01)"
```

**Error messages:**

```
Old: "Payment failed"
New: "This payment method is not currently supported. Please use USDT on Tron or another supported option."
```

---

## 🧪 Testing Commands

```bash
# Check for old currency references
grep -r "BTC\|bitcoin" app/ components/ services/

# Verify types compile
npx tsc --noEmit

# Run tests
npm test

# Check for TypeScript errors
npm run type-check
```

---

## 📊 Migration Timeline

### Day 1: Code Updates

- Update types and interfaces
- Update service layer
- Add validation

### Day 2: UI Updates

- Replace payment selectors
- Update error messages
- Add analytics

### Day 3: Testing

- Test all payment methods
- Verify error handling
- Check analytics

### Day 4: Deployment

- Deploy to staging
- Beta testing
- Production rollout

---

## ❓ Common Issues

### Issue 1: TypeScript Errors

**Error:** `Type 'BTC' is not assignable to type 'CryptoCurrency'`

**Solution:** Replace with supported currency

```typescript
// ❌ const currency: CryptoCurrency = 'BTC';
// ✅ const currency: CryptoCurrency = 'USDT';
```

### Issue 2: Invalid Combination

**Error:** `Currency ETH is not supported on network binance-smart-chain`

**Solution:** Use validation before API call

```typescript
if (isValidCombination(currency, network)) {
  await createPayment({ currency, network, ... });
}
```

### Issue 3: Missing Payment Method

**Error:** User can't find Bitcoin option

**Solution:** Show migration message

```typescript
<Text>
  Bitcoin is no longer supported. We recommend USDT on Tron for the lowest fees
  (~$0.01) and fastest confirmations (~1 minute).
</Text>
```

---

## 📞 Support

- **Documentation:** `MOBILE_CRYPTO_UPDATE_V2_COMPLETE.md`
- **Backend API:** `CONFIGURATION_COMPLETE.md`
- **Type Reference:** `types/crypto.ts`, `types/payment.ts`
- **Examples:** `config/paymentMethods.ts`

---

**Migration Status:** ✅ COMPLETE  
**Estimated Time:** 2-4 hours for full migration  
**Difficulty:** Medium

**Questions?** Refer to the main documentation or contact the development team.
