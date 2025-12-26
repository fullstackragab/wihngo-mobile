# Backend Push Notification Implementation Guide

## Overview

The mobile app is using **Expo Push Notifications** to send notifications to users. You'll need to implement endpoints to register devices and send notifications using the Expo Push Notification service.

---

## Important Constants & IDs

### Expo Project ID

```
1f8be543-8a9c-49dc-ae05-8e8161b36f4c
```

This is the Expo project ID being used by the mobile app.

### Push Token Format

Expo push tokens look like:

```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

---

## Required Endpoints

### 1. Register Device for Push Notifications

**Endpoint:** `POST /api/notifications/register-device`  
**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceType": "ios" | "android" | "web",
  "deviceName": "iPhone 14" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

**Database Schema Suggestion:**

```typescript
{
  userId: string (UUID),
  deviceToken: string (unique),
  deviceType: 'ios' | 'android' | 'web',
  deviceName: string?,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Notes:**

- Store unique device tokens per user (one user can have multiple devices)
- Update `updatedAt` if device re-registers
- Set `isActive: false` when unregistered

---

### 2. Unregister Device

**Endpoint:** `POST /api/notifications/unregister-device`  
**Authentication:** Required

**Request Body:**

```json
{
  "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Device unregistered successfully"
}
```

---

### 3. Register for Donation Notifications

**Endpoint:** `POST /api/v1/notifications/register-donation-device`  
**Authentication:** Required

**Request Body:**

```json
{
  "expo_push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios" | "android"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registered for donation notifications"
}
```

---

### 4. Get Notifications (Paginated)

**Endpoint:** `GET /api/notifications?page=1&pageSize=20`  
**Authentication:** Required

**Response:**

```json
{
  "notifications": [
    {
      "notificationId": "uuid",
      "userId": "uuid",
      "type": "support" | "love" | "comment" | "story" | "recommendation",
      "title": "Someone loved your bird!",
      "message": "John loved your Blue Jay",
      "imageUrl": "https://...",
      "isRead": false,
      "createdAt": "2025-12-13T10:30:00Z",
      "relatedId": "bird-uuid-or-story-uuid"
    }
  ],
  "total": 45,
  "hasMore": true
}
```

---

### 5. Get Unread Count

**Endpoint:** `GET /api/notifications/unread-count`  
**Authentication:** Required

**Response:**

```json
{
  "count": 5
}
```

---

### 6. Mark as Read

**Endpoint:** `POST /api/notifications/mark-read`  
**Authentication:** Required

**Request Body:**

```json
{
  "notificationId": "uuid"
}
```

**Response:**

```json
{
  "success": true
}
```

---

### 7. Mark All as Read

**Endpoint:** `POST /api/notifications/mark-all-read`  
**Authentication:** Required

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true
}
```

---

### 8. Delete Notification

**Endpoint:** `DELETE /api/notifications/{notificationId}`  
**Authentication:** Required

**Response:**

```json
{
  "success": true
}
```

---

### 9. Get Notification Preferences

**Endpoint:** `GET /api/notifications/preferences`  
**Authentication:** Required

**Response:**

```json
{
  "supportNotifications": true,
  "loveNotifications": true,
  "commentNotifications": true,
  "storyNotifications": true,
  "recommendationNotifications": true,
  "emailNotifications": false
}
```

---

### 10. Update Preferences

**Endpoint:** `PUT /api/notifications/preferences`  
**Authentication:** Required

**Request Body:**

```json
{
  "supportNotifications": false,
  "loveNotifications": true,
  "commentNotifications": true,
  "storyNotifications": true,
  "recommendationNotifications": true,
  "emailNotifications": false
}
```

**Response:**

```json
{
  "supportNotifications": false,
  "loveNotifications": true,
  "commentNotifications": true,
  "storyNotifications": true,
  "recommendationNotifications": true,
  "emailNotifications": false
}
```

---

### 11. Send Test Notification

**Endpoint:** `POST /api/notifications/test`  
**Authentication:** Required

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "message": "Test notification sent"
}
```

Sends a test notification to all user's registered devices.

---

## Sending Push Notifications

### Install Expo Server SDK

#### For Node.js:

```bash
npm install expo-server-sdk
```

#### For .NET:

Use `RestSharp` or `HttpClient` to send HTTP POST requests to Expo's push notification service.

---

### Implementation Example (Node.js)

```javascript
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendPushNotification(userId, title, body, data = {}) {
  // Get user's device tokens from database
  const devices = await getUserDeviceTokens(userId);

  // Filter valid Expo tokens
  const messages = [];
  for (let device of devices) {
    if (!Expo.isExpoPushToken(device.deviceToken)) {
      console.error(`Invalid token: ${device.deviceToken}`);
      continue;
    }

    messages.push({
      to: device.deviceToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
      badge: await getUnreadCount(userId),
      priority: "high",
      channelId: "default",
    });
  }

  // Send notifications in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending chunk:", error);
    }
  }

  return tickets;
}
```

---

### Implementation Example (.NET/C#)

```csharp
using System.Net.Http;
using System.Text.Json;
using System.Text;

public class ExpoPushNotificationService
{
    private readonly HttpClient _httpClient;
    private const string ExpoApiUrl = "https://exp.host/--/api/v2/push/send";

    public ExpoPushNotificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> SendPushNotification(
        string deviceToken,
        string title,
        string body,
        object data = null,
        int? badge = null)
    {
        var message = new
        {
            to = deviceToken,
            sound = "default",
            title = title,
            body = body,
            data = data ?? new { },
            badge = badge,
            priority = "high",
            channelId = "default"
        };

        var json = JsonSerializer.Serialize(message);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(ExpoApiUrl, content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending push notification: {ex.Message}");
            return false;
        }
    }

    public async Task SendToAllUserDevices(
        Guid userId,
        string title,
        string body,
        object data = null)
    {
        // Get user's device tokens from database
        var devices = await GetUserDeviceTokens(userId);
        var unreadCount = await GetUnreadCount(userId);

        foreach (var device in devices)
        {
            if (device.IsActive)
            {
                await SendPushNotification(
                    device.DeviceToken,
                    title,
                    body,
                    data,
                    unreadCount
                );
            }
        }
    }
}
```

---

## Notification Triggers

Send notifications when:

### 1. Someone supports a bird (`type: "support"`)

```javascript
await sendPushNotification(
  birdOwnerId,
  "Someone supported your bird! 🎉",
  `${supporterName} just donated to support ${birdName}`,
  {
    type: "support",
    birdId: birdId,
    deepLink: `/birds/${birdId}`,
  }
);
```

### 2. Someone loves a bird (`type: "love"`)

```javascript
await sendPushNotification(
  birdOwnerId,
  "Someone loved your bird! ❤️",
  `${loverName} loved ${birdName}`,
  {
    type: "love",
    birdId: birdId,
    deepLink: `/birds/${birdId}`,
  }
);
```

### 3. Comment on story (`type: "comment"`)

```javascript
await sendPushNotification(
  storyAuthorId,
  "New comment on your story",
  `${commenterName} commented: "${commentText}"`,
  {
    type: "comment",
    storyId: storyId,
    deepLink: `/stories/${storyId}`,
  }
);
```

### 4. New story from followed user (`type: "story"`)

```javascript
await sendPushNotification(
  followerId,
  "New story from someone you follow",
  `${authorName} posted: ${storyTitle}`,
  {
    type: "story",
    storyId: storyId,
    deepLink: `/stories/${storyId}`,
  }
);
```

### 5. Bird recommendation (`type: "recommendation"`)

```javascript
await sendPushNotification(
  userId,
  "We have a bird recommendation for you!",
  `Check out this ${birdSpecies} - ${birdName}`,
  {
    type: "recommendation",
    birdId: birdId,
    deepLink: `/birds/${birdId}`,
  }
);
```

---

## Database Tables Needed

### notifications

```sql
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('support', 'love', 'comment', 'story', 'recommendation')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_user_unread (user_id, is_read)
);
```

### user_devices

```sql
CREATE TABLE user_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_token VARCHAR(255) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  device_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active)
);
```

### notification_preferences

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY,
  support_notifications BOOLEAN DEFAULT true,
  love_notifications BOOLEAN DEFAULT true,
  comment_notifications BOOLEAN DEFAULT true,
  story_notifications BOOLEAN DEFAULT true,
  recommendation_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**Important:** Create default preferences when a user registers:

```sql
INSERT INTO notification_preferences (user_id)
VALUES (NEW.user_id)
ON CONFLICT (user_id) DO NOTHING;
```

---

## Testing

### Test sending a notification directly via Expo API:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "Test Notification",
    "body": "This is a test!",
    "sound": "default",
    "data": {"test": true}
  }'
```

### Test your backend endpoint:

```bash
curl -X POST https://your-api.com/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "deviceType": "android",
    "deviceName": "Pixel 6"
  }'
```

---

## Important Notes

### 1. Error Handling

Check for `DeviceNotRegistered` errors and remove invalid tokens:

```javascript
// After sending, check receipts
const receiptIds = tickets.map((ticket) => ticket.id);
const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

for (let chunk of receiptChunks) {
  const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

  for (let receiptId in receipts) {
    const receipt = receipts[receiptId];

    if (receipt.status === "error") {
      if (receipt.details?.error === "DeviceNotRegistered") {
        // Remove this token from database
        await removeDeviceToken(receipt.details.expoPushToken);
      }
    }
  }
}
```

### 2. Rate Limits

- Expo has rate limits on push notification sending
- Batch notifications together
- Use chunking provided by the SDK

### 3. Receipt Checking

- Implement receipt checking to track delivery
- Store receipt IDs for later verification
- Handle failures gracefully

### 4. Badge Count

- Update badge count with unread notification count
- Send badge number in each notification

### 5. Deep Linking

- Include `deepLink` in data payload for navigation
- Format: `/birds/{id}`, `/stories/{id}`, etc.
- Mobile app will handle routing to the correct screen

### 6. Notification Preferences

- Always check user's notification preferences before sending
- Don't send if user has disabled that notification type
- Respect email notification preferences separately

### 7. Priority Levels

- Use `priority: "high"` for important notifications (support, donations)
- Use `priority: "normal"` for less urgent notifications (recommendations)

---

## Expo Push Notification Service API

### Base URL

```
https://exp.host/--/api/v2/push/send
```

### Request Format

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Notification Title",
  "body": "Notification body text",
  "data": {
    "type": "support",
    "birdId": "uuid",
    "deepLink": "/birds/uuid"
  },
  "sound": "default",
  "badge": 5,
  "priority": "high",
  "channelId": "default"
}
```

### Response Format

```json
{
  "data": [
    {
      "status": "ok",
      "id": "receipt-id"
    }
  ]
}
```

### Error Response

```json
{
  "data": [
    {
      "status": "error",
      "message": "DeviceNotRegistered",
      "details": {
        "error": "DeviceNotRegistered"
      }
    }
  ]
}
```

---

## Implementation Checklist

- [ ] Install expo-server-sdk or setup HTTP client
- [ ] Create database tables (notifications, user_devices, notification_preferences)
- [ ] Implement POST /api/notifications/register-device
- [ ] Implement POST /api/notifications/unregister-device
- [ ] Implement POST /api/v1/notifications/register-donation-device
- [ ] Implement GET /api/notifications (with pagination)
- [ ] Implement GET /api/notifications/unread-count
- [ ] Implement POST /api/notifications/mark-read
- [ ] Implement POST /api/notifications/mark-all-read
- [ ] Implement DELETE /api/notifications/{id}
- [ ] Implement GET /api/notifications/preferences
- [ ] Implement PUT /api/notifications/preferences
- [ ] Implement POST /api/notifications/test
- [ ] Setup notification sending service
- [ ] Add notification triggers to relevant events (support, love, comment, etc.)
- [ ] Implement receipt checking and error handling
- [ ] Test with real devices (both iOS and Android)
- [ ] Setup monitoring and logging

---

## Support

For more information:

- [Expo Push Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK on npm](https://www.npmjs.com/package/expo-server-sdk)
- [Expo Push Notification Tool](https://expo.dev/notifications) - Test notifications in browser
