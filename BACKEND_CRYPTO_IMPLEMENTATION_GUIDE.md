# Backend Crypto Payment Implementation Guide

**For**: GitHub Copilot / Claude Sonnet 4.5  
**Project**: Wihngo - Bird Premium Subscriptions  
**Date**: December 10, 2025

---

## 🎯 Implementation Overview

Implement a complete cryptocurrency payment backend for Wihngo that:

1. Accepts USDT payments on TRON network (primary)
2. Supports Bitcoin, Ethereum, and other cryptocurrencies
3. Verifies transactions on blockchain
4. Activates premium subscriptions upon payment confirmation
5. Manages exchange rates and wallet addresses

**Primary Wallet**:

- **Network**: TRON Mainnet
- **Currency**: USDT (TRC-20)
- **Address**: `TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA`

---

## 📋 Tech Stack Requirements

### Node.js Backend (Express.js recommended)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "sequelize": "^6.35.0",
    "axios": "^1.6.0",
    "tronweb": "^5.3.0",
    "ethers": "^6.9.0",
    "bitcoinjs-lib": "^6.1.0",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### Database

PostgreSQL 14+ (required for JSONB support)

---

## 🗄️ Database Schema

Create these tables in your PostgreSQL database:

### 1. Platform Wallets Table

```sql
CREATE TABLE platform_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    private_key_encrypted TEXT, -- Encrypted! NULL for watch-only wallets
    derivation_path VARCHAR(100), -- For HD wallets
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (currency, network, address),
    INDEX idx_active_wallets (currency, network, is_active)
);

-- Insert the TRON USDT wallet
INSERT INTO platform_wallets (currency, network, address, is_active)
VALUES ('USDT', 'tron', 'TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA', true);

-- Add other wallets as needed
INSERT INTO platform_wallets (currency, network, address, is_active)
VALUES
    ('BTC', 'bitcoin', 'YOUR_BTC_ADDRESS_HERE', true),
    ('ETH', 'ethereum', 'YOUR_ETH_ADDRESS_HERE', true),
    ('USDT', 'ethereum', 'YOUR_ETH_ADDRESS_HERE', true),
    ('USDT', 'binance-smart-chain', 'YOUR_BSC_ADDRESS_HERE', true);
```

### 2. Crypto Payment Requests Table

```sql
CREATE TABLE crypto_payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bird_id UUID REFERENCES birds(id) ON DELETE SET NULL,

    -- Amount details
    amount_usd DECIMAL(10, 2) NOT NULL,
    amount_crypto DECIMAL(20, 10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    exchange_rate DECIMAL(20, 2) NOT NULL,

    -- Payment details
    wallet_address VARCHAR(255) NOT NULL, -- Our receiving address
    user_wallet_address VARCHAR(255), -- User's sending address
    qr_code_data TEXT NOT NULL,
    payment_uri TEXT NOT NULL,

    -- Transaction details
    transaction_hash VARCHAR(255) UNIQUE,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER NOT NULL,

    -- Status and purpose
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    purpose VARCHAR(50) NOT NULL,
    plan VARCHAR(20), -- monthly, yearly, lifetime

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirming', 'confirmed', 'completed', 'expired', 'failed', 'refunded')),
    CONSTRAINT valid_purpose CHECK (purpose IN ('premium_subscription', 'donation', 'purchase')),

    INDEX idx_user_payments (user_id, created_at DESC),
    INDEX idx_status (status),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_expires_at (expires_at)
);
```

### 3. Crypto Transactions Table

```sql
CREATE TABLE crypto_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID NOT NULL REFERENCES crypto_payment_requests(id) ON DELETE CASCADE,

    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,

    confirmations INTEGER DEFAULT 0,
    block_number BIGINT,
    block_hash VARCHAR(255),
    fee DECIMAL(20, 10),
    gas_used BIGINT,

    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    raw_transaction JSONB, -- Store full transaction data

    detected_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,

    INDEX idx_payment_request (payment_request_id),
    INDEX idx_hash (transaction_hash),
    INDEX idx_status (status)
);
```

### 4. Crypto Exchange Rates Table

```sql
CREATE TABLE crypto_exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL UNIQUE,
    usd_rate DECIMAL(20, 2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'coingecko',
    last_updated TIMESTAMP DEFAULT NOW(),

    INDEX idx_currency (currency),
    INDEX idx_updated (last_updated)
);

-- Initialize with placeholder rates (will be updated by cron)
INSERT INTO crypto_exchange_rates (currency, usd_rate, source) VALUES
    ('BTC', 50000.00, 'coingecko'),
    ('ETH', 3000.00, 'coingecko'),
    ('USDT', 1.00, 'coingecko'),
    ('USDC', 1.00, 'coingecko'),
    ('BNB', 500.00, 'coingecko'),
    ('SOL', 100.00, 'coingecko'),
    ('DOGE', 0.10, 'coingecko');
```

### 5. Crypto Payment Methods Table (User's Saved Wallets)

```sql
CREATE TABLE crypto_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    wallet_address VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    label VARCHAR(100),

    is_default BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, wallet_address, currency, network),
    INDEX idx_user_wallets (user_id)
);
```

---

## 🔑 Environment Variables

Create a `.env` file with these variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wihngo

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# API Keys - Blockchain Providers
TRONGRID_API_KEY=your-trongrid-api-key
INFURA_API_KEY=your-infura-api-key
ALCHEMY_API_KEY=your-alchemy-api-key
QUICKNODE_ENDPOINT=your-quicknode-endpoint

# Exchange Rates
COINGECKO_API_KEY=your-coingecko-api-key

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key-for-private-keys

# App Configuration
PORT=3000
NODE_ENV=production
API_BASE_URL=https://api.wihngo.com

# Wallet Configuration
TRON_USDT_WALLET=TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA
BTC_WALLET=your-btc-address
ETH_WALLET=your-eth-address

# Payment Settings
PAYMENT_EXPIRATION_MINUTES=30
MIN_PAYMENT_AMOUNT_USD=5
```

---

## 📡 API Endpoints to Implement

### Base URL: `/api/payments/crypto`

### 1. Create Payment Request

```javascript
/**
 * POST /api/payments/crypto/create
 * Create a new crypto payment request
 *
 * Request Body:
 * {
 *   birdId: string (optional),
 *   amountUsd: number,
 *   currency: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'BNB' | 'SOL' | 'DOGE',
 *   network: 'bitcoin' | 'ethereum' | 'tron' | 'binance-smart-chain' | 'solana' | 'polygon',
 *   purpose: 'premium_subscription' | 'donation' | 'purchase',
 *   plan?: 'monthly' | 'yearly' | 'lifetime'
 * }
 *
 * Response: CryptoPaymentResponse
 */

const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const cryptoService = require("../services/crypto.service");

router.post("/create", authenticateUser, async (req, res) => {
  try {
    const { birdId, amountUsd, currency, network, purpose, plan } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!amountUsd || !currency || !network || !purpose) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (amountUsd < parseFloat(process.env.MIN_PAYMENT_AMOUNT_USD || 5)) {
      return res.status(400).json({
        error: `Minimum payment amount is $${
          process.env.MIN_PAYMENT_AMOUNT_USD || 5
        }`,
      });
    }

    // Create payment request
    const paymentRequest = await cryptoService.createPaymentRequest({
      userId,
      birdId,
      amountUsd,
      currency,
      network,
      purpose,
      plan,
    });

    res.json({
      paymentRequest,
      message: "Payment request created successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create payment request" });
  }
});
```

### 2. Get Payment Status

```javascript
/**
 * GET /api/payments/crypto/:paymentId
 * Get payment request details and status
 */

router.get("/:paymentId", authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await cryptoService.getPaymentRequest(paymentId, userId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to get payment" });
  }
});
```

### 3. Verify Payment

```javascript
/**
 * POST /api/payments/crypto/:paymentId/verify
 * Verify a transaction hash for a payment
 *
 * Request Body:
 * {
 *   transactionHash: string,
 *   userWalletAddress?: string
 * }
 */

router.post("/:paymentId/verify", authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionHash, userWalletAddress } = req.body;
    const userId = req.user.id;

    if (!transactionHash) {
      return res.status(400).json({ error: "Transaction hash is required" });
    }

    const payment = await cryptoService.verifyPayment(
      paymentId,
      userId,
      transactionHash,
      userWalletAddress
    );

    res.json(payment);
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to verify payment" });
  }
});
```

### 4. Get Exchange Rates

```javascript
/**
 * GET /api/payments/crypto/rates
 * Get all current exchange rates
 */

router.get("/rates", async (req, res) => {
  try {
    const rates = await cryptoService.getExchangeRates();
    res.json(rates);
  } catch (error) {
    console.error("Get rates error:", error);
    res.status(500).json({ error: "Failed to get exchange rates" });
  }
});

/**
 * GET /api/payments/crypto/rates/:currency
 * Get exchange rate for specific currency
 */

router.get("/rates/:currency", async (req, res) => {
  try {
    const { currency } = req.params;
    const rate = await cryptoService.getExchangeRate(currency.toUpperCase());

    if (!rate) {
      return res.status(404).json({ error: "Currency not found" });
    }

    res.json(rate);
  } catch (error) {
    console.error("Get rate error:", error);
    res.status(500).json({ error: "Failed to get exchange rate" });
  }
});
```

### 5. Get Platform Wallet

```javascript
/**
 * GET /api/payments/crypto/wallet/:currency/:network
 * Get platform wallet address for receiving payments
 */

router.get("/wallet/:currency/:network", async (req, res) => {
  try {
    const { currency, network } = req.params;

    const wallet = await cryptoService.getPlatformWallet(
      currency.toUpperCase(),
      network.toLowerCase()
    );

    if (!wallet) {
      return res.status(404).json({
        error: `No wallet configured for ${currency} on ${network}`,
      });
    }

    res.json({
      currency: wallet.currency,
      network: wallet.network,
      address: wallet.address,
      qrCode: wallet.address, // QR code data
      isActive: wallet.is_active,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ error: "Failed to get wallet info" });
  }
});
```

### 6. Payment History

```javascript
/**
 * GET /api/payments/crypto/history
 * Get user's payment history with pagination
 */

router.get("/history", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const history = await cryptoService.getPaymentHistory(
      userId,
      page,
      pageSize
    );

    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get payment history" });
  }
});
```

### 7. Saved Wallets Management

```javascript
/**
 * GET /api/payments/crypto/wallets
 * Get user's saved crypto wallets
 */

router.get("/wallets", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const wallets = await cryptoService.getSavedWallets(userId);
    res.json(wallets);
  } catch (error) {
    console.error("Get wallets error:", error);
    res.status(500).json({ error: "Failed to get wallets" });
  }
});

/**
 * POST /api/payments/crypto/wallets
 * Save a new crypto wallet
 */

router.post("/wallets", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletAddress, currency, network, label } = req.body;

    const wallet = await cryptoService.saveWallet(userId, {
      walletAddress,
      currency,
      network,
      label,
    });

    res.json(wallet);
  } catch (error) {
    console.error("Save wallet error:", error);
    res.status(500).json({ error: error.message || "Failed to save wallet" });
  }
});

/**
 * DELETE /api/payments/crypto/wallets/:walletId
 * Remove a saved wallet
 */

router.delete("/wallets/:walletId", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletId } = req.params;

    await cryptoService.removeWallet(userId, walletId);
    res.json({ message: "Wallet removed successfully" });
  } catch (error) {
    console.error("Remove wallet error:", error);
    res.status(500).json({ error: "Failed to remove wallet" });
  }
});

/**
 * PATCH /api/payments/crypto/wallets/:walletId/default
 * Set a wallet as default
 */

router.patch(
  "/wallets/:walletId/default",
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { walletId } = req.params;

      const wallet = await cryptoService.setDefaultWallet(userId, walletId);
      res.json(wallet);
    } catch (error) {
      console.error("Set default wallet error:", error);
      res.status(500).json({ error: "Failed to set default wallet" });
    }
  }
);

module.exports = router;
```

---

## 🔧 Service Layer Implementation

Create `services/crypto.service.js`:

```javascript
const { Op } = require("sequelize");
const axios = require("axios");
const TronWeb = require("tronweb");
const { ethers } = require("ethers");
const db = require("../models");

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY },
});

// Network configurations
const NETWORK_CONFIG = {
  tron: {
    confirmations: 19,
    blockTime: 3,
    explorer: "https://tronscan.org",
  },
  ethereum: {
    confirmations: 12,
    blockTime: 12,
    explorer: "https://etherscan.io",
  },
  bitcoin: {
    confirmations: 2,
    blockTime: 600,
    explorer: "https://blockchain.info",
  },
  "binance-smart-chain": {
    confirmations: 15,
    blockTime: 3,
    explorer: "https://bscscan.com",
  },
  polygon: {
    confirmations: 128,
    blockTime: 2,
    explorer: "https://polygonscan.com",
  },
  solana: {
    confirmations: 32,
    blockTime: 0.4,
    explorer: "https://solscan.io",
  },
};

// USDT contract addresses
const USDT_CONTRACTS = {
  ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  tron: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "binance-smart-chain": "0x55d398326f99059ff775485246999027b3197955",
  polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
};

/**
 * Create a new crypto payment request
 */
async function createPaymentRequest(data) {
  const { userId, birdId, amountUsd, currency, network, purpose, plan } = data;

  // Get exchange rate
  const rate = await getExchangeRate(currency);
  if (!rate) {
    throw new Error(`Exchange rate not available for ${currency}`);
  }

  // Calculate crypto amount
  const amountCrypto = amountUsd / rate.usd_rate;

  // Get platform wallet
  const wallet = await getPlatformWallet(currency, network);
  if (!wallet) {
    throw new Error(`No wallet configured for ${currency} on ${network}`);
  }

  // Get required confirmations
  const networkConfig = NETWORK_CONFIG[network];
  const requiredConfirmations = networkConfig?.confirmations || 6;

  // Generate payment URI
  const paymentUri = generatePaymentUri(
    currency,
    network,
    wallet.address,
    amountCrypto
  );
  const qrCodeData = paymentUri;

  // Calculate expiration time
  const expirationMinutes = parseInt(
    process.env.PAYMENT_EXPIRATION_MINUTES || 30
  );
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // Create payment request in database
  const payment = await db.CryptoPaymentRequest.create({
    user_id: userId,
    bird_id: birdId,
    amount_usd: amountUsd,
    amount_crypto: amountCrypto,
    currency,
    network,
    exchange_rate: rate.usd_rate,
    wallet_address: wallet.address,
    qr_code_data: qrCodeData,
    payment_uri: paymentUri,
    required_confirmations: requiredConfirmations,
    status: "pending",
    purpose,
    plan,
    expires_at: expiresAt,
  });

  return formatPaymentRequest(payment);
}

/**
 * Get payment request by ID
 */
async function getPaymentRequest(paymentId, userId) {
  const payment = await db.CryptoPaymentRequest.findOne({
    where: { id: paymentId, user_id: userId },
  });

  if (!payment) {
    return null;
  }

  // Check if expired
  if (payment.status === "pending" && new Date() > payment.expires_at) {
    payment.status = "expired";
    await payment.save();
  }

  return formatPaymentRequest(payment);
}

/**
 * Verify a payment transaction
 */
async function verifyPayment(
  paymentId,
  userId,
  transactionHash,
  userWalletAddress
) {
  const payment = await db.CryptoPaymentRequest.findOne({
    where: { id: paymentId, user_id: userId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "pending" && payment.status !== "confirming") {
    throw new Error(`Payment already ${payment.status}`);
  }

  // Verify transaction on blockchain
  const txInfo = await verifyBlockchainTransaction(
    transactionHash,
    payment.currency,
    payment.network
  );

  if (!txInfo) {
    throw new Error("Transaction not found on blockchain");
  }

  // Verify amount (allow 1% tolerance for price fluctuation)
  const minAmount = payment.amount_crypto * 0.99;
  if (txInfo.amount < minAmount) {
    throw new Error(
      `Incorrect amount. Expected ${payment.amount_crypto}, received ${txInfo.amount}`
    );
  }

  // Verify recipient address
  if (txInfo.to.toLowerCase() !== payment.wallet_address.toLowerCase()) {
    throw new Error("Incorrect recipient address");
  }

  // Update payment
  payment.transaction_hash = transactionHash;
  payment.user_wallet_address = userWalletAddress || txInfo.from;
  payment.confirmations = txInfo.confirmations;
  payment.status =
    txInfo.confirmations >= payment.required_confirmations
      ? "confirmed"
      : "confirming";

  if (payment.status === "confirmed" && !payment.confirmed_at) {
    payment.confirmed_at = new Date();
  }

  await payment.save();

  // Create transaction record
  await db.CryptoTransaction.create({
    payment_request_id: payment.id,
    transaction_hash: transactionHash,
    from_address: txInfo.from,
    to_address: txInfo.to,
    amount: txInfo.amount,
    currency: payment.currency,
    network: payment.network,
    confirmations: txInfo.confirmations,
    block_number: txInfo.blockNumber,
    block_hash: txInfo.blockHash,
    fee: txInfo.fee,
    status:
      txInfo.confirmations >= payment.required_confirmations
        ? "confirmed"
        : "pending",
    raw_transaction: txInfo.raw,
  });

  // Complete payment if confirmed
  if (payment.status === "confirmed") {
    await completePayment(payment);
  }

  return formatPaymentRequest(payment);
}

/**
 * Verify transaction on blockchain
 */
async function verifyBlockchainTransaction(txHash, currency, network) {
  try {
    switch (network) {
      case "tron":
        return await verifyTronTransaction(txHash, currency);
      case "ethereum":
      case "polygon":
      case "binance-smart-chain":
        return await verifyEvmTransaction(txHash, currency, network);
      case "bitcoin":
        return await verifyBitcoinTransaction(txHash);
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  } catch (error) {
    console.error("Blockchain verification error:", error);
    return null;
  }
}

/**
 * Verify TRON transaction
 */
async function verifyTronTransaction(txHash, currency) {
  try {
    const tx = await tronWeb.trx.getTransaction(txHash);
    const txInfo = await tronWeb.trx.getTransactionInfo(txHash);

    if (!tx || !txInfo || txInfo.receipt?.result !== "SUCCESS") {
      return null;
    }

    let amount, toAddress, fromAddress;

    if (currency === "USDT") {
      // TRC-20 USDT transaction
      const log = txInfo.log?.[0];
      if (!log) return null;

      // Decode amount (6 decimals for USDT)
      amount = parseInt(log.data, 16) / 1e6;

      // Decode addresses
      toAddress = tronWeb.address.fromHex("41" + log.topics[2].slice(24));
      fromAddress = tronWeb.address.fromHex("41" + log.topics[1].slice(24));
    } else {
      // Native TRX transaction
      const contract = tx.raw_data.contract[0];
      if (contract.type !== "TransferContract") return null;

      amount = contract.parameter.value.amount / 1e6;
      toAddress = tronWeb.address.fromHex(contract.parameter.value.to_address);
      fromAddress = tronWeb.address.fromHex(
        contract.parameter.value.owner_address
      );
    }

    // Get confirmations
    const currentBlock = (await tronWeb.trx.getCurrentBlock()).block_header
      .raw_data.number;
    const confirmations = txInfo.blockNumber
      ? currentBlock - txInfo.blockNumber + 1
      : 0;

    return {
      amount,
      to: toAddress,
      from: fromAddress,
      confirmations,
      blockNumber: txInfo.blockNumber,
      blockHash: txInfo.blockHash,
      fee: (txInfo.fee || 0) / 1e6,
      raw: { tx, txInfo },
    };
  } catch (error) {
    console.error("TRON verification error:", error);
    return null;
  }
}

/**
 * Verify EVM transaction (Ethereum, BSC, Polygon)
 */
async function verifyEvmTransaction(txHash, currency, network) {
  try {
    let provider;

    if (network === "ethereum") {
      provider = new ethers.InfuraProvider(
        "mainnet",
        process.env.INFURA_API_KEY
      );
    } else if (network === "binance-smart-chain") {
      provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org");
    } else if (network === "polygon") {
      provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    }

    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx || !receipt) return null;

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    let amount, toAddress, fromAddress;

    if (currency === "USDT" || currency === "USDC") {
      // ERC-20 token transaction
      const transferEvent = receipt.logs.find(
        (log) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );

      if (!transferEvent) return null;

      const amountBN = ethers.toBigInt(transferEvent.data);
      const decimals = currency === "USDT" ? 6 : 6; // USDT and USDC use 6 decimals
      amount = parseFloat(ethers.formatUnits(amountBN, decimals));

      toAddress = "0x" + transferEvent.topics[2].slice(26);
      fromAddress = "0x" + transferEvent.topics[1].slice(26);
    } else {
      // Native ETH/BNB transaction
      amount = parseFloat(ethers.formatEther(tx.value));
      toAddress = tx.to;
      fromAddress = tx.from;
    }

    return {
      amount,
      to: toAddress,
      from: fromAddress,
      confirmations,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      fee: parseFloat(
        ethers.formatEther(receipt.gasUsed * receipt.gasPrice || 0n)
      ),
      raw: { tx, receipt },
    };
  } catch (error) {
    console.error("EVM verification error:", error);
    return null;
  }
}

/**
 * Verify Bitcoin transaction
 */
async function verifyBitcoinTransaction(txHash) {
  try {
    const response = await axios.get(`https://blockchain.info/rawtx/${txHash}`);
    const tx = response.data;

    const currentHeight = (
      await axios.get("https://blockchain.info/latestblock")
    ).data.height;
    const confirmations = tx.block_height
      ? currentHeight - tx.block_height + 1
      : 0;

    return {
      amount: tx.out[0].value / 1e8, // Satoshis to BTC
      to: tx.out[0].addr,
      from: tx.inputs[0].prev_out.addr,
      confirmations,
      blockNumber: tx.block_height,
      blockHash: tx.block_hash,
      fee: tx.fee / 1e8,
      raw: tx,
    };
  } catch (error) {
    console.error("Bitcoin verification error:", error);
    return null;
  }
}

/**
 * Complete payment and activate premium
 */
async function completePayment(payment) {
  try {
    payment.status = "completed";
    payment.completed_at = new Date();
    await payment.save();

    if (payment.purpose === "premium_subscription" && payment.bird_id) {
      // Activate premium subscription
      await activatePremiumSubscription(payment);
    } else if (payment.purpose === "donation") {
      // Record donation
      await recordDonation(payment);
    }

    // Send confirmation notification
    await sendPaymentConfirmation(payment);

    console.log(`Payment ${payment.id} completed successfully`);
  } catch (error) {
    console.error("Complete payment error:", error);
    payment.status = "failed";
    payment.metadata = { ...payment.metadata, error: error.message };
    await payment.save();
  }
}

/**
 * Activate premium subscription for bird
 */
async function activatePremiumSubscription(payment) {
  const { bird_id, user_id, plan } = payment;

  // Calculate subscription end date
  let currentPeriodEnd;
  if (plan === "monthly") {
    currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (plan === "yearly") {
    currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else {
    currentPeriodEnd = null; // Lifetime
  }

  // Create or update premium subscription
  await db.BirdPremiumSubscription.upsert({
    bird_id,
    owner_id: user_id,
    status: "active",
    plan: plan || "lifetime",
    provider: "crypto",
    provider_subscription_id: payment.transaction_hash,
    started_at: new Date(),
    current_period_end: currentPeriodEnd,
  });

  // Update bird premium status
  await db.Bird.update({ is_premium: true }, { where: { id: bird_id } });

  console.log(`Premium activated for bird ${bird_id}`);
}

/**
 * Record donation
 */
async function recordDonation(payment) {
  // Implement donation recording logic
  console.log(`Donation recorded: $${payment.amount_usd}`);
}

/**
 * Send payment confirmation
 */
async function sendPaymentConfirmation(payment) {
  // Implement email/notification logic
  console.log(`Payment confirmation sent for payment ${payment.id}`);
}

/**
 * Get exchange rates
 */
async function getExchangeRates() {
  const rates = await db.CryptoExchangeRate.findAll({
    order: [["currency", "ASC"]],
  });

  return rates.map((rate) => ({
    currency: rate.currency,
    usdRate: parseFloat(rate.usd_rate),
    lastUpdated: rate.last_updated,
    source: rate.source,
  }));
}

/**
 * Get exchange rate for specific currency
 */
async function getExchangeRate(currency) {
  const rate = await db.CryptoExchangeRate.findOne({
    where: { currency: currency.toUpperCase() },
  });

  if (!rate) {
    return null;
  }

  return {
    currency: rate.currency,
    usdRate: parseFloat(rate.usd_rate),
    lastUpdated: rate.last_updated,
    source: rate.source,
  };
}

/**
 * Get platform wallet
 */
async function getPlatformWallet(currency, network) {
  const wallet = await db.PlatformWallet.findOne({
    where: {
      currency: currency.toUpperCase(),
      network: network.toLowerCase(),
      is_active: true,
    },
    order: [["created_at", "DESC"]],
  });

  return wallet;
}

/**
 * Get payment history
 */
async function getPaymentHistory(userId, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const { rows: payments, count: total } =
    await db.CryptoPaymentRequest.findAndCountAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset,
    });

  return {
    payments: payments.map(formatPaymentRequest),
    total,
    page,
    pageSize,
  };
}

/**
 * Get user's saved wallets
 */
async function getSavedWallets(userId) {
  const wallets = await db.CryptoPaymentMethod.findAll({
    where: { user_id: userId },
    order: [
      ["is_default", "DESC"],
      ["created_at", "DESC"],
    ],
  });

  return wallets.map((wallet) => ({
    id: wallet.id,
    userId: wallet.user_id,
    walletAddress: wallet.wallet_address,
    currency: wallet.currency,
    network: wallet.network,
    label: wallet.label,
    isDefault: wallet.is_default,
    verified: wallet.verified,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  }));
}

/**
 * Save a wallet
 */
async function saveWallet(userId, data) {
  const { walletAddress, currency, network, label } = data;

  // Validate address
  if (!validateWalletAddress(walletAddress, currency, network)) {
    throw new Error("Invalid wallet address");
  }

  const wallet = await db.CryptoPaymentMethod.create({
    user_id: userId,
    wallet_address: walletAddress,
    currency: currency.toUpperCase(),
    network: network.toLowerCase(),
    label,
  });

  return {
    id: wallet.id,
    userId: wallet.user_id,
    walletAddress: wallet.wallet_address,
    currency: wallet.currency,
    network: wallet.network,
    label: wallet.label,
    isDefault: wallet.is_default,
    verified: wallet.verified,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  };
}

/**
 * Remove a wallet
 */
async function removeWallet(userId, walletId) {
  const result = await db.CryptoPaymentMethod.destroy({
    where: { id: walletId, user_id: userId },
  });

  if (result === 0) {
    throw new Error("Wallet not found");
  }
}

/**
 * Set default wallet
 */
async function setDefaultWallet(userId, walletId) {
  const wallet = await db.CryptoPaymentMethod.findOne({
    where: { id: walletId, user_id: userId },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Unset all other defaults for this user
  await db.CryptoPaymentMethod.update(
    { is_default: false },
    { where: { user_id: userId } }
  );

  // Set this wallet as default
  wallet.is_default = true;
  await wallet.save();

  return {
    id: wallet.id,
    userId: wallet.user_id,
    walletAddress: wallet.wallet_address,
    currency: wallet.currency,
    network: wallet.network,
    label: wallet.label,
    isDefault: wallet.is_default,
    verified: wallet.verified,
    createdAt: wallet.created_at,
    updatedAt: wallet.updated_at,
  };
}

/**
 * Generate payment URI
 */
function generatePaymentUri(currency, network, address, amount) {
  switch (network) {
    case "tron":
      return address; // TRON wallets handle amount separately
    case "ethereum":
    case "polygon":
    case "binance-smart-chain":
      return `ethereum:${address}`;
    case "bitcoin":
      return `bitcoin:${address}?amount=${amount}`;
    case "solana":
      return `solana:${address}?amount=${amount}`;
    default:
      return address;
  }
}

/**
 * Validate wallet address
 */
function validateWalletAddress(address, currency, network) {
  if (!address || address.trim().length === 0) return false;

  switch (network) {
    case "tron":
      return /^T[a-zA-Z0-9]{33}$/.test(address);
    case "ethereum":
    case "polygon":
    case "binance-smart-chain":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "bitcoin":
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default:
      return false;
  }
}

/**
 * Format payment request for API response
 */
function formatPaymentRequest(payment) {
  return {
    id: payment.id,
    userId: payment.user_id,
    birdId: payment.bird_id,
    amountUsd: parseFloat(payment.amount_usd),
    amountCrypto: parseFloat(payment.amount_crypto),
    currency: payment.currency,
    network: payment.network,
    exchangeRate: parseFloat(payment.exchange_rate),
    walletAddress: payment.wallet_address,
    userWalletAddress: payment.user_wallet_address,
    qrCodeData: payment.qr_code_data,
    paymentUri: payment.payment_uri,
    transactionHash: payment.transaction_hash,
    confirmations: payment.confirmations,
    requiredConfirmations: payment.required_confirmations,
    status: payment.status,
    purpose: payment.purpose,
    plan: payment.plan,
    expiresAt: payment.expires_at,
    confirmedAt: payment.confirmed_at,
    completedAt: payment.completed_at,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
  };
}

module.exports = {
  createPaymentRequest,
  getPaymentRequest,
  verifyPayment,
  getExchangeRates,
  getExchangeRate,
  getPlatformWallet,
  getPaymentHistory,
  getSavedWallets,
  saveWallet,
  removeWallet,
  setDefaultWallet,
};
```

---

## ⏰ Background Jobs (Cron)

Create `jobs/crypto.jobs.js`:

```javascript
const cron = require("node-cron");
const axios = require("axios");
const db = require("../models");
const cryptoService = require("../services/crypto.service");
const { Op } = require("sequelize");

/**
 * Update exchange rates every 5 minutes
 */
cron.schedule("*/5 * * * *", async () => {
  console.log("Updating crypto exchange rates...");

  try {
    const currencies = [
      "bitcoin",
      "ethereum",
      "tether",
      "usd-coin",
      "binancecoin",
      "solana",
      "dogecoin",
    ];
    const mapping = {
      bitcoin: "BTC",
      ethereum: "ETH",
      tether: "USDT",
      "usd-coin": "USDC",
      binancecoin: "BNB",
      solana: "SOL",
      dogecoin: "DOGE",
    };

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: currencies.join(","),
          vs_currencies: "usd",
        },
        headers: process.env.COINGECKO_API_KEY
          ? {
              "x-cg-pro-api-key": process.env.COINGECKO_API_KEY,
            }
          : {},
      }
    );

    for (const [coinId, code] of Object.entries(mapping)) {
      const usdRate = response.data[coinId]?.usd;
      if (usdRate) {
        await db.CryptoExchangeRate.upsert({
          currency: code,
          usd_rate: usdRate,
          source: "coingecko",
          last_updated: new Date(),
        });
      }
    }

    console.log("Exchange rates updated successfully");
  } catch (error) {
    console.error("Failed to update exchange rates:", error.message);
  }
});

/**
 * Monitor pending payments every minute
 */
cron.schedule("* * * * *", async () => {
  console.log("Monitoring pending payments...");

  try {
    const payments = await db.CryptoPaymentRequest.findAll({
      where: {
        status: ["pending", "confirming"],
        expires_at: { [Op.gt]: new Date() },
      },
    });

    for (const payment of payments) {
      if (payment.transaction_hash) {
        // Check transaction confirmations
        const txInfo = await cryptoService.verifyBlockchainTransaction(
          payment.transaction_hash,
          payment.currency,
          payment.network
        );

        if (txInfo) {
          payment.confirmations = txInfo.confirmations;

          if (txInfo.confirmations >= payment.required_confirmations) {
            payment.status = "confirmed";
            payment.confirmed_at = new Date();
            await payment.save();

            // Complete payment
            await cryptoService.completePayment(payment);
          } else {
            payment.status = "confirming";
            await payment.save();
          }
        }
      }
    }

    console.log(`Monitored ${payments.length} payments`);
  } catch (error) {
    console.error("Payment monitoring error:", error.message);
  }
});

/**
 * Expire old payments every hour
 */
cron.schedule("0 * * * *", async () => {
  console.log("Expiring old payments...");

  try {
    const result = await db.CryptoPaymentRequest.update(
      { status: "expired" },
      {
        where: {
          status: "pending",
          expires_at: { [Op.lt]: new Date() },
        },
      }
    );

    console.log(`Expired ${result[0]} payments`);
  } catch (error) {
    console.error("Payment expiration error:", error.message);
  }
});

console.log("Crypto payment cron jobs initialized");
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install express pg sequelize axios tronweb ethers bitcoinjs-lib node-cron dotenv bcrypt jsonwebtoken
```

### 2. Set Up Database

```bash
# Run all SQL migrations in order
psql -U your_user -d wihngo -f migrations/create_platform_wallets.sql
psql -U your_user -d wihngo -f migrations/create_crypto_payment_requests.sql
psql -U your_user -d wihngo -f migrations/create_crypto_transactions.sql
psql -U your_user -d wihngo -f migrations/create_exchange_rates.sql
psql -U your_user -d wihngo -f migrations/create_payment_methods.sql
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 4. Register for API Keys

- **TronGrid**: https://www.trongrid.io/ (for TRON)
- **Infura**: https://infura.io/ (for Ethereum)
- **CoinGecko**: https://www.coingecko.com/en/api (for exchange rates)

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 6. Test the API

```bash
# Create a payment request
curl -X POST http://localhost:3000/api/payments/crypto/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amountUsd": 9.99,
    "currency": "USDT",
    "network": "tron",
    "purpose": "premium_subscription",
    "plan": "monthly"
  }'
```

---

## 🧪 Testing Checklist

- [ ] Create payment request successfully
- [ ] Get payment status
- [ ] Verify TRON USDT transaction
- [ ] Track confirmations (19 blocks)
- [ ] Complete payment and activate premium
- [ ] Exchange rates update every 5 minutes
- [ ] Payments expire after 30 minutes
- [ ] Handle invalid transaction hashes
- [ ] Validate wallet addresses
- [ ] Save user wallets
- [ ] Get payment history

---

## 🔐 Security Checklist

- [ ] JWT authentication on all endpoints
- [ ] Validate all user inputs
- [ ] Encrypt sensitive data
- [ ] Use HTTPS in production
- [ ] Rate limiting on API endpoints
- [ ] Never expose private keys
- [ ] Log all payment activities
- [ ] Monitor for suspicious transactions
- [ ] Set up alerts for large payments

---

## 📊 Monitoring

Set up monitoring for:

- Payment creation rate
- Verification success/failure rate
- Average confirmation time
- Exchange rate API failures
- Database connection issues
- Background job execution

---

## 🎯 Next Steps After Implementation

1. Test on staging/testnet first
2. Send small test transaction (5 USDT on TRON)
3. Verify transaction detection works
4. Confirm premium activation
5. Monitor logs for errors
6. Deploy to production
7. Update frontend API_URL if needed
8. Monitor first live transactions

---

**Implementation Time**: 4-6 hours  
**Complexity**: Medium  
**Priority**: High

All frontend code is already implemented and waiting for this backend! 🚀
