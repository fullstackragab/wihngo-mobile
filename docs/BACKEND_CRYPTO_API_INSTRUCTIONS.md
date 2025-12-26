# Backend Crypto Payment API Implementation Instructions

**For**: Backend Team using .NET ASP.NET Web API  
**Date**: December 11, 2025  
**Frontend Status**: ✅ Complete and ready

---

## 📋 Overview

The frontend crypto payment system is **fully implemented** and ready. Your backend needs to implement the following API endpoints to make it work.

### Frontend Capabilities Already Working:

- ✅ 7 cryptocurrencies supported (BTC, ETH, USDT, USDC, BNB, SOL, DOGE)
- ✅ 6 blockchain networks (Bitcoin, Ethereum, TRON, BSC, Polygon, Solana)
- ✅ Complete payment UI with QR codes
- ✅ Real-time payment status tracking
- ✅ Exchange rate display
- ✅ Network fee estimation
- ✅ Payment expiration handling

### What Frontend Expects:

The frontend will call these API endpoints at base URL: `{apiUrl}/payments/crypto/`

---

## 🔑 Required API Endpoints

### 1. **POST** `/api/payments/crypto/create`

**Purpose**: Create a new crypto payment request

**Request Body**:

```json
{
  "birdId": "guid-optional",
  "amountUsd": 4.99,
  "currency": "USDT",
  "network": "tron",
  "purpose": "premium_subscription",
  "plan": "monthly",
  "userWalletAddress": "optional-string"
}
```

**Response** (201 Created):

```json
{
  "paymentRequest": {
    "id": "payment-guid",
    "userId": "user-guid",
    "birdId": "bird-guid-or-null",
    "amountUsd": 4.99,
    "amountCrypto": 4.95,
    "currency": "USDT",
    "network": "tron",
    "exchangeRate": 1.008,
    "walletAddress": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
    "userWalletAddress": null,
    "qrCodeData": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
    "paymentUri": "tron:TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA?amount=4.95",
    "transactionHash": null,
    "confirmations": 0,
    "requiredConfirmations": 19,
    "status": "pending",
    "purpose": "premium_subscription",
    "expiresAt": "2025-12-11T12:30:00Z",
    "confirmedAt": null,
    "completedAt": null,
    "createdAt": "2025-12-11T12:00:00Z",
    "updatedAt": "2025-12-11T12:00:00Z"
  },
  "message": "Payment request created successfully"
}
```

**Business Logic**:

1. Authenticate user from JWT token
2. Get current exchange rate for the currency
3. Calculate crypto amount: `amountCrypto = amountUsd / exchangeRate`
4. Get platform wallet address for currency/network
5. Generate payment URI (see format below)
6. Set expiration time (30 minutes recommended)
7. Set required confirmations based on network:
   - Bitcoin: 2-6
   - Ethereum: 12
   - TRON: 19
   - BSC: 15
   - Polygon: 128
   - Solana: 32
8. Save to database with status "pending"
9. Return payment request

---

### 2. **GET** `/api/payments/crypto/{paymentId}`

**Purpose**: Get payment request status (used for polling)

**Response** (200 OK):

```json
{
  "id": "payment-guid",
  "userId": "user-guid",
  "birdId": "bird-guid-or-null",
  "amountUsd": 4.99,
  "amountCrypto": 4.95,
  "currency": "USDT",
  "network": "tron",
  "exchangeRate": 1.008,
  "walletAddress": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
  "userWalletAddress": "user-address-if-detected",
  "qrCodeData": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
  "paymentUri": "tron:TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA?amount=4.95",
  "transactionHash": "abc123...",
  "confirmations": 15,
  "requiredConfirmations": 19,
  "status": "confirming",
  "purpose": "premium_subscription",
  "expiresAt": "2025-12-11T12:30:00Z",
  "confirmedAt": null,
  "completedAt": null,
  "createdAt": "2025-12-11T12:00:00Z",
  "updatedAt": "2025-12-11T12:15:00Z"
}
```

**Business Logic**:

1. Verify user owns this payment request
2. Return current payment status
3. Frontend polls this every 5 seconds

---

### 3. **POST** `/api/payments/crypto/{paymentId}/verify`

**Purpose**: Manual transaction verification (optional feature)

**Request Body**:

```json
{
  "transactionHash": "0xabc123...",
  "userWalletAddress": "user-wallet-address"
}
```

**Response** (200 OK):

```json
{
  "id": "payment-guid",
  "status": "confirming",
  "transactionHash": "0xabc123...",
  "confirmations": 1,
  "message": "Transaction found and being verified"
}
```

---

### 4. **GET** `/api/payments/crypto/rates`

**Purpose**: Get current exchange rates for all supported cryptocurrencies

**Response** (200 OK):

```json
[
  {
    "currency": "BTC",
    "usdRate": 43250.5,
    "lastUpdated": "2025-12-11T12:00:00Z",
    "source": "CoinGecko"
  },
  {
    "currency": "ETH",
    "usdRate": 2250.75,
    "lastUpdated": "2025-12-11T12:00:00Z",
    "source": "CoinGecko"
  },
  {
    "currency": "USDT",
    "usdRate": 1.008,
    "lastUpdated": "2025-12-11T12:00:00Z",
    "source": "CoinGecko"
  }
]
```

**Business Logic**:

1. Return cached rates (update every 1-5 minutes via background job)
2. Use API like CoinGecko, CoinMarketCap, or Binance

---

### 5. **GET** `/api/payments/crypto/rates/{currency}`

**Purpose**: Get exchange rate for specific cryptocurrency

**Response** (200 OK):

```json
{
  "currency": "USDT",
  "usdRate": 1.008,
  "lastUpdated": "2025-12-11T12:00:00Z",
  "source": "CoinGecko"
}
```

---

### 6. **GET** `/api/payments/crypto/wallet/{currency}/{network}`

**Purpose**: Get platform wallet info for specific currency/network

**Response** (200 OK):

```json
{
  "currency": "USDT",
  "network": "tron",
  "address": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
  "qrCode": "base64-encoded-qr-code-image",
  "isActive": true
}
```

---

### 7. **GET** `/api/payments/crypto/history`

**Purpose**: Get user's payment history

**Query Parameters**:

- `page`: number (default: 1)
- `pageSize`: number (default: 20)

**Response** (200 OK):

```json
{
  "payments": [
    {
      "id": "payment-guid",
      "amountUsd": 4.99,
      "amountCrypto": 4.95,
      "currency": "USDT",
      "network": "tron",
      "status": "completed",
      "purpose": "premium_subscription",
      "createdAt": "2025-12-11T12:00:00Z",
      "completedAt": "2025-12-11T12:10:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20
}
```

---

### 8. **POST** `/api/payments/crypto/{paymentId}/cancel`

**Purpose**: Cancel a pending payment

**Response** (200 OK):

```json
{
  "id": "payment-guid",
  "status": "cancelled",
  "message": "Payment cancelled successfully"
}
```

---

### 9. **GET** `/api/payments/crypto/wallets` (Optional)

**Purpose**: Get user's saved crypto wallets

**Response** (200 OK):

```json
[
  {
    "id": "wallet-guid",
    "userId": "user-guid",
    "walletAddress": "user-address",
    "currency": "USDT",
    "network": "tron",
    "label": "My TRON Wallet",
    "isDefault": true,
    "verified": true,
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
]
```

---

## 🏗️ Database Schema

### Table: `platform_wallets`

Stores Wihngo's receiving wallet addresses

```sql
CREATE TABLE platform_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    private_key_encrypted TEXT,
    derivation_path VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(currency, network, address)
);

-- Insert TRON USDT wallet (PRIMARY WALLET)
INSERT INTO platform_wallets (currency, network, address, is_active)
VALUES ('USDT', 'tron', 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA', true);
```

### Table: `crypto_payment_requests`

Stores payment requests from users

```sql
CREATE TABLE crypto_payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bird_id UUID REFERENCES birds(id),
    amount_usd DECIMAL(10,2) NOT NULL,
    amount_crypto DECIMAL(20,10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    exchange_rate DECIMAL(20,2) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    user_wallet_address VARCHAR(255),
    qr_code_data TEXT NOT NULL,
    payment_uri TEXT NOT NULL,
    transaction_hash VARCHAR(255),
    confirmations INT DEFAULT 0,
    required_confirmations INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crypto_payments_user ON crypto_payment_requests(user_id);
CREATE INDEX idx_crypto_payments_status ON crypto_payment_requests(status);
CREATE INDEX idx_crypto_payments_tx_hash ON crypto_payment_requests(transaction_hash);
```

### Table: `crypto_transactions`

Stores detected blockchain transactions

```sql
CREATE TABLE crypto_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID REFERENCES crypto_payment_requests(id),
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20,10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    confirmations INT DEFAULT 0,
    block_number BIGINT,
    fee DECIMAL(20,10),
    status VARCHAR(20) DEFAULT 'pending',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_crypto_tx_payment ON crypto_transactions(payment_request_id);
CREATE INDEX idx_crypto_tx_hash ON crypto_transactions(transaction_hash);
```

### Table: `crypto_exchange_rates`

Stores exchange rates (cache)

```sql
CREATE TABLE crypto_exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) UNIQUE NOT NULL,
    usd_rate DECIMAL(20,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) NOT NULL
);
```

---

## 🔄 Payment Status Flow

```
pending → confirming → confirmed → completed
   ↓           ↓
expired     failed
```

### Status Definitions:

- **pending**: Payment created, waiting for transaction
- **confirming**: Transaction detected, waiting for confirmations
- **confirmed**: Enough confirmations received
- **completed**: Payment processed, subscription activated
- **expired**: Payment window expired (30 minutes)
- **failed**: Transaction failed or invalid

---

## 🔐 Payment URI Formats

### TRON (USDT TRC-20):

```
TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
```

(Simple address, TRON doesn't use URI scheme)

### Bitcoin:

```
bitcoin:ADDRESS?amount=AMOUNT&label=Wihngo%20Payment
```

### Ethereum (ETH, USDT ERC-20, USDC):

```
ethereum:ADDRESS?value=AMOUNT_IN_WEI&label=Wihngo%20Payment
```

### Binance Smart Chain:

```
bnb:ADDRESS?value=AMOUNT_IN_WEI&label=Wihngo%20Payment
```

### Solana:

```
solana:ADDRESS?amount=AMOUNT&label=Wihngo%20Payment
```

---

## 🔔 Background Jobs Required

### 1. Exchange Rate Update Job

**Frequency**: Every 1-5 minutes

```csharp
// Pseudo-code
async Task UpdateExchangeRates()
{
    var rates = await _coinGeckoService.GetRates();
    foreach (var rate in rates)
    {
        await _db.UpsertExchangeRate(rate);
    }
}
```

### 2. Payment Monitor Job

**Frequency**: Every 30-60 seconds

```csharp
async Task MonitorPendingPayments()
{
    var pendingPayments = await _db.GetPendingPayments();

    foreach (var payment in pendingPayments)
    {
        // Check expiration
        if (payment.ExpiresAt < DateTime.UtcNow)
        {
            await _db.UpdatePaymentStatus(payment.Id, "expired");
            continue;
        }

        // Check blockchain for transaction
        var tx = await _blockchainService.CheckTransaction(
            payment.WalletAddress,
            payment.AmountCrypto,
            payment.Network
        );

        if (tx != null)
        {
            payment.TransactionHash = tx.Hash;
            payment.Confirmations = tx.Confirmations;
            payment.Status = tx.Confirmations >= payment.RequiredConfirmations
                ? "confirmed"
                : "confirming";

            await _db.UpdatePayment(payment);

            if (payment.Status == "confirmed")
            {
                await ActivatePremiumSubscription(payment);
            }
        }
    }
}
```

---

## 🌐 Blockchain Integration

### TRON (Primary - USDT TRC-20)

**Recommended Library**: TronNet or direct API calls to TronGrid

**TronGrid API**:

```
https://api.trongrid.io/v1/accounts/{address}/transactions/trc20
```

**Check for USDT transactions**:

```csharp
async Task<Transaction> CheckTronUsdtTransaction(string address, decimal amount)
{
    var url = $"https://api.trongrid.io/v1/accounts/{address}/transactions/trc20";
    var response = await _httpClient.GetAsync(url);
    var data = await response.Content.ReadAsStringAsync();

    // Parse and find matching transaction
    // USDT Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
    // Check amount matches (in smallest unit: 1 USDT = 1,000,000)
}
```

### Ethereum (ETH, USDT ERC-20, USDC)

**Recommended Library**: Nethereum

**Example**:

```csharp
var web3 = new Web3("https://mainnet.infura.io/v3/YOUR_KEY");
var txReceipt = await web3.Eth.Transactions.GetTransactionReceipt
    .SendRequestAsync(txHash);
```

### Bitcoin

**Recommended Library**: NBitcoin + Blockchain.info API

---

## 🚀 Implementation Priority

### Phase 1 (MVP - TRON USDT Only):

1. ✅ Create database tables
2. ✅ POST `/api/payments/crypto/create`
3. ✅ GET `/api/payments/crypto/{paymentId}`
4. ✅ GET `/api/payments/crypto/rates/USDT`
5. ✅ Background job: Payment monitor (TRON only)
6. ✅ Background job: Exchange rate updater

### Phase 2 (Add Bitcoin & Ethereum):

7. ⏳ Implement Bitcoin blockchain integration
8. ⏳ Implement Ethereum blockchain integration
9. ⏳ Add support for BTC, ETH payments

### Phase 3 (Full Support):

10. ⏳ Add remaining cryptocurrencies (BNB, SOL, DOGE)
11. ⏳ Implement wallet management endpoints
12. ⏳ Add payment history endpoint

---

## 🧪 Testing Checklist

### Manual Testing:

- [ ] Create USDT/TRON payment request
- [ ] Verify QR code generation
- [ ] Send test USDT to wallet address
- [ ] Verify transaction detection
- [ ] Confirm payment status updates
- [ ] Verify premium subscription activation

### Test Wallet:

**Network**: TRON Testnet (Nile)  
**Get test USDT**: https://nileex.io/join/getJoinPage

---

## 📚 Additional Documentation

For complete implementation details, refer to:

1. `BACKEND_CRYPTO_DOTNET_GUIDE.md` - Full .NET implementation
2. `CRYPTO_WALLET_UPDATE.md` - Wallet configuration
3. `TRON_WALLET_README.md` - TRON-specific details

---

## ❓ Questions & Support

**Frontend Contact**: Your frontend already has all code ready. No changes needed.

**Expected Response Format**: All responses must match the JSON schemas above exactly.

**Authentication**: All endpoints except `/rates` require JWT Bearer token.

**Error Responses**: Return standard HTTP codes:

- 400: Bad request (validation errors)
- 401: Unauthorized
- 404: Payment not found
- 500: Server error

Example error response:

```json
{
  "error": "Invalid currency",
  "message": "Currency 'XYZ' is not supported",
  "code": "INVALID_CURRENCY"
}
```

---

## 🎯 Success Criteria

Your implementation is complete when:

1. ✅ User can select USDT/TRON payment method
2. ✅ Payment request is created with QR code
3. ✅ User sends USDT to provided address
4. ✅ Backend detects transaction automatically
5. ✅ Payment status updates in real-time
6. ✅ Premium subscription activates on confirmation
7. ✅ User sees success message

**Good luck! The frontend is waiting for you! 🚀**
