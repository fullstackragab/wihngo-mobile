# Wihngo Legal & Compliance Guide

## 🧭 Core Principle (Very Important)

**Wihngo must never directly "hold user funds."**

We are a **platform**, not a wallet, bank, or charity. This single principle keeps us:

- ✅ Legally safer
- ✅ App-store compliant
- ✅ Easier to scale

## 📱 In-App Store Rules (Apple & Google - Critical)

### What You MUST DO ✅

- Allow voluntary support/donations
- Use external payment processors (PayPal, crypto)
- Accept payments that are NOT digital content purchases
- Frame everything as "Support" (not buy, purchase, unlock)

### What You MUST NOT DO ❌

- ❌ Bypass Apple/Google for digital content purchases
- ❌ Say "pay cheaper on the web"
- ❌ Link directly to external payment for digital goods
- ❌ Use terms like "buy", "purchase", "unlock" for digital content
- ❌ Suggest users avoid in-app purchases

## 💰 Correct Crypto Model for Wihngo

### Wihngo Does NOT:

- ❌ Custody crypto
- ❌ Generate wallets for users
- ❌ Move crypto on behalf of users
- ❌ Promise delivery
- ❌ Guarantee outcomes

### Wihngo DOES:

- ✅ Let bird owners add their own public wallet addresses
- ✅ Display addresses as read-only
- ✅ Track transactions via blockchain explorers
- ✅ Facilitate peer-to-peer support

## 🔐 Required Crypto Disclaimers

Every crypto payment flow MUST include:

1. **Network selection confirmation**
2. **Clear warnings** (wrong network = loss)
3. **No responsibility disclaimer**
4. **No recovery promise**

### Example Warning Text:

```
"Crypto transactions are irreversible.
Please make sure you are sending on the correct network.
Wihngo is not a wallet. Wihngo does not guarantee delivery.
Crypto support is peer-to-peer."
```

## 💸 Payout Rules (Must Be Explicit Everywhere)

### Requirements:

- Payouts happen **once per month**
- Minimum payout: **€20**
- If balance < €20 → **rolls over** to next month
- Payout method: Bank transfer, PayPal, crypto
- Estimated payout date: 1-5 of each month

### Safe Wording:

```
"Support received is accumulated and paid out once per month
when the minimum payout threshold is reached."
```

## 📄 Required Legal Pages

### 1. Terms of Service

Must include:

- ✅ Platform role (not a bank/charity)
- ✅ Funds holding clause
- ✅ Monthly payout schedule
- ✅ Minimum payout threshold
- ✅ Platform fee disclosure
- ✅ Crypto disclaimers
- ✅ No guarantees clause
- ✅ Liability limitations

### 2. FAQ Page

Must answer:

- "When do I get paid?"
- "Why is there a €20 minimum?"
- "What happens if I never reach €20?"
- "What is the platform fee?"
- "What payout methods are available?"
- Crypto safety questions
- Tax responsibility

### 3. Privacy Policy

Must comply with GDPR and EU regulations.

## 📊 Accounting & Tax

### You MUST Track Separately:

- Gross support received
- Platform fee (your revenue)
- Payable to users (liability)

### Example:

```
User receives support: €100
Platform fee 5% → €5 (your income)
€95 → user payable (liability)
```

**Only the fee is your revenue.**

## 🪙 Crypto Implementation Checklist

### Payment Flow (Mobile):

1. ✅ Supporter selects Crypto
2. ✅ Selects network (VERY IMPORTANT)
3. ✅ Sees:
   - Wallet address
   - Network warning
   - "I understand" confirmation
4. ✅ User sends crypto from their wallet
5. ✅ App tracks transaction hash
6. ✅ Support marked pending → confirmed

### Required Disclosures:

- ✅ Network selection
- ✅ Volatility risk
- ✅ Network fees
- ✅ Irreversibility
- ✅ No recovery promise

## 🎯 User-Facing Language Guide

### ✅ CORRECT Terms:

- "Support a bird voluntarily"
- "Help care for this bird"
- "Contribute to bird welfare"
- "Voluntary support"
- "Community support"

### ❌ PROHIBITED Terms:

- "Buy birds" / "Purchase digital goods"
- "Cheaper on the website"
- "Store money in your account"
- "Guaranteed earnings"
- "Invest or earn money from birds"
- "Unlock premium features" (for support-based content)

## 📱 App Store Compliance

### When Submitting to Apple/Google:

#### DO SAY:

- ✅ "Support a bird voluntarily"
- ✅ "Funds are accumulated and paid monthly"
- ✅ "The platform takes a small fee to operate"
- ✅ "Crypto payouts are optional, peer-to-peer, and irreversible"

#### DO NOT SAY:

- ❌ "Buy birds" / "Purchase digital goods"
- ❌ "Cheaper on the web"
- ❌ "Store money in your account"
- ❌ "Guaranteed earnings"

## 🛠️ Implementation Files

### Updated Files:

- ✅ `i18n/locales/en.json` - All translations
- ✅ `app/terms-of-service.tsx` - Legal terms
- ✅ `app/faq.tsx` - FAQ page
- ✅ `app/payout-settings.tsx` - Payout dashboard
- ✅ `components/support-modal.tsx` - Support flow
- ✅ `components/crypto-disclaimer-modal.tsx` - Crypto warnings
- ✅ `components/payout-status-card.tsx` - Status display

### Key Components:

#### CryptoDisclaimerModal

Shows comprehensive disclaimers before crypto transactions.

#### PayoutStatusCard

Displays payout status (Pending, Payable, Paid) with clear explanations.

#### FAQ Page

Comprehensive FAQ covering all compliance topics.

## 🔍 Testing Checklist

### Before Release:

- [ ] All crypto flows show network warnings
- [ ] Terms of Service includes fund holding clause
- [ ] FAQ page is accessible from settings
- [ ] Payout settings show monthly schedule
- [ ] No prohibited language in user-facing text
- [ ] All disclaimers are visible and clear
- [ ] Minimum payout threshold is displayed everywhere
- [ ] Platform fee is clearly stated

## 📞 Support Contact

For compliance questions or legal matters:

- Email: support@wihngo.com

## 📝 Notes for Developers

### Important Reminders:

1. **Never promise fund recovery** in crypto transactions
2. **Always show payout schedule** on dashboard
3. **Keep minimum payout visible** in all relevant screens
4. **Update FAQ** whenever payment rules change
5. **Test crypto warnings** on every release
6. **Review app store guidelines** before each submission

### When Adding New Payment Features:

1. Check if it's "digital content" (requires IAP)
2. Add appropriate disclaimers
3. Update FAQ page
4. Update Terms of Service if needed
5. Test compliance language

## 🎓 Founder Notes

- Keep the minimum payout, monthly schedule visible in dashboard, FAQ, and Terms
- Always include disclaimer about crypto volatility and irreversibility
- Avoid any language implying financial guarantee or profit
- This setup is Apple/Google compliant, Estonia-safe, and trust-friendly

## 🔄 Revision History

- **v1.0** - December 15, 2025 - Initial compliance guide
- Future updates should be documented here

---

**Remember: We are a platform facilitating community support, not a financial institution.**
