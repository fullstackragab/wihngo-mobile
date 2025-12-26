# Payout API Quick Reference 🚀

## Quick Overview

All payout payment method functionality has been implemented based on the backend API documentation. The system now supports:

- Bank Transfers (IBAN/SEPA)
- PayPal
- Cryptocurrency (Solana & Base networks)

---

## 📱 Screens

### 1. Payout Settings (`/payout-settings`)

Main screen showing balance and payment methods.

**Features:**

- View available balance, pending balance, total earned, total paid out
- View all payment methods with verification status
- Set default payment method
- Delete payment methods
- Navigate to add new method or view history

**API Calls:**

```typescript
await payoutService.getBalance();
await payoutService.getPayoutMethods();
await payoutService.setDefaultPayoutMethod(methodId);
await payoutService.deletePayoutMethod(methodId);
```

---

### 2. Add Payout Method (`/add-payout-method`)

Selection screen for payment method type.

**Supported Methods:**

- Bank Transfer (IBAN) - Recommended
- PayPal
- USDC on Solana
- EURC on Solana
- USDC on Base
- EURC on Base

**Navigation:**

- Bank Transfer → `/add-iban-method`
- PayPal → `/add-paypal-method`
- Crypto → `/add-crypto-method?methodType=Solana&currency=USDC&network=solana-mainnet`

---

### 3. Add IBAN Method (`/add-iban-method`)

Form to add bank transfer details.

**Fields:**

- Account Holder Name (required)
- IBAN (required)
- BIC/SWIFT (optional, required for some countries)
- Bank Name (optional)

**API Call:**

```typescript
await payoutService.addPayoutMethod({
  methodType: "BankTransfer",
  accountHolderName: "John Doe",
  iban: "GB82WEST12345698765432",
  bic: "NWBKGB2L",
  bankName: "NatWest",
  isDefault: true,
});
```

---

### 4. Add PayPal Method (`/add-paypal-method`)

Form to add PayPal email.

**Fields:**

- PayPal Email (required)

**API Call:**

```typescript
await payoutService.addPayoutMethod({
  methodType: "PayPal",
  payPalEmail: "user@example.com",
  isDefault: true,
});
```

---

### 5. Add Crypto Method (`/add-crypto-method`)

Form to add cryptocurrency wallet.

**Fields:**

- Wallet Address (required)

**Params:**

- `methodType`: "Solana" | "Base"
- `currency`: "USDC" | "EURC" | "SOL" | "ETH"
- `network`: "solana-mainnet" | "base-mainnet" | etc.

**API Call:**

```typescript
await payoutService.addPayoutMethod({
  methodType: "Solana",
  walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  network: "solana-mainnet",
  currency: "USDC",
  isDefault: true,
});
```

---

### 6. Payout History (`/payout-history`)

List of all payout transactions with pagination.

**Features:**

- View transaction status (pending, processing, completed, failed)
- View transaction amounts and dates
- Pull to refresh
- Infinite scroll pagination
- View transaction IDs

**API Call:**

```typescript
await payoutService.getPayoutHistory(page, pageSize, status?)
```

---

## 🔗 API Service Methods

### Balance

```typescript
payoutService.getBalance(): Promise<PayoutBalance>
```

### Payment Methods

```typescript
payoutService.getPayoutMethods(): Promise<PayoutMethod[]>
payoutService.getPayoutMethod(methodId): Promise<PayoutMethod>
payoutService.addPayoutMethod(data): Promise<PayoutMethod>
payoutService.updatePayoutMethod(methodId, data): Promise<PayoutMethod>
payoutService.deletePayoutMethod(methodId): Promise<void>
payoutService.setDefaultPayoutMethod(methodId): Promise<PayoutMethod>
```

### History

```typescript
payoutService.getPayoutHistory(page, pageSize, status?): Promise<{
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: PayoutHistoryItem[];
}>
```

---

## 📋 Data Types

### PayoutMethodType

```typescript
type PayoutMethodType =
  | "BankTransfer"
  | "PayPal"
  | "Wise"
  | "Solana"
  | "Base"
  | "Crypto";
```

### PayoutMethod

```typescript
type PayoutMethod = {
  id?: string;
  userId: string;
  methodType: PayoutMethodType;
  isDefault: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Bank Transfer
  accountHolderName?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  // PayPal
  payPalEmail?: string;
  // Crypto
  walletAddress?: string;
  network?: string;
  currency?: string;
};
```

### PayoutBalance

```typescript
type PayoutBalance = {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  currency: string;
  minimumPayout: number;
  nextPayoutDate?: string;
  lastPayoutDate?: string;
  lastPayoutAmount?: number;
};
```

### PayoutHistoryItem

```typescript
type PayoutHistoryItem = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  methodType: PayoutMethodType;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  providerTransactionId?: string;
};
```

---

## ✅ Validation Rules

### Bank Transfer (IBAN)

- IBAN: 15-34 characters, valid format
- Account Holder Name: 2-100 characters
- BIC/SWIFT: 8 or 11 characters (if provided)

### PayPal

- Valid email format
- Must be a registered PayPal account

### Cryptocurrency

- **Solana**: Base58, 32-44 characters
- **Base/Ethereum**: 0x + 40 hex characters
- Network must match wallet address type
- Currency must be supported on the network

---

## 🎨 Method Icons & Colors

### Icons (Ionicons)

- Bank Transfer/Wise: `card-outline`
- PayPal: `logo-paypal`
- Crypto (Solana/Base): `wallet-outline`

### Colors

- Solana: `#14F195`
- Base: `#0052FF`
- PayPal: `#0070BA`
- Bank: `#4ECDC4`

---

## 🌐 Supported Networks & Currencies

### Solana

- **Networks**: `solana-mainnet`, `solana-devnet`
- **Currencies**: `USDC`, `EURC`, `SOL`

### Base

- **Networks**: `base-mainnet`, `base-testnet`
- **Currencies**: `USDC`, `EURC`, `ETH`

---

## 🚨 Error Handling

All API calls include error handling:

```typescript
try {
  await payoutService.addPayoutMethod(data);
  Alert.alert("Success", "Payment method added successfully");
  router.back();
  router.back(); // Return to payout settings
} catch (error: any) {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Failed to add payment method. Please try again.";
  Alert.alert("Error", errorMessage);
}
```

---

## 📍 Navigation Flow

```
payout-settings
├── add-payout-method
│   ├── add-iban-method → back to payout-settings
│   ├── add-paypal-method → back to payout-settings
│   └── add-crypto-method → back to payout-settings
└── payout-history
```

---

## 🧪 Testing Endpoints

### Local Backend

```
http://localhost:7297/api/payouts/*
```

### Production Backend

```
https://your-api.com/api/payouts/*
```

---

## 💡 Common Issues & Solutions

### Issue: "Failed to add payment method"

- Check if backend API is running
- Verify authentication token is valid
- Check network connectivity

### Issue: "Invalid IBAN format"

- Ensure IBAN is in correct format (2 letters + 2 digits + alphanumeric)
- Remove spaces from IBAN before sending

### Issue: "Invalid wallet address"

- Verify address format matches network (Solana vs Base)
- Check address length and prefix

### Issue: Payment method not appearing

- Check if API call succeeded
- Verify user authentication
- Refresh the screen

---

## 📖 Usage Examples

### Add Bank Transfer

```typescript
router.push("/add-payout-method");
// Select "Bank Transfer"
// Fill form and submit
```

### Add Crypto Method

```typescript
router.push("/add-payout-method");
// Select "USDC on Solana"
// Enter wallet address and submit
```

### View History

```typescript
router.push("/payout-history");
// Pull to refresh
// Scroll for more items
```

---

## 🔧 Configuration

### Minimum Payout

Default: $25 (configurable in backend)

### Payout Frequency

Default: Monthly (last day of month)

### Currency

Default: USD (backend can be configured for EUR)

---

_Last Updated: December 15, 2025_
