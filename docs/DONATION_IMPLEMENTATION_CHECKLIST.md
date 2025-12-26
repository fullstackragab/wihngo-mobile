# Donation System - Implementation Checklist

Use this checklist to track your implementation progress.

## ✅ Phase 1: Installation & Setup

- [ ] Run `npm install` to install dependencies
  - [ ] Verify `expo-file-system` is installed
  - [ ] Verify `expo-sharing` is installed
- [ ] Create `.env` file with required variables:

  ```bash
  EXPO_PUBLIC_API_URL=
  EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=
  EXPO_PUBLIC_PROJECT_ID=
  ```

- [ ] Update `app.json` for deep links:

  - [ ] Add `scheme: "wihngo"`
  - [ ] Add Android intent filters
  - [ ] Add iOS associated domains (if needed)

- [ ] Review all new files:
  - [ ] 5 service files in `services/`
  - [ ] 5 screen files in `app/donation/`
  - [ ] 1 type file in `types/`
  - [ ] 1 hook file in `hooks/`
  - [ ] 1 test file in `__tests__/`

---

## ✅ Phase 2: Backend API Development

### Invoice Management

- [ ] `POST /api/v1/invoices` - Create invoice

  - [ ] Accepts: bird_id?, amount_fiat, fiat_currency, payment_method
  - [ ] Returns: invoice object with payment URIs
  - [ ] Generates unique invoice_number
  - [ ] Sets expiration time (15 minutes)

- [ ] `GET /api/v1/invoices/:id` - Get full invoice details

  - [ ] Returns complete invoice object
  - [ ] Includes issued_pdf_url when available

- [ ] `GET /api/v1/invoices/:id/status` - Get invoice status

  - [ ] Lightweight endpoint for polling
  - [ ] Returns: status, confirmations, transaction_hash

- [ ] `GET /api/v1/invoices` - List user invoices

  - [ ] Supports pagination (page, limit)
  - [ ] Returns: invoices[], total, page, limit
  - [ ] Ordered by created_at DESC

- [ ] `GET /api/v1/invoices/:id/download` - Download receipt PDF

  - [ ] Returns PDF file
  - [ ] Content-Type: application/pdf
  - [ ] Requires invoice.issued_pdf_url to be set

- [ ] `POST /api/v1/invoices/:id/cancel` - Cancel invoice
  - [ ] Only allows cancellation of PENDING_PAYMENT invoices

### Real-time Updates

- [ ] `GET /api/v1/invoices/:id/events` - SSE endpoint
  - [ ] Returns: text/event-stream
  - [ ] Sends events: INVOICE_CREATED, PAYMENT_DETECTED, PAYMENT_CONFIRMED, INVOICE_ISSUED, COMPLETED
  - [ ] Implements heartbeat/keep-alive

### Payment Processing

- [ ] `POST /api/v1/payments/submit` - Manual transaction submission
  - [ ] Accepts: invoice_id, transaction_hash, payer_address, network, token_symbol
  - [ ] Validates transaction on blockchain
  - [ ] Updates invoice status

### Notifications

- [ ] `POST /api/v1/notifications/register-donation-device` - Register push token
  - [ ] Accepts: expo_push_token, platform
  - [ ] Stores device token for user
  - [ ] Sends notification when receipt ready

### Blockchain Monitoring

- [ ] Solana payment detection

  - [ ] Monitor merchant address for SPL token transfers
  - [ ] Match by amount and reference (invoice_id)
  - [ ] Emit PAYMENT_DETECTED event

- [ ] Base payment detection

  - [ ] Monitor merchant address for ERC-20 transfers
  - [ ] Match by amount and token
  - [ ] Emit PAYMENT_DETECTED event

- [ ] PayPal webhook
  - [ ] Handle PayPal IPN/webhook
  - [ ] Verify payment signature
  - [ ] Update invoice status

### Receipt Generation

- [ ] PDF generation service
  - [ ] Generate invoice PDF with details
  - [ ] Include legal disclaimer
  - [ ] Upload to storage (S3/Cloud Storage)
  - [ ] Set invoice.issued_pdf_url
  - [ ] Emit INVOICE_ISSUED event

---

## ✅ Phase 3: Testing

### Unit Tests

- [ ] Run existing tests: `npm test -- donation.test.ts`
- [ ] Verify all tests pass:
  - [ ] Solana Pay URI generation
  - [ ] EVM transfer payload
  - [ ] Amount formatting
  - [ ] Status mapping
  - [ ] Time calculations

### Integration Tests (with Mock Backend)

- [ ] Test invoice creation flow
- [ ] Test SSE subscription
- [ ] Test polling fallback
- [ ] Test payment submission
- [ ] Test receipt download

### Device Testing

- [ ] Test on iOS device:

  - [ ] Navigate to donation screen
  - [ ] Create test invoice
  - [ ] Open Solana wallet (Phantom)
  - [ ] Complete payment
  - [ ] Download receipt

- [ ] Test on Android device:
  - [ ] Same flow as iOS
  - [ ] Verify permissions (storage, notifications)
  - [ ] Test deep links

---

## ✅ Phase 4: Wallet Integration

### Solana Pay

- [ ] Test with Phantom wallet

  - [ ] URI opens wallet correctly
  - [ ] Payment completes successfully
  - [ ] Backend detects payment

- [ ] Test with Solflare wallet

  - [ ] Same verification as Phantom

- [ ] Test QR code flow
  - [ ] QR code displays correctly
  - [ ] Scanning works
  - [ ] Payment processes

### Base/WalletConnect (Optional for MVP)

- [ ] Get WalletConnect project ID
- [ ] Install WalletConnect packages
- [ ] Implement wallet connection
- [ ] Test with MetaMask
- [ ] Test with Coinbase Wallet

### PayPal

- [ ] Configure PayPal return URLs
- [ ] Test redirect flow
- [ ] Test deep link return
- [ ] Handle cancellation
- [ ] Handle errors

---

## ✅ Phase 5: User Experience

### UI/UX Review

- [ ] Legal disclaimers visible on all screens
- [ ] Colors match brand guidelines
- [ ] Loading states implemented
- [ ] Error messages are user-friendly
- [ ] Success states are celebratory

### Accessibility

- [ ] Font sizes are readable
- [ ] Buttons have adequate touch targets
- [ ] Color contrast meets standards
- [ ] Screen readers work (iOS VoiceOver, Android TalkBack)

### Performance

- [ ] Screen transitions are smooth
- [ ] Images load quickly
- [ ] No memory leaks (test with profiler)
- [ ] API calls don't block UI

---

## ✅ Phase 6: Production Readiness

### Security

- [ ] API keys are in environment variables (not hardcoded)
- [ ] Tokens are stored securely
- [ ] SSL/TLS enabled for all API calls
- [ ] Receipt downloads use authenticated endpoints

### Monitoring

- [ ] Error logging configured (Sentry, etc.)
- [ ] Analytics tracking added:
  - [ ] Donation initiated
  - [ ] Payment method selected
  - [ ] Payment completed
  - [ ] Receipt downloaded
- [ ] API response times monitored

### Documentation

- [ ] Internal team knows how to use donation system
- [ ] Support team has troubleshooting guide
- [ ] Users have clear instructions

### Legal

- [ ] "Not charitable donation" disclaimer reviewed by legal
- [ ] Terms of Service updated (if needed)
- [ ] Privacy Policy updated for payment data

---

## ✅ Phase 7: Deployment

### Pre-Launch

- [ ] Backend deployed to production
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Payment processor connected (PayPal live mode)

### App Release

- [ ] Update `app.json` version
- [ ] Build production APK/IPA
- [ ] Submit to app stores
- [ ] Update release notes

### Post-Launch

- [ ] Monitor error rates
- [ ] Check payment success rate
- [ ] Gather user feedback
- [ ] Iterate on UX issues

---

## 🚨 Troubleshooting Checklist

If something doesn't work, check:

- [ ] Backend API is reachable from device
- [ ] Environment variables are set correctly
- [ ] Auth token is valid
- [ ] Deep links are configured in app.json
- [ ] Wallet apps are installed on device
- [ ] Network connectivity is stable
- [ ] Console logs for detailed errors

---

## 📊 Success Metrics

Track these metrics after launch:

- Donation conversion rate (initiated → completed)
- Average donation amount
- Most popular payment method
- Receipt download rate
- User feedback/ratings
- Support tickets related to donations

---

## ✅ Final Sign-Off

Before marking complete:

- [ ] All phases checked off
- [ ] Production tested with real money (small amount)
- [ ] Support team trained
- [ ] Documentation complete
- [ ] Stakeholders approved

---

**🎉 Launch when all items are checked!**
