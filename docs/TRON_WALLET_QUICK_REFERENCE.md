# TRON Wallet Quick Reference

## 🏦 Wihngo Official TRON Wallet

### Wallet Information

```
Wallet Name:    Wihngo
Network:        TRON Mainnet (TronGrid)
Currency:       USDT (TRC-20)
Address:        TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
```

### Verify on Blockchain

🔗 **TronScan**: https://tronscan.org/#/address/TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA

---

## 📋 Quick Facts

| Parameter                  | Value                                |
| -------------------------- | ------------------------------------ |
| **Network**                | TRON Mainnet                         |
| **Token Standard**         | TRC-20                               |
| **Token**                  | USDT                                 |
| **Contract Address**       | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |
| **Decimals**               | 6                                    |
| **Block Time**             | ~3 seconds                           |
| **Confirmations Required** | 19 blocks (~57 seconds)              |
| **Min Payment**            | $5 USD                               |
| **Typical Fee**            | 0-5 TRX (~$0-$0.50)                  |

---

## 🔧 Backend Implementation

### Database Entry

```sql
INSERT INTO platform_wallets (currency, network, address, is_active)
VALUES ('USDT', 'tron', 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA', true);
```

### Validation (JavaScript)

```javascript
// Validate TRON address format
const isValidTronAddress = /^T[a-zA-Z0-9]{33}$/.test(
  "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA"
);
// Returns: true
```

### Network Configuration

```javascript
const TRON_USDT = {
  network: "tron",
  currency: "USDT",
  address: "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
  contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  decimals: 6,
  confirmations: 19,
  blockTime: 3,
};
```

---

## 🧪 Testing

### Test Transaction

1. Send small amount (5-10 USDT) to test address
2. Check on TronScan: https://tronscan.org/
3. Verify transaction appears in backend
4. Confirm 19 blocks are tracked
5. Verify payment completion

### TronGrid API

```javascript
// Get transaction info
const url = `https://api.trongrid.io/v1/transactions/${txHash}`;
const headers = { "TRON-PRO-API-KEY": "your_api_key" };
```

---

## 🔐 Security

### ✅ DO

- ✅ Encrypt private key with AES-256
- ✅ Store encryption key in secure vault
- ✅ Use TronGrid API key
- ✅ Validate all incoming transactions
- ✅ Monitor wallet balance
- ✅ Set up alerts for large transactions

### ❌ DON'T

- ❌ Store private key in plaintext
- ❌ Expose private key in API responses
- ❌ Share private key in logs
- ❌ Hardcode credentials

---

## 📊 Monitoring

### Key Metrics

- Total USDT received on TRON
- Number of transactions per day
- Average confirmation time
- Failed transaction rate
- Current wallet balance

### Useful Queries

```sql
-- Recent TRON USDT payments
SELECT * FROM crypto_payment_requests
WHERE currency = 'USDT' AND network = 'tron'
ORDER BY created_at DESC LIMIT 10;

-- Total received today
SELECT SUM(amount_crypto) as total_usdt
FROM crypto_payment_requests
WHERE currency = 'USDT'
  AND network = 'tron'
  AND status = 'completed'
  AND DATE(created_at) = CURRENT_DATE;
```

---

## 🚨 Troubleshooting

### Transaction Not Detected

1. Verify correct network (TRON, not Ethereum)
2. Check transaction on TronScan
3. Ensure sufficient energy/bandwidth on wallet
4. Verify API key is valid
5. Check backend monitoring logs

### Wrong Network

- User sent ERC-20 USDT instead of TRC-20
- Different wallet address on Ethereum
- Funds may be lost if sent to wrong network

### Low Confirmations

- TRON needs 19 confirmations
- Takes approximately 57 seconds (19 × 3 seconds)
- Network congestion may slow this down

---

## 📞 Resources

### TRON Network

- **TronScan Explorer**: https://tronscan.org/
- **TronGrid API**: https://www.trongrid.io/
- **USDT Contract**: https://tronscan.org/#/contract/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
- **TronWeb Docs**: https://developers.tron.network/docs

### Wihngo Wallet

- **Address**: `TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA`
- **Explorer**: https://tronscan.org/#/address/TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
- **Network**: TRON Mainnet

---

## 📝 Frontend Updates

### Already Implemented ✅

- ✅ TRON network support in types (`CryptoNetwork` includes `"tron"`)
- ✅ TRON address validation updated
- ✅ Network selector shows "Tron (TRC-20)"
- ✅ USDT supports TRON network in currency selector
- ✅ QR code generation for TRON addresses

### Configuration

No frontend changes needed! The frontend already supports:

- Selecting USDT as currency
- Selecting TRON as network
- Displaying the correct wallet address
- Generating QR codes for payments

---

## ⚡ Why TRON?

### Advantages

- **Fast**: 3-second block time vs Ethereum's 12 seconds
- **Low Fees**: $0-$0.50 vs Ethereum's $1-$50
- **Popular**: Widely used for USDT transfers
- **Simple**: Easy integration and monitoring

### Comparison

| Feature       | TRON (TRC-20) | Ethereum (ERC-20) | BSC (BEP-20) |
| ------------- | ------------- | ----------------- | ------------ |
| Block Time    | 3 sec         | 12 sec            | 3 sec        |
| Confirmations | 19            | 12                | 15           |
| Total Time    | ~57 sec       | ~2.4 min          | ~45 sec      |
| Typical Fee   | $0-$0.50      | $1-$50            | $0.10-$1     |
| USDT Volume   | Very High     | High              | Medium       |

---

**Last Updated**: December 10, 2025  
**Wallet Owner**: Wihngo  
**For**: Premium subscriptions and donations  
**Status**: Ready for implementation ✅
