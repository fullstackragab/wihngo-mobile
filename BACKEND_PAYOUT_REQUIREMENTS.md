# 💰 Wihngo Multi-Payout Strategy - Backend Requirements

## 📋 Overview

This document outlines the backend API requirements for implementing the multi-payout strategy for Wihngo bird owners. Bird owners can receive their earnings (95% of support after 5% platform fee) through multiple payment methods.

---

## 🎯 Core Principles

- **95% belongs to bird owner** - Wihngo keeps 5% platform fee only
- **Bird owner chooses payment method** - They select how to get paid
- **Minimum payout: €20** - Monthly processing
- **Bird owner responsible for taxes** - We're a facilitator, not a payment institution

---

## 🗄️ Database Schema

### PayoutMethod Table

```sql
CREATE TABLE PayoutMethods (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    MethodType NVARCHAR(50) NOT NULL, -- 'iban', 'paypal', 'usdc-solana', 'eurc-solana', 'usdc-base', 'eurc-base'
    IsDefault BIT NOT NULL DEFAULT 0,
    IsVerified BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    -- IBAN/SEPA fields
    AccountHolderName NVARCHAR(255) NULL,
    IBAN NVARCHAR(34) NULL,
    BIC NVARCHAR(11) NULL,
    BankName NVARCHAR(255) NULL,

    -- PayPal fields
    PayPalEmail NVARCHAR(255) NULL,

    -- Crypto fields
    WalletAddress NVARCHAR(255) NULL,
    Network NVARCHAR(50) NULL, -- 'solana' or 'base'
    Currency NVARCHAR(10) NULL, -- 'usdc' or 'eurc'

    CONSTRAINT FK_PayoutMethods_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_PayoutMethods_UserId (UserId),
    INDEX IX_PayoutMethods_IsDefault (UserId, IsDefault)
);
```

### PayoutTransaction Table

```sql
CREATE TABLE PayoutTransactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PayoutMethodId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'EUR',
    Status NVARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed', 'cancelled'

    -- Fee breakdown
    PlatformFee DECIMAL(18, 2) NOT NULL, -- 5%
    ProviderFee DECIMAL(18, 2) NOT NULL,
    NetAmount DECIMAL(18, 2) NOT NULL,

    -- Processing details
    ScheduledAt DATETIME2 NOT NULL,
    ProcessedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    FailureReason NVARCHAR(500) NULL,
    TransactionId NVARCHAR(255) NULL, -- External payment provider transaction ID

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_PayoutTransactions_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_PayoutTransactions_PayoutMethods FOREIGN KEY (PayoutMethodId) REFERENCES PayoutMethods(Id),
    INDEX IX_PayoutTransactions_UserId (UserId),
    INDEX IX_PayoutTransactions_Status (Status),
    INDEX IX_PayoutTransactions_ScheduledAt (ScheduledAt)
);
```

### PayoutBalance Table

```sql
CREATE TABLE PayoutBalances (
    UserId UNIQUEIDENTIFIER PRIMARY KEY,
    AvailableBalance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    PendingBalance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'EUR',
    LastPayoutDate DATETIME2 NULL,
    NextPayoutDate DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_PayoutBalances_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### 1. Get Payout Balance

**Endpoint:** `GET /api/payouts/balance`

**Description:** Get the user's current payout balance and next payout date

**Authorization:** Bearer Token (User must be authenticated)

**Response:**

```json
{
  "userId": "string (UUID)",
  "availableBalance": 150.5,
  "pendingBalance": 25.0,
  "currency": "EUR",
  "nextPayoutDate": "2025-01-01T00:00:00Z",
  "minimumReached": true,
  "summary": {
    "totalEarned": 500.0,
    "totalPaidOut": 324.5,
    "platformFeePaid": 25.0,
    "providerFeesPaid": 5.0
  }
}
```

**Business Logic:**

- `availableBalance` = total support received × 0.95 - already paid out
- `pendingBalance` = support being processed (not yet cleared)
- `minimumReached` = `availableBalance >= 20.00`

---

### 2. Get Payout Methods

**Endpoint:** `GET /api/payouts/methods`

**Description:** Get all payout methods for the authenticated user

**Authorization:** Bearer Token

**Response:**

```json
{
  "methods": [
    {
      "id": "string (UUID)",
      "userId": "string (UUID)",
      "methodType": "iban",
      "isDefault": true,
      "isVerified": true,
      "createdAt": "2025-12-15T10:00:00Z",
      "updatedAt": "2025-12-15T10:00:00Z",
      "accountHolderName": "John Doe",
      "iban": "DE89370400440532013000",
      "bic": "COBADEFFXXX",
      "bankName": "Commerzbank"
    },
    {
      "id": "string (UUID)",
      "userId": "string (UUID)",
      "methodType": "paypal",
      "isDefault": false,
      "isVerified": true,
      "createdAt": "2025-12-10T10:00:00Z",
      "paypalEmail": "john@example.com"
    },
    {
      "id": "string (UUID)",
      "userId": "string (UUID)",
      "methodType": "usdc-solana",
      "isDefault": false,
      "isVerified": true,
      "createdAt": "2025-12-05T10:00:00Z",
      "walletAddress": "7xKXtg2CW...",
      "network": "solana",
      "currency": "usdc"
    }
  ]
}
```

**Notes:**

- Sensitive fields like full IBAN should be masked on return (show last 4 digits)
- Backend should store full data but return masked version

---

### 3. Add Payout Method

**Endpoint:** `POST /api/payouts/methods`

**Description:** Add a new payout method

**Authorization:** Bearer Token

**Request Body:**

#### For IBAN/SEPA:

```json
{
  "methodType": "iban",
  "isDefault": true,
  "accountHolderName": "John Doe",
  "iban": "DE89370400440532013000",
  "bic": "COBADEFFXXX",
  "bankName": "Commerzbank"
}
```

#### For PayPal:

```json
{
  "methodType": "paypal",
  "isDefault": true,
  "paypalEmail": "john@example.com"
}
```

#### For Crypto:

```json
{
  "methodType": "usdc-solana",
  "isDefault": true,
  "walletAddress": "7xKXtg2CW87d9waz41HLNZxPgjV9GjVJRMQJBNq3eiNw",
  "network": "solana",
  "currency": "usdc"
}
```

**Response:**

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "methodType": "iban",
  "isDefault": true,
  "isVerified": false,
  "createdAt": "2025-12-15T10:00:00Z",
  "message": "Payout method added successfully"
}
```

**Validation:**

- IBAN: Validate format, length (15-34 chars), checksum
- PayPal: Validate email format
- Crypto Solana: Base58 validation, 32-44 chars
- Crypto Base: EVM address validation (0x + 40 hex chars)
- Ensure only ONE default method per user (if new is default, unset others)

**Business Rules:**

- User can have multiple payment methods
- Only ONE can be default at a time
- New methods start as `isVerified: false`
- First method is automatically default

---

### 4. Update Payout Method

**Endpoint:** `PATCH /api/payouts/methods/{methodId}`

**Description:** Update a payout method (mainly to set as default)

**Authorization:** Bearer Token

**Request Body:**

```json
{
  "isDefault": true
}
```

**Response:**

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "methodType": "iban",
  "isDefault": true,
  "isVerified": true,
  "updatedAt": "2025-12-15T10:00:00Z",
  "message": "Payout method updated successfully"
}
```

**Business Rules:**

- Can only update user's own methods
- If setting as default, unset all other methods for that user

---

### 5. Delete Payout Method

**Endpoint:** `DELETE /api/payouts/methods/{methodId}`

**Description:** Delete a payout method

**Authorization:** Bearer Token

**Response:**

```json
{
  "message": "Payout method deleted successfully"
}
```

**Business Rules:**

- Cannot delete if it's the only method AND balance > 0
- Cannot delete if there's a pending payout using this method
- If deleting default method and other methods exist, set another as default

---

### 6. Get Payout History

**Endpoint:** `GET /api/payouts/history?page=1&pageSize=20`

**Description:** Get payout transaction history for the user

**Authorization:** Bearer Token

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status ('pending', 'completed', 'failed', etc.)

**Response:**

```json
{
  "page": 1,
  "pageSize": 20,
  "totalCount": 45,
  "totalPages": 3,
  "items": [
    {
      "id": "string (UUID)",
      "amount": 150.5,
      "currency": "EUR",
      "methodType": "iban",
      "status": "completed",
      "platformFee": 7.92,
      "providerFee": 1.0,
      "netAmount": 141.58,
      "scheduledAt": "2025-12-01T00:00:00Z",
      "processedAt": "2025-12-01T10:30:00Z",
      "completedAt": "2025-12-02T08:15:00Z",
      "transactionId": "TXN_123456789"
    }
  ]
}
```

---

### 7. Initiate Manual Payout (Admin/Background Job)

**Endpoint:** `POST /api/admin/payouts/process`

**Description:** Process pending payouts (background job or admin trigger)

**Authorization:** Admin Token

**Request Body:**

```json
{
  "userId": "string (UUID)" // Optional: process for specific user
}
```

**Response:**

```json
{
  "processed": 25,
  "successful": 23,
  "failed": 2,
  "totalAmount": 5432.1,
  "details": [
    {
      "userId": "string (UUID)",
      "amount": 150.5,
      "status": "completed",
      "transactionId": "TXN_123456789"
    }
  ]
}
```

**Business Logic:**

1. Find all users with `availableBalance >= 20.00`
2. Find their default payout method
3. Create payout transaction record (status: 'pending')
4. Process payment via appropriate provider:
   - **IBAN**: Use SEPA transfer service (e.g., Wise API, TransferWise)
   - **PayPal**: Use PayPal Payouts API
   - **Crypto**: Use blockchain transaction (Solana RPC, Base RPC)
5. Update transaction status based on result
6. Deduct from user's `availableBalance`
7. Send notification to user

---

## 🔐 Security Considerations

### Data Encryption

- Encrypt sensitive fields in database:
  - IBAN (full number)
  - BIC
  - PayPal email
  - Wallet addresses
- Use AES-256 encryption
- Store encryption keys in Azure Key Vault or similar

### API Security

- All endpoints require authentication (Bearer Token)
- Rate limiting: 10 requests per minute per user
- Validate ownership of payout methods
- Log all payout-related actions for audit trail

### Validation

- IBAN: Implement IBAN checksum validation
- PayPal: Verify email format and domain
- Crypto: Validate address format per network
- Amount validation: Must be >= €20 for payouts

---

## 💳 Payment Provider Integration

### IBAN/SEPA Transfer

**Recommended Provider:** Wise (TransferWise) API

**Implementation:**

```
POST https://api.transferwise.com/v1/transfers
Authorization: Bearer {api_key}

{
  "targetAccount": "{recipient_id}",
  "quoteUuid": "{quote_id}",
  "customerTransactionId": "{unique_id}",
  "details": {
    "reference": "Wihngo Payout - {month}"
  }
}
```

**Cost:** €0-€1 per transfer

---

### PayPal Payouts

**Provider:** PayPal Payouts API

**Implementation:**

```
POST https://api-m.paypal.com/v1/payments/payouts
Authorization: Bearer {access_token}

{
  "sender_batch_header": {
    "sender_batch_id": "{unique_batch_id}",
    "email_subject": "You have a payment from Wihngo"
  },
  "items": [
    {
      "recipient_type": "EMAIL",
      "amount": {
        "value": "141.58",
        "currency": "EUR"
      },
      "receiver": "john@example.com",
      "note": "Wihngo earnings payout"
    }
  ]
}
```

**Cost:** ~2-3% per transfer

---

### Crypto (USDC/EURC on Solana)

**Provider:** Solana Web3.js + Circle USDC/EURC

**Implementation:**

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// USDC mint address on Solana mainnet
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

async function sendUSDC(recipientAddress: string, amount: number) {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  // ... transfer logic
}
```

**Cost:** <$0.01 per transfer

---

### Crypto (USDC/EURC on Base)

**Provider:** Ethers.js + Base RPC

**Implementation:**

```typescript
import { ethers } from "ethers";

// USDC contract address on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function sendUSDC(recipientAddress: string, amount: number) {
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  // ... transfer logic
}
```

**Cost:** ~$0.01 per transfer

---

## 📊 Background Jobs

### Monthly Payout Job

**Schedule:** 1st of every month at 00:00 UTC

**Tasks:**

1. Query all users with `availableBalance >= 20.00`
2. Create payout transactions
3. Process via appropriate payment provider
4. Update balances and transaction statuses
5. Send email notifications

**Retry Logic:**

- Failed payouts: Retry 3 times with exponential backoff
- Still failed after 3 attempts: Mark as 'failed', notify user
- Next month: Include failed amount in new payout attempt

---

## 📧 Email Notifications

### Payout Scheduled

```
Subject: Your earnings payout is scheduled

Hi {name},

Your Wihngo earnings payout of €{amount} is scheduled for processing.

Method: {method_type}
Scheduled date: {date}

You'll receive a confirmation once processed.

Questions? Contact support@wihngo.com
```

### Payout Completed

```
Subject: Your earnings have been sent!

Hi {name},

Great news! Your Wihngo earnings payout has been completed.

Amount: €{netAmount}
Method: {method_type}
Date: {date}
Transaction ID: {transactionId}

View your payout history: https://wihngo.com/payout-history

Questions? Contact support@wihngo.com
```

### Payout Failed

```
Subject: Action required: Payout failed

Hi {name},

We couldn't process your earnings payout of €{amount}.

Reason: {failureReason}

Please:
1. Check your payment method details
2. Update if necessary
3. Contact support if the issue persists

Your balance is safe and will be included in the next payout cycle.

Questions? Contact support@wihngo.com
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] IBAN validation
- [ ] PayPal email validation
- [ ] Crypto address validation (Solana & Base)
- [ ] Fee calculations (5% platform + provider fees)
- [ ] Default method logic (only one default per user)
- [ ] Balance calculations

### Integration Tests

- [ ] Add payout method (all types)
- [ ] Update payout method (set as default)
- [ ] Delete payout method
- [ ] Get payout balance
- [ ] Get payout history
- [ ] Process payout (mock payment providers)

### End-to-End Tests

- [ ] Full payout flow from support to bird owner bank account
- [ ] Handle failed payouts gracefully
- [ ] Retry failed payouts
- [ ] Email notifications sent correctly

---

## 🚀 Implementation Phases

### Phase 1: Database & Core APIs (Week 1)

- [ ] Create database tables
- [ ] Implement CRUD endpoints for payout methods
- [ ] Implement balance calculation logic
- [ ] Basic validation

### Phase 2: Payment Provider Integration (Week 2)

- [ ] Integrate IBAN/SEPA provider (Wise)
- [ ] Integrate PayPal Payouts API
- [ ] Implement basic payout processing

### Phase 3: Crypto Integration (Week 3)

- [ ] Integrate Solana (USDC/EURC)
- [ ] Integrate Base (USDC/EURC)
- [ ] Test crypto transfers on testnet

### Phase 4: Background Jobs & Polish (Week 4)

- [ ] Implement monthly payout job
- [ ] Add retry logic for failed payouts
- [ ] Email notifications
- [ ] Admin dashboard for payout monitoring
- [ ] Security audit

---

## 📝 Environment Variables

```env
# Payment Providers
WISE_API_KEY=your_wise_api_key
WISE_PROFILE_ID=your_profile_id

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # or 'live'

# Crypto
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAYER_PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASE_PAYER_PRIVATE_KEY=your_private_key

# Encryption
ENCRYPTION_KEY=your_aes_256_key

# Fees
PLATFORM_FEE_PERCENTAGE=5
MINIMUM_PAYOUT_AMOUNT=20
```

---

## 📚 Additional Resources

- [Wise API Documentation](https://api-docs.transferwise.com/)
- [PayPal Payouts API](https://developer.paypal.com/docs/payouts/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Base Documentation](https://docs.base.org/)
- [IBAN Validation Library](https://github.com/arhs/iban.js)

---

## 💡 Future Enhancements

1. **Multi-currency support**: Allow payouts in USD, GBP, etc.
2. **Instant payouts**: Offer faster payouts for a small fee
3. **Payout scheduling**: Let users choose payout frequency
4. **Tax reporting**: Generate annual earnings reports
5. **More payment methods**: Bank.fi, Stripe Connect, etc.
6. **Payout analytics**: Show earnings trends and charts

---

## ✅ Summary

By implementing this backend API, you will enable Wihngo bird owners to:

- ✅ Choose their preferred payout method (IBAN, PayPal, or Crypto)
- ✅ Receive 95% of support earnings automatically
- ✅ Track their balance and payout history
- ✅ Get paid monthly (when balance >= €20)
- ✅ Have full control over their payment preferences

**The frontend mobile app is ready and waiting for these endpoints!** 🚀
