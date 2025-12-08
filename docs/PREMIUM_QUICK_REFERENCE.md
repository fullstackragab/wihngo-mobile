# 🌸 Premium Bird Profile - Quick Reference

## 💰 Pricing at a Glance

| Plan     | Price     | Charity | Best For  |
| -------- | --------- | ------- | --------- |
| Monthly  | $4.99/mo  | 10%     | Trial     |
| Yearly   | $49.99/yr | 15%     | Committed |
| Lifetime | $69.99    | 20%     | Forever   |

## ✨ Premium Features

### 🎨 Customization

- ✅ 6 custom themes
- ✅ Profile cover customization
- ✅ Celebrated Bird badge

### 📸 Content

- ✅ Unlimited photos/videos
- ✅ 10 memory collages
- ✅ 10 best moments
- ✅ 5 story highlights

### 🔗 Sharing

- ✅ QR code profile
- ✅ Enhanced sharing

### 💝 Community

- ✅ Donation tracker
- ✅ Supporter recognition
- ✅ Charity allocation display

## 📦 Components

```tsx
// Upgrade Card
<PremiumUpgradeCardV2 onUpgrade={(plan) => subscribe(plan)} />

// Best Moments
<BestMomentsTimeline
  birdId={id}
  moments={data}
  isPremium={true}
  isOwner={true}
/>

// Memory Collages
<MemoryCollageList
  birdId={id}
  collages={data}
  isPremium={true}
/>

// Theme Selector
<CustomThemeSelector
  birdId={id}
  currentThemeId="ocean"
  isPremium={true}
/>

// QR Code
<ProfileQRCode
  birdId={id}
  birdName="Tweety"
  isPremium={true}
/>

// Donation Tracker
<DonationTracker
  birdId={id}
  birdName="Tweety"
  donations={data}
  isPremium={true}
/>
```

## 🎯 Key Principles

1. **Love First** - Community never restricted
2. **Celebration** - Premium enhances, not hides
3. **Charity** - Every plan supports conservation
4. **Transparency** - Clear what's free vs premium

## 📱 Installation

```bash
# Install QR code dependency
npm install react-native-qrcode-svg react-native-svg
```

## 🔧 Config

```typescript
// Import plans
import {
  PREMIUM_PLANS,
  PREMIUM_FEATURES,
  CUSTOM_THEMES,
} from "@/constants/premium-config";

// Check premium status
import { hasPremium } from "@/services/premium.service";

if (hasPremium(bird)) {
  // Show premium features
}
```

## 📊 Free vs Premium

### Free (Always)

- ✅ Basic profile
- ✅ 5 photos + 5 videos
- ✅ All interactions
- ✅ Comments & shares
- ✅ Basic donations

### Premium (Celebration)

- ✅ All free features +
- ✅ Unlimited media
- ✅ Custom themes
- ✅ Best moments
- ✅ Memory collages
- ✅ QR sharing
- ✅ Donation tracker
- ✅ Premium badge

## 🚀 Quick Start

1. Install dependencies
2. Import components
3. Check `isPremium` status
4. Render appropriate UI
5. Handle upgrade flow
6. Celebrate! 🎉

## 📚 Documentation

- `PREMIUM_LOVE_FIRST_GUIDE.md` - Full guide
- `PREMIUM_V2_SUMMARY.md` - Implementation summary
- `PREMIUM_QUICKSTART.md` - Developer guide
- `PREMIUM_BACKEND_GUIDE.md` - API specs

---

**Remember**: It's about love, not money! 💛🐦
