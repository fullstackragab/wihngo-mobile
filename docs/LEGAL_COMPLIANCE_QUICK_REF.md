# 🚀 Wihngo Legal Compliance - Quick Reference

## ⚡ TL;DR

**Wihngo is a PLATFORM, not a wallet, bank, or charity.**

---

## 🎯 Golden Rules

### 1. Language Rules

| ✅ USE            | ❌ NEVER USE        |
| ----------------- | ------------------- |
| Support a bird    | Buy a bird          |
| Voluntary support | Purchase            |
| Help care for     | Unlock              |
| Community support | Cheaper on web      |
| Contribute        | Guaranteed earnings |

### 2. Crypto Rules

**Every crypto flow MUST show:**

- ⚠️ Network warning
- 🚫 "Wihngo is not a wallet"
- 🚫 "Cannot recover lost funds"
- ⚠️ "Transactions are irreversible"
- 📝 User confirmation checkbox

### 3. Payout Rules

**Always display:**

- 📅 Monthly payout schedule
- 💰 €20 minimum threshold
- 📊 Platform fee (5%)
- 📆 Next payout date

---

## 📱 Key Pages

### Where Users Find Info:

```
Settings → FAQ
Settings → Terms of Service
Settings → Payout Settings
```

### Important Files:

```
app/faq.tsx                           - FAQ page
app/terms-of-service.tsx              - Legal terms
components/crypto-disclaimer-modal.tsx - Crypto warnings
components/payout-status-card.tsx     - Status display
```

---

## 🔍 Before You Ship

### Quick Checklist:

- [ ] All crypto flows show disclaimers
- [ ] FAQ is accessible
- [ ] Terms show fund holding clause
- [ ] No "buy/purchase" language
- [ ] Payout minimum shown everywhere
- [ ] Platform fee disclosed

---

## 💬 Safe Phrases for App Store

### When describing Wihngo:

- "Community platform for bird lovers"
- "Connect and support birds voluntarily"
- "Facilitates peer-to-peer support"

### When describing payouts:

- "Support is accumulated monthly"
- "Minimum €20 threshold"
- "Platform takes 5% fee to operate"

### When describing crypto:

- "Optional peer-to-peer crypto support"
- "Users manage their own wallets"
- "Transactions are irreversible"

---

## 🆘 If Apple/Google Asks...

### "How do payments work?"

> "Wihngo facilitates voluntary support between users. We temporarily hold funds and distribute them monthly via bank transfer, PayPal, or crypto."

### "Do you custody crypto?"

> "No. Users provide their own wallet addresses. Transactions are peer-to-peer. We only track for transparency."

### "Why external payments?"

> "Support for birds is not a digital good. It's community-driven, voluntary support for real-world bird care."

### "What about the 5% fee?"

> "That's our platform fee for maintaining the service, not a cut of a sale. Users voluntarily support birds; we facilitate and charge a small service fee."

---

## 🎨 UI Element Quick Guide

### Support Button

```tsx
<SupportButton
  birdId="123"
  birdName="Charlie"
  variant="gradient" // or "solid"
/>
```

✅ Shows: "Support" (not "Donate" or "Buy")

### Payout Status

```tsx
<PayoutStatusCard
  info={{
    status: "pending", // or "payable" or "paid"
    balance: 15.5,
    nextPayoutDate: "2025-01-05",
    minimumPayout: 20,
  }}
/>
```

✅ Shows clear status with explanations

### Crypto Disclaimer

```tsx
<CryptoDisclaimerModal
  visible={showModal}
  onClose={handleClose}
  onAccept={handleAccept}
  network="Solana"
  walletAddress="ABC123..."
/>
```

✅ Shows all required warnings

---

## 📚 Full Documentation

**For detailed info, see:**

- `LEGAL_COMPLIANCE_GUIDE.md` - Complete guide
- `LEGAL_COMPLIANCE_IMPLEMENTATION.md` - What was done

---

## 🔄 When Adding Features

### Checklist:

1. Is it digital content? → Use IAP
2. Is it support/donation? → External payment OK
3. Does it involve crypto? → Add disclaimers
4. Does it affect payouts? → Update FAQ
5. Is it a new payment method? → Update Terms

---

## 📞 Questions?

**Legal/Compliance:** support@wihngo.com

**Developer Reference:** `LEGAL_COMPLIANCE_GUIDE.md`

---

## 🎓 Remember

> "We're a platform that facilitates community support.
> We're not a bank, wallet, or financial institution.
> We're transparent, compliant, and user-friendly."

---

**Last Updated:** December 15, 2025  
**Status:** ✅ Fully Compliant
