# Premium Bird Pages - Frontend Implementation

This document describes the frontend implementation of the Premium Bird Pages feature.

## Overview

Premium Bird Pages allows bird owners to subscribe on a per-bird basis to unlock premium features:

- Custom profile frames
- Story highlights (up to 3 pinned stories)
- Premium badges
- Visual prioritization in discovery

## Architecture

### Type Definitions

**New Types:**

- `types/premium.ts` - Premium subscription types
- Extended `types/bird.ts` - Added `isPremium` and `premiumStyle`
- Extended `types/story.ts` - Added `isHighlighted` and `highlightOrder`

### Services

**`services/premium.service.ts`**

Key functions:

```typescript
// Subscription management
subscribeBirdToPremium(birdId, dto)
cancelBirdPremium(birdId)
getBirdPremiumStatus(birdId)

// Premium features
updateBirdPremiumStyle(birdId, style)
highlightStory(birdId, storyId, order)
unhighlightStory(birdId, storyId)

// Utilities
hasPremium(bird) - Check if bird has active premium
getPremiumFeatures(isPremium) - Get available features
```

## UI Components

### 1. `PremiumUpgradeCard`

**Location:** `components/premium-upgrade-card.tsx`

Shows upgrade CTA for non-premium birds. Displays features and pricing.

**Usage:**

```tsx
<PremiumUpgradeCard onUpgrade={handleUpgrade} />
```

**Features shown:**

- Custom Frames
- Story Highlights
- Premium Badge
- More Visibility

---

### 2. `PremiumBadge`

**Location:** `components/premium-badge.tsx`

Visual indicator for premium birds. Available in three sizes.

**Usage:**

```tsx
<PremiumBadge size="small" | "medium" | "large" />
```

**Styling:**

- Gold background (#FFD700)
- Star icon
- "PREMIUM" text

---

### 3. `PremiumFrameSelector`

**Location:** `components/premium-frame-selector.tsx`

Allows premium bird owners to select custom profile frames.

**Usage:**

```tsx
<PremiumFrameSelector
  birdId={bird.birdId}
  currentFrameId={bird.premiumStyle?.frameId}
  onFrameUpdate={handleUpdate}
/>
```

**Available Frames:**

- Gold
- Silver
- Rainbow
- Nature
- Ocean
- Sunset

---

### 4. `StoryHighlights`

**Location:** `components/story-highlights.tsx`

Displays and manages highlighted stories for premium birds.

**Usage:**

```tsx
<StoryHighlights
  birdId={bird.birdId}
  stories={stories}
  onUpdate={handleUpdate}
/>
```

**Features:**

- Max 3 highlights
- Horizontal scroll
- Add/remove highlights
- Premium-only feature

---

### 5. `PremiumSubscriptionManager`

**Location:** `components/premium-subscription-manager.tsx`

Manages active subscriptions, displays billing info, allows cancellation.

**Usage:**

```tsx
<PremiumSubscriptionManager
  birdId={bird.birdId}
  ownerId={bird.ownerId}
  onStatusChange={handleStatusChange}
/>
```

**Displays:**

- Subscription status
- Plan details
- Next billing date
- Provider info
- Cancel button

---

## Integration Points

### Bird Profile Page

**File:** `screens/bird-profile.tsx`

**Changes:**

1. Added premium badge next to bird name
2. Premium upgrade card for non-premium birds (owner only)
3. Premium subscription manager (owner only)
4. Frame selector (premium owners only)
5. Story highlights section (premium birds)

**Conditional Rendering:**

```tsx
const isPremiumBird = hasPremium(bird);
const isOwner = user?.userId === bird?.ownerId;

{
  isOwner && !isPremiumBird && <PremiumUpgradeCard />;
}
{
  isOwner && isPremiumBird && <PremiumFeatures />;
}
```

---

### Bird Card Component

**File:** `components/bird-card.tsx`

**Changes:**

1. Premium badge in bird listings
2. Gold border for premium birds
3. Gold image border
4. Shadow effect for premium cards

**Visual Boost:**

```tsx
<TouchableOpacity style={[styles.card, isPremium && styles.premiumCard]}>
  <Image style={[styles.image, isPremium && styles.premiumImage]} />
  {isPremium && <PremiumBadge size="small" />}
</TouchableOpacity>
```

---

## Data Flow

### 1. Loading Premium Status

```
Component Mount
  ↓
getBirdPremiumStatus(birdId)
  ↓
API: GET /birds/:id/premium/status
  ↓
Update UI with subscription data
```

### 2. Subscribing to Premium

```
User clicks "Upgrade Now"
  ↓
subscribeBirdToPremium(birdId, provider)
  ↓
API: POST /birds/:id/premium/subscribe
  ↓
Payment provider flow
  ↓
Webhook updates subscription
  ↓
Refresh bird data
```

### 3. Updating Premium Style

```
User selects frame
  ↓
updateBirdPremiumStyle(birdId, { frameId })
  ↓
API: PATCH /birds/:id/premium/style
  ↓
Update bird.premiumStyle
  ↓
Refresh UI
```

### 4. Highlighting Stories

```
User clicks highlight on story
  ↓
Check: isPremium && highlightCount < 3
  ↓
highlightStory(birdId, storyId, order)
  ↓
API: PATCH /birds/:id/stories/:storyId/highlight
  ↓
Update story.isHighlighted
  ↓
Refresh story list
```

---

## Styling Guidelines

### Premium Colors

```typescript
const PREMIUM_COLORS = {
  gold: "#FFD700",
  accent: theme.colors.accent,
  shadow: "rgba(255, 215, 0, 0.3)",
};
```

### Premium Card Style

```typescript
premiumCard: {
  borderWidth: 2,
  borderColor: '#FFD700',
  shadowColor: '#FFD700',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
}
```

### Premium Badge Style

```typescript
badge: {
  backgroundColor: theme.colors.accent,
  borderRadius: 8,
  paddingHorizontal: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
}
```

---

## Error Handling

### API Errors

```typescript
try {
  await subscribeBirdToPremium(birdId, dto);
  Alert.alert("Success", "Successfully subscribed!");
} catch (error) {
  console.error("Subscription failed:", error);
  Alert.alert("Error", "Failed to subscribe. Please try again.");
}
```

### Premium Guard

```typescript
if (!hasPremium(bird)) {
  Alert.alert(
    "Premium Required",
    "This feature requires a premium subscription."
  );
  return;
}
```

### Highlight Limit

```typescript
if (highlightedStories.length >= MAX_HIGHLIGHTS) {
  Alert.alert(
    "Limit Reached",
    `You can only highlight up to ${MAX_HIGHLIGHTS} stories`
  );
  return;
}
```

---

## Testing

### Manual Testing Checklist

**Premium Badge:**

- [ ] Badge appears on premium birds in listings
- [ ] Badge appears on premium bird profile page
- [ ] Badge has correct size variants

**Premium Cards:**

- [ ] Premium birds have gold border in listings
- [ ] Premium birds have shadow effect
- [ ] Premium image has gold border

**Upgrade Flow:**

- [ ] Non-premium owners see upgrade card
- [ ] Upgrade button triggers subscription flow
- [ ] Success message appears on subscription

**Frame Selector:**

- [ ] Premium owners can select frames
- [ ] Selected frame is highlighted
- [ ] Frame persists on refresh
- [ ] Non-premium owners don't see selector

**Story Highlights:**

- [ ] Premium birds can highlight stories
- [ ] Max 3 highlights enforced
- [ ] Highlights appear in order
- [ ] Remove highlight works correctly
- [ ] Non-premium birds can't highlight

**Subscription Manager:**

- [ ] Shows current subscription status
- [ ] Shows next billing date
- [ ] Cancel button works
- [ ] Confirmation dialog appears

---

## Future Enhancements

1. **More Frame Options**

   - Seasonal frames
   - Animated frames
   - Custom color frames

2. **Additional Premium Features**

   - Priority support
   - Advanced analytics
   - Multiple cover images
   - Video profile

3. **Gift Subscriptions**

   - Gift premium to another bird
   - Gift cards

4. **Bulk Discounts**

   - Discount for multiple birds
   - Annual plan option

5. **Premium Tiers**
   - Basic ($4.99/month)
   - Premium ($9.99/month) - more features
   - Elite ($19.99/month) - all features

---

## API Integration Notes

### Required Backend Endpoints

```
POST   /birds/:id/premium/subscribe
POST   /birds/:id/premium/cancel
GET    /birds/:id/premium/status
PATCH  /birds/:id/premium/style
PATCH  /birds/:id/stories/:storyId/highlight
```

See `PREMIUM_BACKEND_GUIDE.md` for full API specifications.

---

## Dependencies

**Existing:**

- `expo-constants` - API configuration
- `@expo/vector-icons` - Icons
- `react-native` - Core components

**New (if needed):**

- Stripe SDK for web payments
- In-app purchase libraries for iOS/Android

---

## Configuration

### API URL

Set in `app.config.ts`:

```javascript
extra: {
  apiUrl: process.env.API_URL || "http://localhost:3000/";
}
```

### Feature Flags

Can be added to config:

```typescript
const FEATURES = {
  premiumBirdPages: true,
  premiumMaxHighlights: 3,
};
```

---

## Troubleshooting

### Premium Badge Not Showing

- Check `bird.isPremium` is true
- Verify import of `PremiumBadge` component
- Check if `hasPremium(bird)` returns true

### Subscription Not Updating

- Check webhook is properly configured
- Verify API response includes updated status
- Check if component is refreshing after update

### Highlight Not Working

- Verify bird has active premium
- Check highlight count < 3
- Ensure story belongs to the bird
- Verify user owns the bird

---

This completes the frontend implementation documentation for Premium Bird Pages.
