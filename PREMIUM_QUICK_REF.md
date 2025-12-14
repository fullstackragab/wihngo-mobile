# 🚀 Premium Bird Profile - Developer Quick Reference

## 🔌 API Endpoints

```typescript
// Plans
await getPremiumPlans();

// Subscribe
await subscribeToPremium({ birdId, provider, plan, paymentMethodId });

// Status
await getPremiumStatus(birdId);

// Cancel
await cancelSubscription(birdId);

// Style
await updatePremiumStyle(birdId, { frameId, badgeId, themeId });
await getPremiumStyle(birdId);

// Charity
await getBirdCharityImpact(birdId);
await getGlobalCharityImpact();
await getCharityPartners();
```

---

## 🎨 Style Options

### Frames

- `gold` - Golden border
- `silver` - Silver metallic
- `rainbow` - Multi-color gradient
- `rose` - Rose gold

### Badges

- `star` - Star "Celebrated Bird"
- `heart` - Heart "Loved Bird"
- `crown` - Crown "Premium Bird"
- `diamond` - Diamond "Lifetime Member"

### Themes

- `sunset` - Warm orange/pink (#FF6B6B)
- `ocean` - Cool blue/teal (#4ECDC4)
- `forest` - Natural green (#66BB6A)
- `lavender` - Soft purple (#9C27B0)

---

## 📱 Navigation

```typescript
// View plans
router.push(`/premium-plans?birdId=${birdId}`);

// Customize style
router.push(`/premium-style-customizer?birdId=${birdId}`);

// View charity impact
router.push(`/charity-impact?birdId=${birdId}`);
router.push(`/charity-impact`); // Global impact

// Show upsell modal
setShowUpsellModal(true);
```

---

## 🧩 Components

### Premium Management Card

```tsx
<PremiumManagementCard
  birdId={bird.birdId}
  isOwner={isOwner}
  onSubscriptionChange={() => loadData()}
/>
```

### Premium Upsell Modal

```tsx
<PremiumUpsellModal
  visible={showModal}
  birdId={bird.birdId}
  birdName={bird.name}
  onClose={() => setShowModal(false)}
/>
```

### Premium Badge

```tsx
<PremiumBadge size="medium" />
```

---

## 🌍 Translations

### Usage

```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<Text>{t("premium.celebrateYourBird")}</Text>;
```

### Key Categories

- `premium.celebrateYourBird`
- `premium.mostPopular`
- `premium.charityImpact`
- `premium.customizeStyle`
- `premium.upgradeNow`

---

## ✅ Testing Checklist

- [ ] Plans screen loads
- [ ] Subscribe flow works
- [ ] Style customizer previews
- [ ] Charity impact displays
- [ ] Cancel subscription works
- [ ] Premium badge shows
- [ ] Turkish translations work
- [ ] Non-owners can't edit

---

## 🔥 Quick Fixes

### Payment Not Working

- Check `handleStripePayment()` in `screens/premium-plans.tsx`
- Ensure Stripe SDK initialized
- Verify payment method collection

### Style Not Saving

- Check API endpoint: `/api/premium/style/{birdId}`
- Verify bird ownership
- Check premium status is active

### Charity Impact Empty

- Check API: `/api/charity/impact/{birdId}`
- Verify backend charity allocation job running
- Check subscription has processed at least one payment

---

## 📞 Quick Help

**Where is...?**

- Plans screen: `screens/premium-plans.tsx`
- Service methods: `services/premium.service.ts`
- Types: `types/premium.ts`
- Translations: `i18n/locales/en.json` & `tr.json`

**Need to add...?**

- New plan: Update backend API + refresh plans list
- New frame: Add to `FRAMES` array in style customizer
- New theme: Add to `THEMES` array in style customizer
- New translation: Add to both `en.json` and `tr.json`

---

_Updated: December 14, 2025_
