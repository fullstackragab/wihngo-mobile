# 🕊️ Memorial Bird Feature - Backend Requirements

## 📋 Overview

This document outlines the backend API requirements for implementing the memorial bird feature when a bird passes away. This feature ensures transparency, respect, and proper handling of remaining funds while maintaining the bird's profile as a tribute.

---

## 🎯 Core Principles

- **Transparency First** - Clear communication about bird status
- **Respect & Dignity** - Treat memorial birds with care and sensitivity
- **Stop New Donations** - Automatically prevent new support payments
- **Handle Remaining Funds** - Clear policy for unspent balance
- **Preserve Memory** - Keep profile accessible as tribute page
- **Community Support** - Allow condolence messages and sharing

---

## 🗄️ Database Schema

### Updated Birds Table

```sql
-- Add memorial status columns to existing Birds table
ALTER TABLE Birds ADD COLUMN IsMemorial BIT NOT NULL DEFAULT 0;
ALTER TABLE Birds ADD COLUMN MemorialDate DATETIME2 NULL;
ALTER TABLE Birds ADD COLUMN MemorialReason NVARCHAR(500) NULL; -- Optional: "Passed away peacefully", "After long illness", etc.
ALTER TABLE Birds ADD COLUMN FundsRedirectionChoice NVARCHAR(50) NULL; -- 'emergency_fund', 'owner_keeps', 'charity'

-- Index for querying memorial birds
CREATE INDEX IX_Birds_IsMemorial ON Birds(IsMemorial);
```

### Memorial Messages Table

```sql
CREATE TABLE MemorialMessages (
    MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BirdId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    IsApproved BIT NOT NULL DEFAULT 1, -- Auto-approve by default, can moderate if needed
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_MemorialMessages_Birds FOREIGN KEY (BirdId) REFERENCES Birds(BirdId) ON DELETE CASCADE,
    CONSTRAINT FK_MemorialMessages_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    INDEX IX_MemorialMessages_BirdId (BirdId),
    INDEX IX_MemorialMessages_CreatedAt (CreatedAt DESC)
);
```

### Memorial Fund Redirections Table

```sql
CREATE TABLE MemorialFundRedirections (
    RedirectionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BirdId UNIQUEIDENTIFIER NOT NULL,
    PreviousOwnerId UNIQUEIDENTIFIER NOT NULL,
    RemainingBalance DECIMAL(18, 2) NOT NULL,
    RedirectionType NVARCHAR(50) NOT NULL, -- 'emergency_fund', 'owner_payout', 'charity'
    CharityName NVARCHAR(255) NULL, -- If redirected to charity
    ProcessedAt DATETIME2 NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'completed'
    TransactionId NVARCHAR(255) NULL, -- External payment/transfer ID
    Notes NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_MemorialFundRedirections_Birds FOREIGN KEY (BirdId) REFERENCES Birds(BirdId),
    CONSTRAINT FK_MemorialFundRedirections_Users FOREIGN KEY (PreviousOwnerId) REFERENCES Users(UserId),
    INDEX IX_MemorialFundRedirections_Status (Status)
);
```

---

## 🔌 API Endpoints

### 1. Mark Bird as Memorial (Owner Only)

**Endpoint:** `POST /api/birds/{birdId}/memorial`

**Description:** Mark a bird as memorial (deceased). Only the bird owner can perform this action.

**Authorization:** Bearer Token (Must be bird owner)

**Request Body:**

```json
{
  "memorialDate": "2025-12-15T00:00:00Z", // Optional: Date of passing
  "memorialReason": "Passed away peacefully after a wonderful life", // Optional
  "fundsRedirectionChoice": "emergency_fund" // 'emergency_fund', 'owner_keeps', 'charity'
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bird marked as memorial",
  "bird": {
    "birdId": "string (UUID)",
    "name": "Tweety",
    "isMemorial": true,
    "memorialDate": "2025-12-15T00:00:00Z",
    "fundsRedirectionChoice": "emergency_fund",
    "remainingBalance": 150.5
  }
}
```

**Business Logic:**

1. Verify requester is bird owner
2. Update bird record: `IsMemorial = true`
3. Set `MemorialDate` (current date if not provided)
4. **Stop all recurring support** - Cancel any active subscriptions/auto-donations
5. **Prevent new donations** - Donations endpoint will reject new support
6. Calculate remaining balance from PayoutBalances table
7. Create `MemorialFundRedirections` record
8. Send email notification to supporters (optional)
9. Return updated bird data

**Validation:**

- Bird must exist
- User must be the owner
- Bird cannot already be marked as memorial
- `fundsRedirectionChoice` must be one of: 'emergency_fund', 'owner_keeps', 'charity'

---

### 2. Get Memorial Bird Details

**Endpoint:** `GET /api/birds/{birdId}/memorial`

**Description:** Get memorial details for a deceased bird

**Authorization:** Public (anyone can view memorial tribute)

**Response:**

```json
{
  "birdId": "string (UUID)",
  "name": "Tweety",
  "species": "Canary",
  "isMemorial": true,
  "memorialDate": "2025-12-15T00:00:00Z",
  "memorialReason": "Passed away peacefully after a wonderful life",
  "imageUrl": "https://...",
  "coverImageUrl": "https://...",
  "stats": {
    "lovedBy": 1523,
    "supportedBy": 342,
    "totalSupportReceived": 5420.5
  },
  "ownerMessage": "Thank you to everyone who supported Tweety. Your love made a real difference.",
  "messagesCount": 45
}
```

**Notes:**

- Returns full bird details with memorial-specific information
- Includes lifetime statistics (support, loves, etc.)
- Does NOT include sensitive owner information

---

### 3. Add Memorial Message

**Endpoint:** `POST /api/birds/{birdId}/memorial/messages`

**Description:** Add a condolence/tribute message to a memorial bird

**Authorization:** Bearer Token (Authenticated users only)

**Request Body:**

```json
{
  "message": "Tweety was such a beautiful bird. Sending love to the owner. 💛"
}
```

**Response:**

```json
{
  "messageId": "string (UUID)",
  "birdId": "string (UUID)",
  "userId": "string (UUID)",
  "userName": "John Doe",
  "message": "Tweety was such a beautiful bird. Sending love to the owner. 💛",
  "createdAt": "2025-12-15T10:30:00Z"
}
```

**Validation:**

- Bird must exist and be marked as memorial
- User must be authenticated
- Message length: 1-500 characters
- Rate limiting: 3 messages per user per memorial bird per day
- Basic profanity filter (optional)

---

### 4. Get Memorial Messages

**Endpoint:** `GET /api/birds/{birdId}/memorial/messages?page=1&pageSize=20`

**Description:** Get paginated memorial messages for a bird

**Authorization:** Public

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 50)
- `sortBy` (optional): 'recent' or 'popular' (default: 'recent')

**Response:**

```json
{
  "page": 1,
  "pageSize": 20,
  "totalCount": 45,
  "totalPages": 3,
  "messages": [
    {
      "messageId": "string (UUID)",
      "userId": "string (UUID)",
      "userName": "John Doe",
      "userAvatarUrl": "https://...",
      "message": "Tweety was such a beautiful bird. Sending love to the owner. 💛",
      "createdAt": "2025-12-15T10:30:00Z"
    }
  ]
}
```

---

### 5. Delete Memorial Message (Owner or Message Author)

**Endpoint:** `DELETE /api/birds/{birdId}/memorial/messages/{messageId}`

**Description:** Delete a memorial message (only bird owner or message author)

**Authorization:** Bearer Token

**Response:**

```json
{
  "success": true,
  "message": "Memorial message deleted"
}
```

**Business Rules:**

- Only message author or bird owner can delete
- Soft delete (mark as deleted, don't remove from DB)

---

### 6. Process Memorial Fund Redirection (Admin/Background Job)

**Endpoint:** `POST /api/admin/memorial/process-funds/{birdId}`

**Description:** Process remaining balance according to owner's choice

**Authorization:** Admin Token

**Response:**

```json
{
  "success": true,
  "redirection": {
    "redirectionId": "string (UUID)",
    "birdId": "string (UUID)",
    "birdName": "Tweety",
    "remainingBalance": 150.5,
    "redirectionType": "emergency_fund",
    "status": "completed",
    "processedAt": "2025-12-15T11:00:00Z"
  }
}
```

**Business Logic:**

Based on `fundsRedirectionChoice`:

#### Option A: Emergency Fund ('emergency_fund')

```
- Transfer remaining balance to platform emergency fund
- Update MemorialFundRedirections: status = 'completed'
- Send email confirmation to bird owner
- Funds available to help other birds in need
```

#### Option B: Owner Keeps ('owner_keeps')

```
- Add remaining balance to owner's payout balance
- Process payout according to existing payout flow
- Update MemorialFundRedirections: status = 'completed'
- Send payout confirmation email
```

#### Option C: Charity Donation ('charity')

```
- Donate to bird charity (WWF, Audubon, local rescue)
- Record donation transaction
- Update MemorialFundRedirections: status = 'completed'
- Send donation receipt to owner
- Public acknowledgment (optional)
```

---

### 7. Prevent Donations to Memorial Birds

**Endpoint:** `POST /api/birds/{birdId}/support`

**Description:** Existing support endpoint with memorial check

**Authorization:** Bearer Token

**Business Logic Addition:**

```csharp
// Add this check at the beginning of support/donation endpoint
if (bird.IsMemorial)
{
    return BadRequest(new {
        error = "memorial_bird",
        message = "This bird has passed away and is no longer accepting donations. You can leave a memorial message instead.",
        canLeaveMessage = true
    });
}
```

---

## 📊 Background Jobs

### Memorial Bird Notification Job

**Schedule:** Runs when bird is marked as memorial

**Tasks:**

1. Send email to all supporters
2. Notify via push notification (optional)
3. Update bird profile UI across all platforms
4. Stop recurring donations

**Email Template:**

```
Subject: Remembering [Bird Name] 🕊️

Dear [Supporter Name],

We're writing to let you know that [Bird Name], a bird you supported, has passed away.

[Owner's Memorial Message]

Your support meant the world to [Owner Name] and helped provide excellent care for [Bird Name] during their time with us.

The memorial profile for [Bird Name] will remain online as a tribute. You can visit to share memories and leave messages:
[Memorial Link]

Remaining funds: [Details about fund redirection based on owner choice]

With gratitude,
The Wihngo Team
```

---

## 🔐 Security & Privacy Considerations

### Data Protection

- Memorial bird data remains in database (soft delete only)
- Supporter information protected (no email addresses exposed)
- Owner retains control over memorial page settings
- Memorial messages moderated if inappropriate content reported

### Access Control

- Only bird owner can mark bird as memorial
- Only bird owner or message author can delete messages
- Memorial pages are public (non-sensitive tribute information only)
- Admin access required for fund redirection processing

---

## 📧 Notifications

### To Bird Owner

```
Subject: Your Bird's Memorial Profile

Hi [Owner Name],

[Bird Name]'s profile has been successfully converted to a memorial tribute.

What happens next:
✓ The memorial page is now live
✓ New donations are automatically disabled
✓ Supporters can leave tribute messages
✓ Remaining balance: $[amount]
✓ Funds will be [redirected according to choice]

View memorial page: [Link]

Questions? Contact support@wihngo.com
```

### To Supporters

```
Subject: In Memory of [Bird Name] 🕊️

Dear Supporter,

[Bird Name], a bird you lovingly supported, has passed away.

You can visit their memorial page to:
• View photos and memories
• Leave tribute messages
• Share their story

Memorial page: [Link]

Thank you for your compassion and support.
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Mark bird as memorial (owner only)
- [ ] Prevent non-owners from marking bird as memorial
- [ ] Reject donations to memorial birds
- [ ] Add memorial message validation
- [ ] Memorial message pagination
- [ ] Fund redirection calculations

### Integration Tests

- [ ] Full memorial flow (mark -> notify -> redirect funds)
- [ ] Memorial message CRUD operations
- [ ] Support endpoint rejection for memorial birds
- [ ] Fund redirection to emergency fund
- [ ] Fund redirection to owner payout
- [ ] Email notifications sent correctly

### End-to-End Tests

- [ ] Bird owner marks bird as memorial
- [ ] Supporters notified via email
- [ ] Donations rejected automatically
- [ ] Memorial page displays correctly
- [ ] Messages posted and displayed
- [ ] Funds redirected correctly

---

## 🚀 Implementation Phases

### Phase 1: Core Memorial Status (Week 1)

- [ ] Add memorial columns to Birds table
- [ ] Create MemorialMessages table
- [ ] Implement mark as memorial endpoint
- [ ] Add donation prevention logic
- [ ] Basic memorial page API

### Phase 2: Memorial Messages (Week 2)

- [ ] Implement message CRUD endpoints
- [ ] Add pagination and sorting
- [ ] Rate limiting and validation
- [ ] Message moderation (optional)

### Phase 3: Fund Redirection (Week 3)

- [ ] Create MemorialFundRedirections table
- [ ] Implement fund processing logic
- [ ] Emergency fund integration
- [ ] Charity donation integration
- [ ] Owner payout integration

### Phase 4: Notifications & Polish (Week 4)

- [ ] Email notifications to supporters
- [ ] Push notifications (optional)
- [ ] Memorial page optimization
- [ ] Admin dashboard for monitoring
- [ ] Security audit

---

## 📝 Environment Variables

```env
# Memorial Feature Settings
MEMORIAL_EMERGENCY_FUND_ACCOUNT=fund_account_id
MEMORIAL_CHARITY_DEFAULT=WWF_Bird_Conservation

# Email Templates
MEMORIAL_NOTIFICATION_TEMPLATE_ID=memorial_notification_v1
MEMORIAL_OWNER_TEMPLATE_ID=memorial_owner_v1

# Moderation
MEMORIAL_MESSAGE_AUTO_APPROVE=true
MEMORIAL_MESSAGE_MAX_LENGTH=500
MEMORIAL_MESSAGE_RATE_LIMIT=3_per_day
```

---

## 💡 Future Enhancements

1. **Photo/Video Memorial Albums** - Allow owners to curate special memories
2. **Memorial Livestream** - One-time memorial service stream
3. **Digital Certificate** - Printable certificate of support
4. **Memorial Badges** - Special badges for supporters of memorial birds
5. **Annual Remembrance** - Yearly notifications on memorial anniversary
6. **Memorial Garden** - Dedicated page showing all memorial birds
7. **Donation in Memory** - Allow new donations "in memory of" bird to charity

---

## 📚 Related Documentation

- [BACKEND_PAYOUT_REQUIREMENTS.md](BACKEND_PAYOUT_REQUIREMENTS.md) - Payout system integration
- [BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md) - Core API requirements
- [BACKEND_PUSH_NOTIFICATION_SETUP.md](BACKEND_PUSH_NOTIFICATION_SETUP.md) - Notification setup

---

## ✅ Summary

By implementing this memorial bird feature, Wihngo will:

- ✅ Handle bird death with respect and transparency
- ✅ Automatically stop new donations to deceased birds
- ✅ Provide clear policy for remaining funds
- ✅ Preserve bird profiles as tribute pages
- ✅ Enable community support through memorial messages
- ✅ Maintain trust and transparency with supporters
- ✅ Protect platform legally and ethically

**The frontend mobile app is ready and waiting for these endpoints!** 🚀

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Bird Death Occurs                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Owner Marks Bird as Memorial │
        │  POST /api/birds/{id}/memorial │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼────────────────┐
        │  Database Updates:              │
        │  • IsMemorial = true            │
        │  • MemorialDate = [date]        │
        │  • Stop recurring donations     │
        └───────────────┬────────────────┘
                        │
        ┌───────────────▼────────────────────────────────┐
        │  Background Job Triggered:                      │
        │  • Send emails to all supporters                │
        │  • Calculate remaining balance                  │
        │  • Create fund redirection record               │
        └───────────────┬────────────────────────────────┘
                        │
        ┌───────────────▼────────────────────────────────┐
        │  Fund Redirection Options:                      │
        ├────────────────────────────────────────────────┤
        │  A) Emergency Fund   → Platform fund            │
        │  B) Owner Keeps      → Owner payout             │
        │  C) Charity Donation → Bird charity             │
        └───────────────┬────────────────────────────────┘
                        │
        ┌───────────────▼────────────────────────────────┐
        │  Memorial Page Active:                          │
        │  • Profile visible as tribute                   │
        │  • Donations automatically rejected             │
        │  • Memorial messages enabled                    │
        │  • Sharing enabled                              │
        └─────────────────────────────────────────────────┘
```

---

## 🎨 Mobile App Features Already Implemented

The mobile app now includes:

1. **MemorialBadge Component** - Visual indicator for deceased birds
2. **MemorialTribute Component** - Full tribute page with banner, stats, and owner message
3. **MemorialMessages Component** - Condolence message board with posting and viewing
4. **Bird Card Updates** - Memorial status display in bird listings
5. **Bird Profile Integration** - Automatic tribute page for memorial birds
6. **Support Prevention** - Donations automatically disabled for memorial birds

All UI components are complete and waiting for backend API integration! 🎉
