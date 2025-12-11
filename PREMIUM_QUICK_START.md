# 🚀 Premium Bird Profile - Quick Start Guide

**Last Updated:** December 11, 2025

---

## 📦 New Components

### 1. `<PremiumBirdProfile />`

Display a bird's premium profile with all enhanced features.

```tsx
import { PremiumBirdProfile } from "@/components";

<PremiumBirdProfile
  bird={bird}
  subscription={subscription}
  premiumStyle={premiumStyle}
  isOwner={true}
  onUpgrade={() => showUpgrade()}
  onEdit={() => editProfile()}
/>;
```

**Props:**

- `bird: Bird` - Bird data
- `subscription: BirdPremiumSubscription` - Active subscription
- `premiumStyle?: PremiumStyle` - Custom theme/styling
- `isOwner: boolean` - Is current user the owner
- `onUpgrade?: () => void` - Upgrade button handler
- `onEdit?: () => void` - Edit profile handler

---

### 2. `<PremiumBirdUpgradeFlow />`

Full-screen modal for premium plan selection and upgrade.

```tsx
import { PremiumBirdUpgradeFlow } from "@/components";

<PremiumBirdUpgradeFlow
  bird={bird}
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSelectPlan={(plan) => processPayment(plan)}
/>;
```

**Props:**

- `bird: Bird` - Bird to upgrade
- `visible: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `onSelectPlan: (plan: PremiumPlan) => void` - Plan selection handler

**Features:**

- Plan comparison with pricing
- Charity allocation display
- Feature preview
- Trust indicators
- Free vs Premium comparison

---

### 3. `<CharityIntegrationTracker />`

Display charity impact and contribution details.

```tsx
import { CharityIntegrationTracker } from "@/components";

<CharityIntegrationTracker
  birdId={bird.id}
  subscriptionPlan="yearly"
  showGlobalImpact={false}
/>;
```

**Props:**

- `birdId?: string` - Bird ID for personal stats
- `subscriptionPlan?: PremiumPlan` - Current plan
- `showGlobalImpact?: boolean` - Show community-wide stats

**Displays:**

- Personal contribution amount
- Birds helped / shelters supported
- Partner charities
- How it works explanation

---

## 💰 Premium Plans

```typescript
import { PREMIUM_PLANS } from "@/constants/premium-config";

// Available plans
PREMIUM_PLANS.forEach((plan) => {
  console.log(
    `${plan.name}: $${plan.price} (${plan.charityAllocation}% to charity)`
  );
});

// Output:
// Monthly Celebration: $3.99 (10% to charity)
// Yearly Celebration: $39.99 (15% to charity)
// Lifetime Celebration: $69.99 (20% to charity)
```

---

## 🎨 Premium Visual Indicators

### Enhanced Bird Card

```tsx
import BirdCard from "@/components/bird-card";

// Automatically shows:
// - Golden border if premium
// - Premium badge
// - "💛 Celebrated Bird" tag
// - Golden glow effect

<BirdCard bird={bird} onPress={handlePress} />;
```

### Premium Badge

```tsx
import { PremiumBadge } from '@/components';

<PremiumBadge size="small" badge="premium" />
<PremiumBadge size="medium" badge="lifetime" />
```

---

## 🔧 Type Definitions

### Premium Plan

```typescript
type PremiumPlan = "monthly" | "yearly" | "lifetime";
```

### Plan Details

```typescript
interface PremiumPlanDetails {
  id: PremiumPlan;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year" | "lifetime";
  savings?: string;
  description?: string;
  features: string[];
  charityAllocation?: number; // Percentage to charity
}
```

### Subscription

```typescript
interface BirdPremiumSubscription {
  id: string;
  birdId: string;
  ownerId: string;
  status: "active" | "canceled" | "past_due" | "expired";
  plan: PremiumPlan;
  provider: "stripe" | "apple" | "google" | "crypto";
  providerSubscriptionId: string;
  startedAt: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 Common Use Cases

### 1. Show Premium Profile

```tsx
import { PremiumBirdProfile } from "@/components";

function BirdProfileScreen({ birdId }) {
  const [bird, setBird] = useState<Bird>();
  const [subscription, setSubscription] = useState<BirdPremiumSubscription>();
  const [premiumStyle, setPremiumStyle] = useState<PremiumStyle>();

  useEffect(() => {
    // Load bird data
    loadBird(birdId).then(setBird);
    // Load premium subscription
    loadPremiumStatus(birdId).then(setSubscription);
    // Load custom styling
    loadPremiumStyle(birdId).then(setPremiumStyle);
  }, [birdId]);

  if (!subscription || subscription.status !== "active") {
    return <RegularBirdProfile bird={bird} />;
  }

  return (
    <PremiumBirdProfile
      bird={bird}
      subscription={subscription}
      premiumStyle={premiumStyle}
      isOwner={currentUserId === bird.ownerId}
      onUpgrade={() => setShowUpgradeModal(true)}
      onEdit={() => navigation.navigate("EditProfile")}
    />
  );
}
```

### 2. Trigger Upgrade Flow

```tsx
function UpgradeButton({ bird }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSelectPlan = async (plan: PremiumPlan) => {
    setShowUpgrade(false);

    // Navigate to payment
    navigation.navigate("Payment", {
      birdId: bird.id,
      plan: plan,
    });
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowUpgrade(true)}>
        <Text>✨ Upgrade to Premium</Text>
      </TouchableOpacity>

      <PremiumBirdUpgradeFlow
        bird={bird}
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onSelectPlan={handleSelectPlan}
      />
    </>
  );
}
```

### 3. Check Premium Status

```tsx
import { hasPremium } from "@/services/premium.service";

function MyComponent({ bird }) {
  const isPremium = hasPremium(bird);

  return (
    <View>
      {isPremium ? <Text>✨ Premium Bird</Text> : <Text>Free Profile</Text>}
    </View>
  );
}
```

### 4. Display Charity Impact

```tsx
function CharitySection({ bird, subscription }) {
  return (
    <View>
      <Text style={styles.title}>Your Impact</Text>
      <CharityIntegrationTracker
        birdId={bird.id}
        subscriptionPlan={subscription.plan}
        showGlobalImpact={false}
      />
    </View>
  );
}
```

---

## 🏥 Charity Allocation

| Plan     | Price  | Charity % | Monthly Donation | Yearly Donation   |
| -------- | ------ | --------- | ---------------- | ----------------- |
| Monthly  | $3.99  | 10%       | $0.40            | $4.79             |
| Yearly   | $39.99 | 15%       | —                | $6.00             |
| Lifetime | $69.99 | 20%       | —                | $14.00 (one-time) |

### Supported Causes

1. **Bird Shelters** - Rescue and rehabilitation
2. **Veterinary Care** - Medical treatment for birds in need
3. **Conservation Programs** - Species protection and habitat preservation

---

## ✨ Premium Features Reference

### Visual Features

- Custom profile theme & cover image
- Premium golden border frame
- "Celebrated Bird" badge
- Exclusive lifetime badge (lifetime plan)
- Profile highlight effects

### Content Features

- Unlimited photos & videos (vs 5 free)
- Pin up to 5 story highlights
- 10 best moments timeline
- Memory collages & albums
- QR code for profile sharing

### Community Features

- Donation tracker display
- Charity impact statistics
- Priority support (yearly/lifetime)
- VIP support access (lifetime)

---

## 🎨 Styling & Theming

### Colors

```typescript
const premiumColors = {
  gold: "#FFD700", // Premium accent
  warmBg: "#FFF9E5", // Premium background
  charityGreen: "#4CAF50", // Charity indicators
  lovePink: "#FF6B6B", // Featured/recommended
};
```

### Premium Card Style

```typescript
const premiumCardStyle = {
  backgroundColor: "#FFF9E5",
  borderWidth: 2,
  borderColor: "#FFD700",
  shadowColor: "#FFD700",
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
};
```

---

## 📱 Screen Integration Examples

### Bird Profile Screen

```tsx
import { PremiumBirdProfile } from "@/components";

export default function BirdProfileScreen({ route }) {
  const { birdId } = route.params;
  const [data, setData] = useState(null);

  return data?.isPremium ? (
    <PremiumBirdProfile {...data} />
  ) : (
    <StandardBirdProfile {...data} />
  );
}
```

### Settings Screen

```tsx
import { PremiumSubscriptionManager } from "@/components";

export default function BirdSettingsScreen({ bird }) {
  return (
    <ScrollView>
      <PremiumSubscriptionManager birdId={bird.id} />
      {/* Other settings */}
    </ScrollView>
  );
}
```

---

## 🔐 Premium Status Check

```typescript
// Check if bird has active premium
import { hasPremium } from "@/services/premium.service";

const isPremium = hasPremium(bird);

// Get full subscription details
const subscription = await getPremiumStatus(bird.id);

if (subscription.isPremium) {
  console.log("Premium plan:", subscription.subscription.plan);
  console.log("Status:", subscription.subscription.status);
  console.log("Ends:", subscription.subscription.currentPeriodEnd);
}
```

---

## 🚨 Error Handling

```typescript
try {
  const subscription = await subscribeToPremium({
    birdId: bird.id,
    plan: "yearly",
    provider: "stripe",
    paymentMethodId: "pm_xxx",
  });

  // Success - show confirmation
  Alert.alert("Success", "Premium activated! 🎉");
} catch (error) {
  if (error.code === "PAYMENT_FAILED") {
    Alert.alert("Payment Failed", "Please check your payment method.");
  } else if (error.code === "ALREADY_SUBSCRIBED") {
    Alert.alert("Already Premium", "This bird already has premium!");
  } else {
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
}
```

---

## 📚 Related Documentation

- [Full Implementation Guide](./PREMIUM_BIRD_PROFILE_IMPLEMENTATION.md)
- [Premium Config](../constants/premium-config.ts)
- [Premium Types](../types/premium.ts)
- [Premium Service](../services/premium.service.ts)

---

## 💡 Tips & Best Practices

1. **Always check premium status** before showing premium-only features
2. **Use hasPremium() helper** instead of manual subscription checks
3. **Show upgrade prompts** where premium features would appear
4. **Highlight charity impact** to increase conversion
5. **Keep messaging love-focused**, not sales-focused
6. **Provide clear free vs premium** comparison
7. **Make cancellation easy** to build trust

---

## 🎉 Quick Win Examples

### Add Premium to Existing Bird Card

```tsx
// Before
<BirdCard bird={bird} onPress={handlePress} />

// After - automatically shows premium indicators!
<BirdCard bird={bird} onPress={handlePress} />
```

### Add Upgrade Button

```tsx
{
  !hasPremium(bird) && (
    <TouchableOpacity onPress={showUpgrade}>
      <Text>✨ Celebrate with Premium</Text>
    </TouchableOpacity>
  );
}
```

### Show Charity Impact

```tsx
<CharityIntegrationTracker
  subscriptionPlan={subscription?.plan}
  showGlobalImpact={true}
/>
```

---

**Need Help?** Check the [full implementation guide](./PREMIUM_BIRD_PROFILE_IMPLEMENTATION.md) or review the component source code for detailed examples.
