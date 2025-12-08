# Premium Bird Pages - Backend Implementation Guide

This document provides implementation guidance for the backend API endpoints and webhook handlers for the Premium Bird Pages feature.

## Database Schema

### 1. Create `bird_premium_subscriptions` table

```sql
CREATE TABLE bird_premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  plan VARCHAR(20) NOT NULL DEFAULT 'monthly',

  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'apple', 'google')),
  provider_subscription_id VARCHAR(255) NOT NULL,

  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(bird_id)
);

CREATE INDEX idx_bird_premium_bird_id ON bird_premium_subscriptions(bird_id);
CREATE INDEX idx_bird_premium_owner_id ON bird_premium_subscriptions(owner_id);
CREATE INDEX idx_bird_premium_status ON bird_premium_subscriptions(status);
```

### 2. Extend `birds` table

```sql
ALTER TABLE birds
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_style JSONB;

-- Create index for premium birds
CREATE INDEX idx_birds_premium ON birds(is_premium) WHERE is_premium = TRUE;
```

### 3. Extend `stories` table

```sql
ALTER TABLE stories
ADD COLUMN is_highlighted BOOLEAN DEFAULT FALSE,
ADD COLUMN highlight_order INTEGER;

-- Create index for highlighted stories
CREATE INDEX idx_stories_highlighted ON stories(bird_id, is_highlighted, highlight_order)
WHERE is_highlighted = TRUE;
```

## API Endpoints

### POST /birds/:birdId/premium/subscribe

Subscribe a bird to premium features.

**Request Body:**

```json
{
  "birdId": "uuid",
  "paymentMethodId": "string (optional)",
  "provider": "stripe" | "apple" | "google"
}
```

**Logic:**

1. Verify user owns the bird
2. Check if bird already has active subscription
3. Create subscription with payment provider
4. Insert record in `bird_premium_subscriptions`
5. Update `birds.is_premium = true`

**Response:**

```json
{
  "id": "uuid",
  "birdId": "uuid",
  "ownerId": "uuid",
  "status": "active",
  "plan": "monthly",
  "provider": "stripe",
  "providerSubscriptionId": "sub_xxx",
  "startedAt": "2025-12-08T...",
  "currentPeriodEnd": "2026-01-08T...",
  "createdAt": "2025-12-08T...",
  "updatedAt": "2025-12-08T..."
}
```

---

### POST /birds/:birdId/premium/cancel

Cancel premium subscription for a bird.

**Logic:**

1. Verify user owns the bird
2. Find active subscription
3. Cancel with payment provider
4. Update `status = 'canceled'`, set `canceled_at`
5. Keep `is_premium = true` until current_period_end

**Response:**

```json
{
  "id": "uuid",
  "status": "canceled",
  "canceledAt": "2025-12-08T...",
  "currentPeriodEnd": "2026-01-08T..."
}
```

---

### GET /birds/:birdId/premium/status

Get premium subscription status for a bird.

**Response:**

```json
{
  "isPremium": true,
  "subscription": {
    "id": "uuid",
    "status": "active",
    "plan": "monthly",
    "currentPeriodEnd": "2026-01-08T...",
    "provider": "stripe"
  }
}
```

---

### PATCH /birds/:birdId/premium/style

Update premium style settings for a bird.

**Request Body:**

```json
{
  "frameId": "gold",
  "badgeId": "premium",
  "highlightColor": "#FFD700"
}
```

**Logic:**

1. Verify user owns the bird
2. Verify bird has active premium
3. Update `birds.premium_style`

**Response:**

```json
{
  "premiumStyle": {
    "frameId": "gold",
    "badgeId": "premium",
    "highlightColor": "#FFD700"
  }
}
```

---

### PATCH /birds/:birdId/stories/:storyId/highlight

Highlight a story (premium feature).

**Request Body:**

```json
{
  "highlightOrder": 1 // or null to remove highlight
}
```

**Logic:**

1. Verify user owns the bird
2. Verify bird has active premium
3. Check highlight count < 3 (MAX_HIGHLIGHTS)
4. Update `stories.is_highlighted` and `highlight_order`

**Response:**

```json
{
  "success": true
}
```

---

## Webhook Handler (Critical)

### Stripe Webhook: POST /webhooks/stripe

Handle subscription lifecycle events.

**Events to handle:**

#### customer.subscription.created

```javascript
if (event.type === "customer.subscription.created") {
  const subscription = event.data.object;
  const birdId = subscription.metadata.bird_id;

  await updateBirdPremiumStatus(birdId, {
    status: "active",
    currentPeriodEnd: subscription.current_period_end,
  });
}
```

#### customer.subscription.updated

```javascript
if (event.type === "customer.subscription.updated") {
  const subscription = event.data.object;
  const birdId = subscription.metadata.bird_id;

  await updateBirdPremiumStatus(birdId, {
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
  });

  // If not active, remove premium features
  if (subscription.status !== "active") {
    await removePremiumFeatures(birdId);
  }
}
```

#### customer.subscription.deleted

```javascript
if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object;
  const birdId = subscription.metadata.bird_id;

  await updateBirdPremiumStatus(birdId, {
    status: "expired",
  });

  await removePremiumFeatures(birdId);
}
```

#### invoice.payment_failed

```javascript
if (event.type === "invoice.payment_failed") {
  const invoice = event.data.object;
  const subscription = invoice.subscription;
  const birdId = subscription.metadata.bird_id;

  await updateBirdPremiumStatus(birdId, {
    status: "past_due",
  });

  // Grace period logic: keep premium for 3 days
  // Show warning banner to user
}
```

---

## Helper Functions

### updateBirdPremiumStatus(birdId, updates)

```javascript
async function updateBirdPremiumStatus(birdId, updates) {
  const isPremiumActive = updates.status === "active";

  // Update subscription record
  await db.query(
    `
    UPDATE bird_premium_subscriptions
    SET status = $1, current_period_end = $2, updated_at = NOW()
    WHERE bird_id = $3
  `,
    [updates.status, updates.currentPeriodEnd, birdId]
  );

  // Update bird record
  await db.query(
    `
    UPDATE birds
    SET is_premium = $1, updated_at = NOW()
    WHERE id = $2
  `,
    [isPremiumActive, birdId]
  );
}
```

### removePremiumFeatures(birdId)

```javascript
async function removePremiumFeatures(birdId) {
  // Remove premium style
  await db.query(
    `
    UPDATE birds
    SET is_premium = FALSE, premium_style = NULL, updated_at = NOW()
    WHERE id = $1
  `,
    [birdId]
  );

  // Remove story highlights
  await db.query(
    `
    UPDATE stories
    SET is_highlighted = FALSE, highlight_order = NULL, updated_at = NOW()
    WHERE bird_id = $1
  `,
    [birdId]
  );
}
```

---

## Background Jobs

### Daily Subscription Sync Job

Run this daily to expire premium subscriptions:

```javascript
async function syncExpiredSubscriptions() {
  const now = new Date();

  // Find subscriptions that have expired
  const expiredSubs = await db.query(
    `
    SELECT bird_id FROM bird_premium_subscriptions
    WHERE status IN ('active', 'canceled')
    AND current_period_end < $1
  `,
    [now]
  );

  for (const sub of expiredSubs) {
    await updateBirdPremiumStatus(sub.bird_id, {
      status: "expired",
    });

    await removePremiumFeatures(sub.bird_id);
  }
}
```

---

## Edge Cases

### 1. Bird Deleted

```sql
-- Cascade handled by FK constraint
-- ON DELETE CASCADE in bird_premium_subscriptions
```

### 2. Owner Deleted

```sql
-- Cancel all subscriptions for this owner
UPDATE bird_premium_subscriptions
SET status = 'canceled', canceled_at = NOW()
WHERE owner_id = $1 AND status = 'active';
```

### 3. Platform Subscription Restored

```javascript
// iOS/Android restore purchase flow
async function restorePurchase(userId, receipt) {
  // Validate receipt with Apple/Google
  const validation = await validateReceipt(receipt);

  if (validation.isValid) {
    const birdId = validation.metadata.bird_id;

    await updateBirdPremiumStatus(birdId, {
      status: "active",
      currentPeriodEnd: validation.expiresDate,
    });
  }
}
```

---

## Testing Checklist

- [ ] Subscribe to premium successfully
- [ ] Cancel premium successfully
- [ ] Premium features removed after cancellation period ends
- [ ] Webhook handles payment failures
- [ ] Webhook handles subscription renewals
- [ ] Highlighted stories limited to 3
- [ ] Non-premium birds can't access premium features
- [ ] Premium badge displays correctly
- [ ] Premium birds boosted in discovery
- [ ] Subscription sync job runs daily

---

## Security Considerations

1. **Verify ownership**: Always check `user.id === bird.owner_id`
2. **Validate premium**: Check `is_premium = true` before allowing premium actions
3. **Webhook security**: Verify webhook signatures from payment providers
4. **Rate limiting**: Add rate limits to subscription endpoints
5. **Idempotency**: Handle duplicate webhook events gracefully

---

## Feature Flags

```javascript
const FEATURE_FLAGS = {
  premium_bird_pages: true, // Set to false to disable feature
  premium_max_highlights: 3,
  premium_grace_period_days: 3,
};
```

---

This completes the backend implementation guide for Premium Bird Pages.
