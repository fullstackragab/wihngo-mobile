# Cryptocurrency Payment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         WihNgo Mobile App                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Payment Methods │  │  Premium Payment │  │ Crypto Payment│ │
│  │     Screen       │→ │  Options Modal   │→ │    Screen     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│           │                     │                      │        │
│           └─────────────────────┴──────────────────────┘        │
│                                │                                │
│  ┌─────────────────────────────▼─────────────────────────────┐ │
│  │              Crypto Service Layer                          │ │
│  │  • createCryptoPayment()                                   │ │
│  │  • pollPaymentStatus()                                     │ │
│  │  • getCryptoExchangeRate()                                 │ │
│  │  • validateWalletAddress()                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 │ HTTPS/REST
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Payment API Endpoints                        │  │
│  │  POST   /payments/crypto/create                           │  │
│  │  GET    /payments/crypto/:id                              │  │
│  │  POST   /payments/crypto/:id/verify                       │  │
│  │  GET    /payments/crypto/rates                            │  │
│  │  GET    /payments/crypto/history                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Payment Processing Logic                       │  │
│  │  • Create payment request                                 │  │
│  │  • Verify blockchain transaction                          │  │
│  │  • Track confirmations                                    │  │
│  │  • Complete payment & activate premium                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Background Workers                           │  │
│  │  • Monitor pending payments (every 1 min)                 │  │
│  │  • Update exchange rates (every 5 min)                    │  │
│  │  • Expire old payments (hourly)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────┬──────────────────────┬────────────────────────┬───────────┘
     │                      │                        │
     │                      │                        │
     ▼                      ▼                        ▼
┌──────────┐        ┌──────────────┐         ┌─────────────┐
│ Database │        │  Blockchain  │         │  Exchange   │
│          │        │  APIs        │         │  Rate APIs  │
├──────────┤        ├──────────────┤         ├─────────────┤
│• Payments│        │• Infura      │         │• CoinGecko  │
│• Txns    │        │• Alchemy     │         │• CoinMarket │
│• Wallets │        │• QuickNode   │         │  Cap        │
│• Rates   │        │• Blockchain  │         └─────────────┘
└──────────┘        │  Explorers   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Blockchain  │
                    │   Networks   │
                    ├──────────────┤
                    │• Bitcoin     │
                    │• Ethereum    │
                    │• BSC         │
                    │• Polygon     │
                    │• Solana      │
                    │• Tron        │
                    └──────────────┘
```

## Payment Flow Diagram

```
User Journey                     System Actions
─────────────                   ───────────────

┌─────────────────┐
│ User selects    │
│ "Pay with       │
│  Crypto"        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ Select currency │             │ Fetch exchange   │
│ (BTC, ETH, etc.)│────────────→│ rates from API   │
└────────┬────────┘             └──────────────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ Select network  │             │ Validate network │
│ (if multiple)   │────────────→│ compatibility    │
└────────┬────────┘             └──────────────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ Review amount   │             │ Calculate crypto │
│ & rate          │◀────────────│ amount from USD  │
└────────┬────────┘             └──────────────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ Confirm payment │             │ Create payment   │
│                 │────────────→│ request in DB    │
└────────┬────────┘             └──────────────────┘
         │                                │
         │                                ▼
         │                      ┌──────────────────┐
         │                      │ Generate wallet  │
         │                      │ address & QR code│
         │                      └─────────┬────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐             ┌──────────────────┐
│ Scan QR code or │◀────────────│ Return payment   │
│ copy address    │             │ details to app   │
└────────┬────────┘             └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Send crypto     │
│ from wallet     │
└────────┬────────┘
         │
         │ Transaction broadcast to blockchain
         │
         ▼
    ┌────────────┐               ┌──────────────────┐
    │ Blockchain │──────────────→│ Monitor for      │
    │ Network    │               │ incoming tx      │
    └────────────┘               └─────────┬────────┘
                                           │
         ┌─────────────────────────────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ App shows       │◀────────────│ Detect transaction│
│ "Confirming"    │             │ & update status  │
└────────┬────────┘             └──────────────────┘
         │                                │
         │                                ▼
         │                      ┌──────────────────┐
         │                      │ Track blockchain │
         │                      │ confirmations    │
         │                      └─────────┬────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐             ┌──────────────────┐
│ Progress bar    │◀────────────│ Update conf count│
│ shows 2/12      │             │ every block      │
└────────┬────────┘             └──────────────────┘
         │
         ▼
┌─────────────────┐             ┌──────────────────┐
│ Enough          │             │ Mark as confirmed│
│ confirmations   │────────────→│ Complete payment │
└────────┬────────┘             └─────────┬────────┘
         │                                │
         │                                ▼
         │                      ┌──────────────────┐
         │                      │ Activate premium │
         │                      │ for bird         │
         │                      └─────────┬────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐             ┌──────────────────┐
│ Show success    │◀────────────│ Send confirmation│
│ screen!         │             │ notification     │
└─────────────────┘             └──────────────────┘
```

## Component Hierarchy

```
app/crypto-payment.tsx
├─ CryptoCurrencySelector
│  └─ Individual currency cards
│
├─ NetworkSelector
│  └─ Network option cards
│
├─ CryptoPaymentQR
│  ├─ QRCode component
│  ├─ Timer countdown
│  ├─ Address display
│  └─ Copy button
│
└─ CryptoPaymentStatus
   ├─ Status icon
   ├─ Progress bar
   └─ Status messages
```

## Data Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Initiates payment
       ▼
┌─────────────────────────┐
│ crypto-payment.tsx      │
│ (Main Screen)           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ crypto.service.ts       │
│ createCryptoPayment()   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ API: POST /crypto/create│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Backend Processing      │
│ • Get exchange rate     │
│ • Calculate amount      │
│ • Generate address      │
│ • Create DB record      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Return Payment Request  │
│ • walletAddress         │
│ • amountCrypto          │
│ • qrCodeData            │
│ • expiresAt             │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Display QR & Address    │
│ CryptoPaymentQR         │
└──────┬──────────────────┘
       │
       │ Start polling
       ▼
┌─────────────────────────┐
│ Poll every 5 seconds    │
│ pollPaymentStatus()     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Backend monitors        │
│ blockchain for tx       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ TX Detected!            │
│ Update to "confirming"  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Track confirmations     │
│ Update count each block │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Enough confirmations    │
│ Mark as "completed"     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Activate premium        │
│ Show success screen     │
└─────────────────────────┘
```

## State Machine

```
Payment Status State Machine:

    [Create]
       │
       ▼
  ┌─────────┐
  │ pending │──────────────┐
  └────┬────┘              │
       │                   │ Timeout (30 min)
       │ TX detected       │
       ▼                   ▼
  ┌───────────┐      ┌─────────┐
  │confirming │      │ expired │
  └────┬──────┘      └─────────┘
       │
       │ Confirmations >= required
       ▼
  ┌───────────┐
  │ confirmed │
  └────┬──────┘
       │
       │ Premium activated
       ▼
  ┌───────────┐
  │ completed │
  └───────────┘

Error states:
  • failed (verification failed)
  • refunded (payment reversed)
```

## Security Layers

```
┌────────────────────────────────────────────┐
│         Client-Side Security               │
├────────────────────────────────────────────┤
│ • Address format validation                │
│ • Network warning confirmations            │
│ • Amount display verification              │
│ • HTTPS only                               │
│ • No private keys stored                   │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│         API Layer Security                 │
├────────────────────────────────────────────┤
│ • Authentication required                  │
│ • Rate limiting                            │
│ • Input validation                         │
│ • SQL injection prevention                 │
│ • CORS configuration                       │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│      Business Logic Security               │
├────────────────────────────────────────────┤
│ • Transaction verification on blockchain   │
│ • Amount matching (1% tolerance)           │
│ • Duplicate payment prevention             │
│ • Expiration enforcement                   │
│ • Confirmation requirements                │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│         Data Layer Security                │
├────────────────────────────────────────────┤
│ • Encrypted private keys                   │
│ • Database encryption at rest              │
│ • Secure key management                    │
│ • Audit logging                            │
│ • Backup & disaster recovery               │
└────────────────────────────────────────────┘
```

## File Structure Tree

```
wihngo/
│
├── app/
│   ├── crypto-payment.tsx              ← Main payment screen
│   └── payment-methods.tsx             ← Updated with crypto
│
├── components/
│   ├── crypto-currency-selector.tsx    ← Currency picker
│   ├── crypto-payment-qr.tsx           ← QR & address display
│   ├── crypto-payment-status.tsx       ← Status indicator
│   ├── network-selector.tsx            ← Network picker
│   └── premium-payment-options.tsx     ← Payment method selector
│
├── services/
│   └── crypto.service.ts               ← All crypto logic
│
├── types/
│   ├── crypto.ts                       ← Crypto type definitions
│   ├── premium.ts                      ← Updated with crypto
│   └── index.ts                        ← Exports crypto types
│
├── docs/
│   ├── CRYPTO_PAYMENT_GUIDE.md         ← Frontend guide
│   ├── CRYPTO_BACKEND_IMPLEMENTATION.md← Backend guide
│   ├── CRYPTO_QUICKSTART.md            ← Quick reference
│   └── CRYPTO_ARCHITECTURE.md          ← This file
│
├── package.json                        ← Updated dependencies
└── CRYPTO_IMPLEMENTATION_SUMMARY.md    ← Summary
```

## Integration Points

```
┌──────────────────────────────────────────────────────────┐
│                  Existing App Features                    │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Premium Subscriptions ←─┐                               │
│                          │                               │
│  Payment Methods     ←───┼─── Crypto Payments            │
│                          │                               │
│  User Profile        ←───┘                               │
│                                                           │
└──────────────────────────────────────────────────────────┘

Integration is non-invasive:
• Crypto is added as an option alongside existing payment methods
• No breaking changes to existing code
• Premium types extended, not replaced
• Can be enabled/disabled with a feature flag
```

## Scalability Considerations

```
Component Level:
┌────────────────┐
│   Frontend     │
├────────────────┤
│ • Stateless    │
│ • Reusable     │
│ • Cached rates │
└────────────────┘

Service Level:
┌────────────────┐
│   Backend API  │
├────────────────┤
│ • Horizontal   │
│   scaling      │
│ • Load balanced│
│ • Stateless    │
└────────────────┘

Data Level:
┌────────────────┐
│   Database     │
├────────────────┤
│ • Indexed      │
│ • Partitioned  │
│ • Replicated   │
└────────────────┘

Worker Level:
┌────────────────┐
│  Background    │
├────────────────┤
│ • Distributed  │
│ • Queued       │
│ • Fault-tolerant│
└────────────────┘
```

## Monitoring & Observability

```
Application Metrics:
• Payment creation rate
• Success/failure ratio
• Average confirmation time
• Exchange rate update frequency
• API response times

Business Metrics:
• Revenue per cryptocurrency
• Most popular currencies
• Average payment amount
• Payment conversion rate
• User retention

System Health:
• API uptime
• Database performance
• Blockchain API availability
• Worker job queue depth
• Error rates by endpoint

Alerts:
• Payment verification failures
• Blockchain API down
• Exchange rate stale
• High error rates
• Unusual payment patterns
```

---

This architecture is designed to be:

- **Scalable**: Handle thousands of concurrent payments
- **Reliable**: Graceful degradation and error handling
- **Secure**: Multiple layers of security
- **Maintainable**: Clean separation of concerns
- **Extensible**: Easy to add new currencies/features
