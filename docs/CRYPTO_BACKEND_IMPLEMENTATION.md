# Backend API Implementation Guide for Crypto Payments

This guide provides complete backend implementation requirements for the cryptocurrency payment system.

## Overview

The backend must handle:

- Payment request creation
- Exchange rate management
- Blockchain monitoring
- Transaction verification
- Payment confirmation
- Wallet management

## Technology Stack Recommendations

### Blockchain Integration

- **Bitcoin**: `bitcoinjs-lib` or blockchain.info API
- **Ethereum**: `web3.js` or `ethers.js`
- **Multi-chain**: Moralis API, Alchemy, Infura
- **Exchange Rates**: CoinGecko API, CoinMarketCap API

### Payment Processing

- **Crypto Gateway**: NOWPayments, CoinPayments, BTCPay Server
- **Wallet Management**: HD wallets with BIP44
- **Database**: PostgreSQL with JSONB for transaction data

## Database Schema

### Tables

```sql
-- Crypto Payment Requests
CREATE TABLE crypto_payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bird_id UUID REFERENCES birds(id),

    -- Amount details
    amount_usd DECIMAL(10, 2) NOT NULL,
    amount_crypto DECIMAL(20, 10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    exchange_rate DECIMAL(20, 2) NOT NULL,

    -- Payment details
    wallet_address VARCHAR(255) NOT NULL,
    user_wallet_address VARCHAR(255),
    qr_code_data TEXT NOT NULL,
    payment_uri TEXT NOT NULL,

    -- Transaction details
    transaction_hash VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    purpose VARCHAR(50) NOT NULL,

    -- Timestamps
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirming', 'confirmed', 'completed', 'expired', 'failed', 'refunded')),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_created_at (created_at)
);

-- Crypto Transactions
CREATE TABLE crypto_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID NOT NULL REFERENCES crypto_payment_requests(id),

    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,

    confirmations INTEGER DEFAULT 0,
    block_number BIGINT,
    fee DECIMAL(20, 10),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    detected_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,

    INDEX idx_payment_request (payment_request_id),
    INDEX idx_hash (transaction_hash),
    INDEX idx_status (status)
);

-- Saved Crypto Wallets
CREATE TABLE crypto_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    wallet_address VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    label VARCHAR(100),

    is_default BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, wallet_address, currency, network),
    INDEX idx_user_id (user_id)
);

-- Exchange Rates Cache
CREATE TABLE crypto_exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL UNIQUE,
    usd_rate DECIMAL(20, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW(),

    INDEX idx_currency (currency),
    INDEX idx_updated (last_updated)
);

-- Platform Wallets (for receiving payments)
CREATE TABLE platform_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    private_key_encrypted TEXT NOT NULL, -- Encrypted!
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (currency, network, address)
);
```

## API Endpoints Implementation

### 1. Create Payment Request

```javascript
// POST /api/payments/crypto/create
async function createCryptoPayment(req, res) {
  const { birdId, amountUsd, currency, network, purpose, plan } = req.body;
  const userId = req.user.id;

  try {
    // Validate inputs
    if (amountUsd < getMinAmount(currency)) {
      return res.status(400).json({
        error: `Minimum amount for ${currency} is $${getMinAmount(currency)}`,
      });
    }

    // Get exchange rate
    const rate = await getExchangeRate(currency);
    const amountCrypto = amountUsd / rate.usdRate;

    // Get platform wallet for this currency/network
    const wallet = await getPlatformWallet(currency, network);

    // Generate payment URI
    const paymentUri = generatePaymentUri(
      currency,
      wallet.address,
      amountCrypto
    );
    const qrCodeData = paymentUri;

    // Create payment request
    const payment = await db.cryptoPaymentRequests.create({
      userId,
      birdId,
      amountUsd,
      amountCrypto,
      currency,
      network,
      exchangeRate: rate.usdRate,
      walletAddress: wallet.address,
      qrCodeData,
      paymentUri,
      requiredConfirmations: getRequiredConfirmations(currency, network),
      status: "pending",
      purpose,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // Start monitoring for this payment
    startPaymentMonitoring(payment.id);

    res.json({
      paymentRequest: payment,
      message: "Payment request created successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Failed to create payment request" });
  }
}
```

### 2. Get Payment Status

```javascript
// GET /api/payments/crypto/:paymentId
async function getPaymentStatus(req, res) {
  const { paymentId } = req.params;
  const userId = req.user.id;

  try {
    const payment = await db.cryptoPaymentRequests.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if expired
    if (payment.status === "pending" && new Date() > payment.expiresAt) {
      payment.status = "expired";
      await payment.save();
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to get payment" });
  }
}
```

### 3. Verify Payment

```javascript
// POST /api/payments/crypto/:paymentId/verify
async function verifyPayment(req, res) {
  const { paymentId } = req.params;
  const { transactionHash, userWalletAddress } = req.body;
  const userId = req.user.id;

  try {
    const payment = await db.cryptoPaymentRequests.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Verify transaction on blockchain
    const txInfo = await verifyBlockchainTransaction(
      transactionHash,
      payment.currency,
      payment.network
    );

    if (!txInfo) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    // Verify amount and recipient
    if (txInfo.amount < payment.amountCrypto * 0.99) {
      // 1% tolerance
      return res.status(400).json({ error: "Incorrect amount" });
    }

    if (txInfo.to.toLowerCase() !== payment.walletAddress.toLowerCase()) {
      return res.status(400).json({ error: "Incorrect recipient address" });
    }

    // Update payment
    payment.transactionHash = transactionHash;
    payment.userWalletAddress = userWalletAddress || txInfo.from;
    payment.confirmations = txInfo.confirmations;
    payment.status =
      txInfo.confirmations >= payment.requiredConfirmations
        ? "confirmed"
        : "confirming";

    if (payment.status === "confirmed") {
      payment.confirmedAt = new Date();
      await completePayment(payment);
    }

    await payment.save();

    // Create transaction record
    await db.cryptoTransactions.create({
      paymentRequestId: payment.id,
      transactionHash,
      fromAddress: txInfo.from,
      toAddress: txInfo.to,
      amount: txInfo.amount,
      currency: payment.currency,
      network: payment.network,
      confirmations: txInfo.confirmations,
      blockNumber: txInfo.blockNumber,
      fee: txInfo.fee,
      status: txInfo.confirmations > 0 ? "confirmed" : "pending",
    });

    res.json(payment);
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
}
```

### 4. Exchange Rates

```javascript
// GET /api/payments/crypto/rates
async function getExchangeRates(req, res) {
  try {
    const rates = await db.cryptoExchangeRates.findAll();

    // Refresh if older than 5 minutes
    const needsRefresh = rates.some(
      (r) => Date.now() - r.lastUpdated > 5 * 60 * 1000
    );

    if (needsRefresh) {
      await refreshExchangeRates();
      return res.json(await db.cryptoExchangeRates.findAll());
    }

    res.json(rates);
  } catch (error) {
    console.error("Get rates error:", error);
    res.status(500).json({ error: "Failed to get exchange rates" });
  }
}

// GET /api/payments/crypto/rates/:currency
async function getExchangeRate(req, res) {
  const { currency } = req.params;

  try {
    let rate = await db.cryptoExchangeRates.findOne({
      where: { currency: currency.toUpperCase() },
    });

    // Refresh if older than 5 minutes
    if (!rate || Date.now() - rate.lastUpdated > 5 * 60 * 1000) {
      await refreshExchangeRate(currency);
      rate = await db.cryptoExchangeRates.findOne({
        where: { currency: currency.toUpperCase() },
      });
    }

    res.json(rate);
  } catch (error) {
    console.error("Get rate error:", error);
    res.status(500).json({ error: "Failed to get exchange rate" });
  }
}
```

### 5. Saved Wallets

```javascript
// GET /api/payments/crypto/wallets
async function getSavedWallets(req, res) {
  const userId = req.user.id;

  try {
    const wallets = await db.cryptoPaymentMethods.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(wallets);
  } catch (error) {
    console.error("Get wallets error:", error);
    res.status(500).json({ error: "Failed to get wallets" });
  }
}

// POST /api/payments/crypto/wallets
async function saveWallet(req, res) {
  const userId = req.user.id;
  const { walletAddress, currency, network, label } = req.body;

  try {
    // Validate address
    if (!validateWalletAddress(walletAddress, currency)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const wallet = await db.cryptoPaymentMethods.create({
      userId,
      walletAddress,
      currency,
      network,
      label,
    });

    res.json(wallet);
  } catch (error) {
    console.error("Save wallet error:", error);
    res.status(500).json({ error: "Failed to save wallet" });
  }
}

// DELETE /api/payments/crypto/wallets/:walletId
async function removeWallet(req, res) {
  const userId = req.user.id;
  const { walletId } = req.params;

  try {
    await db.cryptoPaymentMethods.destroy({
      where: { id: walletId, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Remove wallet error:", error);
    res.status(500).json({ error: "Failed to remove wallet" });
  }
}
```

## Blockchain Integration

### Bitcoin

```javascript
const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");

async function verifyBitcoinTransaction(txHash) {
  try {
    const response = await axios.get(`https://blockchain.info/rawtx/${txHash}`);

    const tx = response.data;

    return {
      amount: tx.out[0].value / 100000000, // Satoshis to BTC
      to: tx.out[0].addr,
      from: tx.inputs[0].prev_out.addr,
      confirmations: tx.block_height
        ? (await getCurrentBlockHeight()) - tx.block_height + 1
        : 0,
      blockNumber: tx.block_height,
      fee: tx.fee / 100000000,
    };
  } catch (error) {
    console.error("Bitcoin verification error:", error);
    return null;
  }
}
```

### Ethereum & ERC-20 Tokens

```javascript
const { ethers } = require("ethers");

async function verifyEthereumTransaction(txHash, network = "ethereum") {
  try {
    const provider = new ethers.providers.InfuraProvider(
      network,
      process.env.INFURA_API_KEY
    );

    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx || !receipt) return null;

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    return {
      amount: parseFloat(ethers.utils.formatEther(tx.value)),
      to: tx.to,
      from: tx.from,
      confirmations,
      blockNumber: receipt.blockNumber,
      fee: parseFloat(
        ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))
      ),
    };
  } catch (error) {
    console.error("Ethereum verification error:", error);
    return null;
  }
}

async function verifyERC20Transaction(txHash, tokenAddress) {
  try {
    const provider = new ethers.providers.InfuraProvider(
      "mainnet",
      process.env.INFURA_API_KEY
    );

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) return null;

    // Parse Transfer event
    const transferEvent = receipt.logs.find(
      (log) =>
        log.topics[0] === ethers.utils.id("Transfer(address,address,uint256)")
    );

    if (!transferEvent) return null;

    const amount = ethers.BigNumber.from(transferEvent.data);
    const decimals = 6; // USDT/USDC typically use 6 decimals

    return {
      amount: parseFloat(ethers.utils.formatUnits(amount, decimals)),
      to: "0x" + transferEvent.topics[2].slice(26),
      from: "0x" + transferEvent.topics[1].slice(26),
      confirmations:
        (await provider.getBlockNumber()) - receipt.blockNumber + 1,
      blockNumber: receipt.blockNumber,
      fee: 0, // Fee paid in ETH, not token
    };
  } catch (error) {
    console.error("ERC20 verification error:", error);
    return null;
  }
}
```

## Payment Monitoring

### Background Worker

```javascript
const cron = require("node-cron");

// Run every minute
cron.schedule("* * * * *", async () => {
  await monitorPendingPayments();
});

async function monitorPendingPayments() {
  try {
    // Get all pending and confirming payments
    const payments = await db.cryptoPaymentRequests.findAll({
      where: {
        status: ["pending", "confirming"],
        expiresAt: { $gt: new Date() },
      },
    });

    for (const payment of payments) {
      await checkPaymentStatus(payment);
    }

    // Expire old payments
    await db.cryptoPaymentRequests.update(
      { status: "expired" },
      {
        where: {
          status: "pending",
          expiresAt: { $lt: new Date() },
        },
      }
    );
  } catch (error) {
    console.error("Monitor payments error:", error);
  }
}

async function checkPaymentStatus(payment) {
  try {
    if (payment.transactionHash) {
      // Already have transaction, check confirmations
      const txInfo = await verifyBlockchainTransaction(
        payment.transactionHash,
        payment.currency,
        payment.network
      );

      if (txInfo) {
        payment.confirmations = txInfo.confirmations;

        if (txInfo.confirmations >= payment.requiredConfirmations) {
          payment.status = "confirmed";
          payment.confirmedAt = new Date();
          await completePayment(payment);
        } else {
          payment.status = "confirming";
        }

        await payment.save();
      }
    } else {
      // Look for incoming transactions to our wallet
      const incomingTxs = await getIncomingTransactions(
        payment.walletAddress,
        payment.currency,
        payment.network
      );

      // Find matching transaction
      const matchingTx = incomingTxs.find(
        (tx) =>
          tx.amount >= payment.amountCrypto * 0.99 && // 1% tolerance
          tx.timestamp >= payment.createdAt
      );

      if (matchingTx) {
        payment.transactionHash = matchingTx.hash;
        payment.confirmations = matchingTx.confirmations;
        payment.status = "confirming";
        await payment.save();

        // Create transaction record
        await db.cryptoTransactions.create({
          paymentRequestId: payment.id,
          transactionHash: matchingTx.hash,
          fromAddress: matchingTx.from,
          toAddress: matchingTx.to,
          amount: matchingTx.amount,
          currency: payment.currency,
          network: payment.network,
          confirmations: matchingTx.confirmations,
          blockNumber: matchingTx.blockNumber,
        });
      }
    }
  } catch (error) {
    console.error("Check payment status error:", error);
  }
}
```

## Complete Payment

```javascript
async function completePayment(payment) {
  try {
    // Update payment status
    payment.status = "completed";
    payment.completedAt = new Date();
    await payment.save();

    // Process based on purpose
    if (payment.purpose === "premium_subscription") {
      // Activate premium subscription
      await activatePremiumSubscription(payment);
    } else if (payment.purpose === "donation") {
      // Record donation
      await recordDonation(payment);
    }

    // Send confirmation email/notification
    await sendPaymentConfirmation(payment);

    console.log(`Payment ${payment.id} completed successfully`);
  } catch (error) {
    console.error("Complete payment error:", error);
    // Mark as failed but keep transaction record
    payment.status = "failed";
    await payment.save();
  }
}

async function activatePremiumSubscription(payment) {
  const { birdId, userId } = payment;

  // Create premium subscription record
  await db.birdPremiumSubscriptions.create({
    birdId,
    ownerId: userId,
    status: "active",
    plan: payment.plan || "lifetime",
    provider: "crypto",
    providerSubscriptionId: payment.transactionHash,
    startedAt: new Date(),
    currentPeriodEnd: calculatePeriodEnd(payment.plan),
  });

  // Update bird premium status
  await db.birds.update({ isPremium: true }, { where: { id: birdId } });
}
```

## Exchange Rate Management

```javascript
const axios = require("axios");

async function refreshExchangeRates() {
  try {
    // Using CoinGecko API (free tier)
    const currencies = [
      "bitcoin",
      "ethereum",
      "tether",
      "usd-coin",
      "binancecoin",
      "solana",
      "dogecoin",
    ];

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: currencies.join(","),
          vs_currencies: "usd",
        },
      }
    );

    const mapping = {
      bitcoin: "BTC",
      ethereum: "ETH",
      tether: "USDT",
      "usd-coin": "USDC",
      binancecoin: "BNB",
      solana: "SOL",
      dogecoin: "DOGE",
    };

    for (const [coinId, code] of Object.entries(mapping)) {
      await db.cryptoExchangeRates.upsert({
        currency: code,
        usdRate: response.data[coinId].usd,
        source: "coingecko",
        lastUpdated: new Date(),
      });
    }

    console.log("Exchange rates refreshed successfully");
  } catch (error) {
    console.error("Refresh rates error:", error);
  }
}

// Run every 5 minutes
cron.schedule("*/5 * * * *", refreshExchangeRates);
```

## Security Best Practices

1. **Encrypt Private Keys**: Never store private keys in plaintext
2. **Use HD Wallets**: Generate unique addresses for each payment
3. **Rate Limiting**: Prevent API abuse
4. **Transaction Verification**: Always verify on blockchain
5. **Amount Tolerance**: Allow small discrepancies (1-2%)
6. **Expiration**: Auto-expire stale payment requests
7. **Logging**: Log all payment events for audit
8. **Webhook Security**: Verify webhook signatures
9. **Database Security**: Use prepared statements, encrypt sensitive data
10. **API Key Management**: Rotate API keys regularly

## Deployment Checklist

- [ ] Set up blockchain node or API provider (Infura, Alchemy)
- [ ] Create platform wallets for each currency/network
- [ ] Encrypt and securely store private keys
- [ ] Set up cron jobs for monitoring and rate updates
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Test with testnet first
- [ ] Set minimum payment amounts
- [ ] Configure confirmation requirements
- [ ] Set up email notifications
- [ ] Create admin dashboard for monitoring
- [ ] Set up backup and disaster recovery
- [ ] Configure webhooks (if using payment gateway)
- [ ] Test all edge cases

## Monitoring & Alerts

Set up alerts for:

- Failed payment verifications
- Stuck transactions
- Exchange rate API failures
- Database errors
- Unusual payment patterns
- Large transactions
- Multiple failed attempts

## Cost Considerations

- API calls to blockchain providers
- Transaction fees (gas)
- Exchange rate API costs
- Database storage
- Server resources for monitoring

Plan for approximately $100-500/month depending on volume.
