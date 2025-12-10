# Crypto Wallet Configuration Update

## 🎯 Wihngo Platform Wallet Configuration

**Date**: December 10, 2025  
**Purpose**: Update platform wallet for TRON USDT payments

---

## 📋 Wallet Details

### Wihngo Official Wallet

- **Wallet Name**: Wihngo
- **Network**: TRON Mainnet (TronGrid)
- **Currency**: USDT (TRC-20)
- **Address**: `TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA`

---

## 🔧 Backend Implementation Steps

### 1. Update Platform Wallets Table

Add or update the TRON USDT wallet in the `platform_wallets` table:

```sql
-- Insert TRON USDT wallet into platform_wallets table
INSERT INTO platform_wallets (
    currency,
    network,
    address,
    private_key_encrypted,
    is_active,
    created_at
) VALUES (
    'USDT',
    'tron',
    'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA',
    'ENCRYPTED_PRIVATE_KEY_HERE', -- Store encrypted private key securely
    true,
    NOW()
)
ON CONFLICT (currency, network, address)
DO UPDATE SET
    is_active = true,
    address = 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA';
```

**⚠️ IMPORTANT**:

- DO NOT store the private key in plaintext
- Use strong encryption (AES-256 or similar)
- Store encryption key in secure environment variables
- Consider using a hardware security module (HSM) for production

### 2. Deactivate Old TRON USDT Wallets (if any)

```sql
-- Deactivate any other TRON USDT wallets
UPDATE platform_wallets
SET is_active = false
WHERE currency = 'USDT'
  AND network = 'tron'
  AND address != 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA';
```

### 3. Update `getPlatformWallet` Function

Ensure your backend function retrieves the active wallet:

```javascript
async function getPlatformWallet(currency, network) {
  const wallet = await db.platformWallets.findOne({
    where: {
      currency: currency,
      network: network,
      isActive: true,
    },
    order: [["created_at", "DESC"]],
  });

  if (!wallet) {
    throw new Error(`No active wallet found for ${currency} on ${network}`);
  }

  return {
    id: wallet.id,
    currency: wallet.currency,
    network: wallet.network,
    address: wallet.address,
    // DO NOT return private key in API responses
  };
}
```

### 4. Generate Payment URI (Network-Aware)

Update your payment URI generation to handle TRON:

```javascript
function generatePaymentUri(currency, network, address, amount) {
  switch (network) {
    case "tron":
      // TRON payment URI - most wallets just need the address
      // The amount will be prompted in the wallet app
      return address; // Or optionally: `tron:${address}?amount=${amount}`

    case "ethereum":
    case "polygon":
    case "binance-smart-chain":
      // EVM-compatible networks
      if (currency === "USDT" || currency === "USDC") {
        return `ethereum:${address}`;
      }
      return `ethereum:${address}?value=${amount * 1e18}`;

    case "bitcoin":
      return `bitcoin:${address}?amount=${amount}`;

    case "solana":
      return `solana:${address}?amount=${amount}`;

    default:
      return address;
  }
}
```

### 5. Verify Wallet Address Format

The TRON address should be validated:

```javascript
function validateTronAddress(address) {
  // TRON addresses start with 'T' and are 34 characters long
  const tronRegex = /^T[a-zA-Z0-9]{33}$/;
  return tronRegex.test(address);
}

// Verify the new address
const isValid = validateTronAddress("TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA");
console.log("Address valid:", isValid); // Should be true
```

---

## 🔍 Network Configuration Details

### TRON Network Settings

```javascript
const TRON_CONFIG = {
  network: "tron",
  mainnet: {
    fullNode: "https://api.trongrid.io",
    solidityNode: "https://api.trongrid.io",
    eventServer: "https://api.trongrid.io",
  },
  currency: "USDT",
  tokenType: "TRC-20",
  contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT TRC-20 contract
  decimals: 6,
  confirmationsRequired: 19, // TRON typically needs ~19 blocks (~57 seconds)
  blockTime: 3, // seconds
  minAmount: 5, // $5 minimum
};
```

### Update Supported Networks

Ensure TRON is properly configured in your crypto service:

```javascript
// Update getSupportedCryptocurrencies to include TRON for USDT
{
  code: 'USDT',
  name: 'Tether',
  symbol: '₮',
  iconName: 'dollar-sign',
  networks: ['ethereum', 'tron', 'binance-smart-chain'],
  minAmount: 5,
  confirmationsRequired: 19, // For TRON
  estimatedTime: '1-2 minutes', // TRON is fast
}
```

---

## 🧪 Testing Checklist

### Before Going Live

- [ ] Verify wallet address on [TronScan](https://tronscan.org/#/address/TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA)
- [ ] Confirm you have access to the wallet's private key (securely stored)
- [ ] Test on TRON Testnet (Nile/Shasta) first
- [ ] Create a test payment request for USDT/TRON
- [ ] Verify QR code generates correctly
- [ ] Send a small test transaction (5 USDT)
- [ ] Confirm transaction detection works
- [ ] Verify confirmation tracking (19 blocks)
- [ ] Test payment completion flow
- [ ] Verify premium activation after payment

### Test Payment Creation

```javascript
// Test creating a payment request
const testPayment = await createCryptoPayment({
  birdId: "test-bird-123",
  amountUsd: 9.99,
  currency: "USDT",
  network: "tron",
  purpose: "premium_subscription",
  plan: "monthly",
});

console.log("Wallet Address:", testPayment.paymentRequest.walletAddress);
// Should output: TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
```

---

## 🔐 Security Recommendations

### 1. Private Key Management

```bash
# Environment variables (production)
TRON_USDT_WALLET_ADDRESS=TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
TRON_USDT_PRIVATE_KEY_ENCRYPTED=<encrypted_key>
WALLET_ENCRYPTION_KEY=<strong_encryption_key>
```

### 2. TronGrid API Configuration

```bash
# Sign up for TronGrid API key at https://www.trongrid.io/
TRONGRID_API_KEY=your_api_key_here
```

### 3. Monitoring & Alerts

Set up alerts for:

- Incoming USDT transactions to this address
- Large transactions (> $1000)
- Failed transaction verifications
- Wallet balance thresholds

---

## 📡 Transaction Verification (TRON)

### Verify TRC-20 USDT Transaction

```javascript
const TronWeb = require("tronweb");

async function verifyTronUSDTTransaction(txHash) {
  try {
    const tronWeb = new TronWeb({
      fullHost: "https://api.trongrid.io",
      headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY },
    });

    // Get transaction info
    const tx = await tronWeb.trx.getTransaction(txHash);
    const txInfo = await tronWeb.trx.getTransactionInfo(txHash);

    if (!tx || !txInfo) return null;

    // Verify it's a TRC-20 transfer (USDT contract)
    const usdtContract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

    // Parse the contract result
    const contract = tx.raw_data.contract[0];
    if (contract.type !== "TriggerSmartContract") return null;

    // Get transfer details from logs
    const log = txInfo.log?.[0];
    if (!log) return null;

    // Decode amount (6 decimals for USDT)
    const amount = parseInt(log.data, 16) / 1e6;

    // Decode recipient address
    const toAddress = tronWeb.address.fromHex("41" + log.topics[2].slice(24));

    return {
      amount: amount,
      to: toAddress,
      from: tronWeb.address.fromHex(contract.parameter.value.owner_address),
      confirmations: txInfo.blockNumber
        ? (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number -
          txInfo.blockNumber +
          1
        : 0,
      blockNumber: txInfo.blockNumber,
      fee: (txInfo.fee || 0) / 1e6, // TRX
      success: txInfo.receipt?.result === "SUCCESS",
    };
  } catch (error) {
    console.error("TRON verification error:", error);
    return null;
  }
}
```

---

## 📊 Monitoring Dashboard

### Recommended Metrics to Track

1. **Total USDT Received** (on TRON network)
2. **Number of Transactions**
3. **Average Transaction Value**
4. **Failed Verifications**
5. **Pending Confirmations**
6. **Wallet Balance**

### Example Query

```sql
-- Get all successful TRON USDT payments
SELECT
    id,
    user_id,
    amount_usd,
    amount_crypto,
    transaction_hash,
    status,
    created_at,
    confirmed_at
FROM crypto_payment_requests
WHERE currency = 'USDT'
  AND network = 'tron'
  AND wallet_address = 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA'
  AND status IN ('confirmed', 'completed')
ORDER BY created_at DESC;
```

---

## 🚀 Deployment Steps

### 1. Staging Environment

1. Update staging database with new wallet
2. Deploy backend changes
3. Test payment flow end-to-end
4. Verify transaction detection
5. Check premium activation

### 2. Production Deployment

1. **Backup current database**
2. Run SQL migration to add/update wallet
3. Deploy backend changes
4. Verify wallet is active
5. Monitor first few transactions closely
6. Send test transaction to confirm everything works

### 3. Rollback Plan

If issues occur:

```sql
-- Reactivate old wallet (if needed)
UPDATE platform_wallets
SET is_active = true
WHERE currency = 'USDT'
  AND network = 'tron'
  AND address = 'OLD_WALLET_ADDRESS_HERE';

-- Deactivate new wallet
UPDATE platform_wallets
SET is_active = false
WHERE currency = 'USDT'
  AND network = 'tron'
  AND address = 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA';
```

---

## 📞 Support & Resources

### TRON Resources

- **TronScan Explorer**: https://tronscan.org/
- **TronGrid API**: https://www.trongrid.io/
- **USDT Contract**: https://tronscan.org/#/contract/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
- **TronWeb Documentation**: https://developers.tron.network/docs

### Verify New Wallet

- **Address**: https://tronscan.org/#/address/TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
- **Network**: TRON Mainnet
- **Token**: USDT (TRC-20)

---

## ✅ Completion Checklist

- [ ] Wallet address verified on TronScan
- [ ] Private key securely encrypted and stored
- [ ] Database migration script prepared
- [ ] Backend code updated
- [ ] Transaction verification function tested
- [ ] Testnet testing completed
- [ ] Staging deployment successful
- [ ] Production backup created
- [ ] Production deployment scheduled
- [ ] Monitoring dashboard configured
- [ ] Team trained on new wallet management
- [ ] Documentation updated
- [ ] First test transaction confirmed

---

## 📝 Notes

- TRON network is significantly faster than Ethereum (3-second blocks vs 12-second blocks)
- TRON USDT (TRC-20) has lower fees than Ethereum USDT (ERC-20)
- Require 19 confirmations (~57 seconds) for security
- USDT on TRON uses 6 decimal places
- Monitor TRX balance for energy/bandwidth fees (should maintain small TRX balance)

---

**Updated**: December 10, 2025  
**Wallet Owner**: Wihngo  
**Network**: TRON Mainnet  
**Currency**: USDT (TRC-20)  
**Address**: `TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA`
