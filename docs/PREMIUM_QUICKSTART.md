# Premium Bird Pages - Quick Start Guide

## 🚀 For Developers

### Overview

This feature allows bird owners to subscribe ($4.99/month per bird) to unlock:

- ✨ Custom profile frames
- 📌 Story highlights (max 3)
- ⭐ Premium badges
- 🔝 Discovery boost

---

## Frontend (Already Implemented ✅)

### Using Premium Components

#### 1. Show Premium Badge

```tsx
import { PremiumBadge } from "@/components/premium-badge";
import { hasPremium } from "@/services/premium.service";

const isPremium = hasPremium(bird);

{
  isPremium && <PremiumBadge size="small" />;
}
```

#### 2. Show Upgrade Card (for owners)

```tsx
import { PremiumUpgradeCard } from "@/components/premium-upgrade-card";

const isOwner = user?.userId === bird?.ownerId;
const isPremium = hasPremium(bird);

{
  isOwner && !isPremium && <PremiumUpgradeCard onUpgrade={handleUpgrade} />;
}
```

#### 3. Premium Frame Selector (for premium owners)

```tsx
import { PremiumFrameSelector } from "@/components/premium-frame-selector";

{
  isOwner && isPremium && (
    <PremiumFrameSelector
      birdId={bird.birdId}
      currentFrameId={bird.premiumStyle?.frameId}
      onFrameUpdate={refreshBirdData}
    />
  );
}
```

#### 4. Story Highlights (for premium birds)

```tsx
import { StoryHighlights } from "@/components/story-highlights";

{
  isPremium && (
    <StoryHighlights
      birdId={bird.birdId}
      stories={stories}
      onUpdate={refreshStories}
    />
  );
}
```

#### 5. Subscription Manager (for owners)

```tsx
import { PremiumSubscriptionManager } from "@/components/premium-subscription-manager";

{
  isOwner && isPremium && (
    <PremiumSubscriptionManager
      birdId={bird.birdId}
      ownerId={bird.ownerId}
      onStatusChange={refreshBirdData}
    />
  );
}
```

---

## Backend (To Be Implemented)

### Step 1: Database Setup

Run these SQL migrations:

```sql
-- Create subscriptions table
CREATE TABLE bird_premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  plan VARCHAR(20) NOT NULL DEFAULT 'monthly',
  provider VARCHAR(20) NOT NULL,
  provider_subscription_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(bird_id)
);

-- Extend birds table
ALTER TABLE birds
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_style JSONB;

-- Extend stories table
ALTER TABLE stories
ADD COLUMN is_highlighted BOOLEAN DEFAULT FALSE,
ADD COLUMN highlight_order INTEGER;

-- Indexes
CREATE INDEX idx_bird_premium_bird_id ON bird_premium_subscriptions(bird_id);
CREATE INDEX idx_bird_premium_status ON bird_premium_subscriptions(status);
CREATE INDEX idx_birds_premium ON birds(is_premium) WHERE is_premium = TRUE;
CREATE INDEX idx_stories_highlighted ON stories(bird_id, is_highlighted, highlight_order)
  WHERE is_highlighted = TRUE;
```

### Step 2: API Endpoints

Create these endpoints in your backend:

#### Subscribe to Premium

```typescript
POST /birds/:birdId/premium/subscribe

Request:
{
  "birdId": "uuid",
  "provider": "stripe" | "apple" | "google",
  "paymentMethodId": "pm_xxx" // Optional for Stripe
}

Response:
{
  "id": "uuid",
  "birdId": "uuid",
  "status": "active",
  "currentPeriodEnd": "2026-01-08T..."
}

Logic:
1. Verify user owns bird
2. Create Stripe subscription
3. Insert subscription record
4. Set bird.is_premium = true
```

#### Cancel Premium

```typescript
POST /birds/:birdId/premium/cancel

Response:
{
  "status": "canceled",
  "canceledAt": "2025-12-08T..."
}

Logic:
1. Verify ownership
2. Cancel provider subscription
3. Update status (keep premium until period ends)
```

#### Get Premium Status

```typescript
GET /birds/:birdId/premium/status

Response:
{
  "isPremium": true,
  "subscription": {
    "status": "active",
    "currentPeriodEnd": "2026-01-08T..."
  }
}
```

#### Update Premium Style

```typescript
PATCH /birds/:birdId/premium/style

Request:
{
  "frameId": "gold",
  "badgeId": "premium",
  "highlightColor": "#FFD700"
}

Logic:
1. Verify ownership + premium status
2. Update bird.premium_style
```

#### Highlight Story

```typescript
PATCH /birds/:birdId/stories/:storyId/highlight

Request:
{
  "highlightOrder": 1  // or null to remove
}

Logic:
1. Verify ownership + premium
2. Check count < 3
3. Update story fields
```

### Step 3: Webhook Handler

```typescript
POST / webhooks / stripe;

// Handle these events:
switch (event.type) {
  case "customer.subscription.created":
  case "customer.subscription.updated":
    await updateBirdPremium(birdId, subscription.status);
    break;

  case "customer.subscription.deleted":
    await removePremiumFeatures(birdId);
    break;

  case "invoice.payment_failed":
    await handlePaymentFailure(birdId);
    break;
}
```

### Step 4: Background Job

```typescript
// Run daily
async function syncExpiredSubscriptions() {
  const expired = await db.query(`
    SELECT bird_id FROM bird_premium_subscriptions
    WHERE status IN ('active', 'canceled')
    AND current_period_end < NOW()
  `);

  for (const sub of expired) {
    await removePremiumFeatures(sub.bird_id);
  }
}
```

---

## Payment Integration

### Stripe (Web)

```typescript
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe(STRIPE_KEY);

const handleUpgrade = async () => {
  const { error } = await stripe.redirectToCheckout({
    sessionId: sessionId,
  });
};
```

### Apple (iOS)

```typescript
import * as InAppPurchases from "expo-in-app-purchases";

const handleUpgrade = async () => {
  await InAppPurchases.purchaseItemAsync("premium_bird_monthly");
};
```

### Google (Android)

```typescript
import { purchaseItemAsync } from "expo-in-app-purchases";

const handleUpgrade = async () => {
  await purchaseItemAsync("premium_bird_monthly");
};
```

---

## Testing

### Manual Test Flow

1. **View Non-Premium Bird (as owner)**

   - Should see upgrade card
   - Click "Upgrade Now"
   - Should show payment modal

2. **Subscribe to Premium**

   - Complete payment
   - Should see success message
   - Premium badge should appear
   - Frame selector should appear
   - Story highlights should appear

3. **Customize Premium**

   - Select a frame → should save
   - Highlight a story → should show in highlights
   - Try to highlight 4th story → should show error

4. **Cancel Premium**

   - Click cancel in subscription manager
   - Confirm cancellation
   - Premium features should remain until period end

5. **After Expiration**
   - Premium badge removed
   - Frame removed
   - Highlights removed
   - Upgrade card shown again

### API Test Endpoints

```bash
# Get premium status
curl http://localhost:3000/birds/{id}/premium/status

# Subscribe (requires auth)
curl -X POST http://localhost:3000/birds/{id}/premium/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"provider":"stripe"}'

# Update style
curl -X PATCH http://localhost:3000/birds/{id}/premium/style \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"frameId":"gold"}'
```

---

## Environment Setup

### Required Variables

```bash
# .env
API_URL=http://localhost:3000/
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Products

Create in Stripe Dashboard:

- Product: "Premium Bird Page"
- Price: $4.99/month recurring
- Metadata: `feature=premium_bird`

---

## Troubleshooting

### Premium Badge Not Showing

```typescript
// Check:
console.log("bird.isPremium:", bird.isPremium);
console.log("hasPremium result:", hasPremium(bird));

// Fix: Ensure backend returns isPremium field
```

### Subscription Not Working

```typescript
// Check:
console.log("API URL:", Constants.expoConfig?.extra?.apiUrl);
console.log("Bird ID:", birdId);

// Fix: Verify API_URL is set in app.config.ts
```

### Webhooks Not Firing

```bash
# Test webhook locally:
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test event:
stripe trigger customer.subscription.created
```

---

## Support

### Documentation

- `PREMIUM_FRONTEND_GUIDE.md` - Frontend details
- `PREMIUM_BACKEND_GUIDE.md` - Backend implementation
- `PREMIUM_IMPLEMENTATION_SUMMARY.md` - Overview

### Code Locations

- Types: `types/premium.ts`, `types/bird.ts`, `types/story.ts`
- Service: `services/premium.service.ts`
- Components: `components/premium-*.tsx`
- Screen: `screens/bird-profile.tsx`

### Need Help?

Check the implementation summary for detailed architecture and data flow diagrams.

---

## ✅ Checklist

**Frontend:**

- [x] Premium types defined
- [x] Premium service created
- [x] UI components built
- [x] Bird profile updated
- [x] Bird card updated
- [x] Theme extended

**Backend (To Do):**

- [ ] Database migrations
- [ ] API endpoints
- [ ] Webhook handler
- [ ] Background job
- [ ] Payment provider setup

**Integration:**

- [ ] Connect frontend to backend
- [ ] Test subscription flow
- [ ] Test cancellation
- [ ] Test expiration
- [ ] Deploy to production

---

Happy coding! 🚀
