# Backend Sepolia Support - Checklist

## 🚨 Error: 400 Bad Request for Sepolia Payments

If you're getting a **400 error** when trying to create crypto payments with `currency: "ETH"` and `network: "sepolia"`, it means the backend needs to be configured to support Sepolia testnet.

---

## ✅ Backend Requirements Checklist

### 1. Network Support

- [ ] Backend accepts `"sepolia"` as a valid `CryptoNetwork` enum value
- [ ] Network validation allows `ETH` + `sepolia` combination
- [ ] Sepolia included in supported networks list

### 2. Wallet Configuration

- [ ] Sepolia receive wallet address configured
- [ ] **Recommended address:** `0x4cc28f4cea7b440858b903b5c46685cb1478cdc4`
- [ ] Wallet address stored in configuration/database
- [ ] Wallet endpoint returns address for Sepolia

**Test endpoint:**

```http
GET /api/payments/crypto/wallet/ETH/sepolia
```

**Expected response:**

```json
{
  "currency": "ETH",
  "network": "sepolia",
  "address": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
  "qrCode": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
  "isActive": true
}
```

### 3. Exchange Rate

- [ ] ETH exchange rate available (same for mainnet and Sepolia)
- [ ] Exchange rate endpoint returns ETH rates

**Test endpoint:**

```http
GET /api/payments/crypto/rates/ETH
```

**Expected response:**

```json
{
  "currency": "ETH",
  "usdRate": 3000.0,
  "lastUpdated": "2025-12-11T10:00:00Z",
  "source": "CoinGecko"
}
```

### 4. Payment Creation

- [ ] API accepts payment creation with Sepolia parameters
- [ ] Validation allows `currency: "ETH"` with `network: "sepolia"`
- [ ] Payment request created successfully

**Test endpoint:**

```http
POST /api/payments/crypto/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "amountUsd": 11.00,
  "currency": "ETH",
  "network": "sepolia",
  "birdId": "optional-bird-id",
  "purpose": "premium_subscription",
  "plan": "monthly"
}
```

**Expected response:**

```json
{
  "paymentRequest": {
    "id": "payment-guid",
    "currency": "ETH",
    "network": "sepolia",
    "amountCrypto": 0.00366667,
    "exchangeRate": 3000.0,
    "walletAddress": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
    "qrCodeData": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
    "paymentUri": "ethereum:0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
    "requiredConfirmations": 6,
    "status": "pending",
    "purpose": "premium_subscription",
    "plan": "monthly",
    "expiresAt": "2025-12-11T11:00:00Z",
    "createdAt": "2025-12-11T10:30:00Z"
  },
  "message": "Payment request created successfully"
}
```

### 5. Blockchain Verification

- [ ] Backend can connect to Sepolia testnet RPC
- [ ] Transaction verification works for Sepolia
- [ ] Confirmation counting works (requires 6 confirmations)

**Sepolia RPC Endpoints:**

- Infura: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
- Public: `https://rpc.sepolia.org`

### 6. Environment Configuration

- [ ] Sepolia RPC URL configured in backend
- [ ] Sepolia wallet private key/address in configuration
- [ ] Chain ID set to `11155111` for Sepolia
- [ ] Environment variables set

**Example Backend Config:**

```json
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "rpcUrl": "https://sepolia.infura.io/v3/YOUR_KEY",
      "walletAddress": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
      "confirmationsRequired": 6,
      "isTestnet": true
    }
  }
}
```

---

## 🐛 Debugging 400 Error

### Step 1: Check Backend Logs

Look for validation errors in backend logs when the 400 occurs:

- "Currency not supported"
- "Network not supported"
- "Invalid currency-network combination"
- "Wallet not configured for network"

### Step 2: Test with Supported Networks

Try creating payment with known working combinations:

```typescript
// Test Tron (most widely supported)
{
  currency: "USDT",
  network: "tron"
}

// Test Ethereum mainnet
{
  currency: "USDT",
  network: "ethereum"
}
```

### Step 3: Check Network Enum

Verify backend `CryptoNetwork` enum includes:

```csharp
public enum CryptoNetwork
{
    Bitcoin,
    Ethereum,
    BinanceSmartChain,
    Tron,
    Polygon,
    Solana,
    Sepolia  // ← Must be present
}
```

### Step 4: Check Validation Logic

Backend validation should allow:

```csharp
// Valid combinations
(Currency: ETH, Network: Ethereum) ✅
(Currency: ETH, Network: Sepolia) ✅  // ← Must be allowed
(Currency: USDT, Network: Tron) ✅
(Currency: USDT, Network: Ethereum) ✅
```

---

## 📝 Backend Code Examples

### C# Validation Example

```csharp
public bool IsValidCurrencyNetwork(CryptoCurrency currency, CryptoNetwork network)
{
    var validCombinations = new Dictionary<CryptoCurrency, CryptoNetwork[]>
    {
        { CryptoCurrency.ETH, new[] { CryptoNetwork.Ethereum, CryptoNetwork.Sepolia } },
        { CryptoCurrency.USDT, new[] { CryptoNetwork.Tron, CryptoNetwork.Ethereum, CryptoNetwork.BinanceSmartChain } },
        // ... other combinations
    };

    return validCombinations.TryGetValue(currency, out var networks)
        && networks.Contains(network);
}
```

### Network Configuration Example

```csharp
public class NetworkConfig
{
    public string WalletAddress { get; set; }
    public string RpcUrl { get; set; }
    public int RequiredConfirmations { get; set; }
    public bool IsTestnet { get; set; }
}

// In appsettings.json
{
  "CryptoPayment": {
    "Networks": {
      "Sepolia": {
        "WalletAddress": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
        "RpcUrl": "https://sepolia.infura.io/v3/YOUR_KEY",
        "RequiredConfirmations": 6,
        "IsTestnet": true
      }
    }
  }
}
```

---

## 🧪 Testing Steps

### 1. Test Wallet Endpoint

```bash
curl https://api.wihngo.com/api/payments/crypto/wallet/ETH/sepolia \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** 200 OK with wallet address

### 2. Test Exchange Rate

```bash
curl https://api.wihngo.com/api/payments/crypto/rates/ETH
```

**Expected:** 200 OK with ETH rate

### 3. Test Payment Creation

```bash
curl -X POST https://api.wihngo.com/api/payments/crypto/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amountUsd": 11.00,
    "currency": "ETH",
    "network": "sepolia",
    "purpose": "premium_subscription",
    "plan": "monthly"
  }'
```

**Expected:** 200 OK with payment request

**If 400 Error:** Check response body for specific error message

---

## 📊 Frontend Error Handling

The frontend now shows more detailed error messages:

```typescript
// Enhanced error handling in support-modal.tsx
if (error instanceof Error && error.message.includes("400")) {
  // Shows backend error message if available
  let errorMessage = `${currency} on ${network} network is not yet supported.`;

  const apiError = error as any;
  if (apiError.data) {
    errorMessage = apiError.data.error || apiError.data.message || errorMessage;
  }

  // Shows notification with specific error
  addNotification("recommendation", "Currency Not Supported", errorMessage);
}
```

**User will see:**

- Generic message: "ETH on sepolia network is not yet supported by the backend."
- Or specific backend error: "Wallet not configured for Sepolia network"

---

## 🎯 Quick Fix Summary

**For Backend Developers:**

1. Add Sepolia to `CryptoNetwork` enum
2. Configure Sepolia wallet address: `0x4cc28f4cea7b440858b903b5c46685cb1478cdc4`
3. Add Sepolia to validation: allow `(ETH, Sepolia)` combination
4. Set up Sepolia RPC endpoint (Infura/Alchemy)
5. Test payment creation endpoint
6. Test transaction verification on Sepolia testnet

**Frontend is ready!** Just needs backend configuration.

---

## 🔗 Resources

- [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- [Sepolia Explorer](https://sepolia.etherscan.io) - View transactions
- [Infura Sepolia](https://docs.infura.io/networks/ethereum/how-to/choose-a-network) - RPC setup
- [Alchemy Sepolia](https://docs.alchemy.com/reference/ethereum-api-quickstart) - Alternative RPC

---

**Status:** Frontend ready, awaiting backend Sepolia configuration  
**Priority:** Medium (testnet only, not blocking production)  
**Workaround:** Use USDT on Tron network for testing payment flow

**Updated:** December 11, 2025
