# Notification System Setup Guide

This guide covers the complete setup and configuration of the notification system in Wihngo.

## 📦 Installation

### 1. Install Required Dependencies

```bash
npx expo install expo-notifications expo-device
```

### 2. Configure app.json

Update your `app.json` with notification settings:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#4ECDC4",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#4ECDC4",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "POST_NOTIFICATIONS"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 3. Configure Deep Linking

Add URL scheme to `app.json`:

```json
{
  "expo": {
    "scheme": "wihngo",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "wihngo",
              "host": "notification"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:wihngo.app"]
    }
  }
}
```

### 4. Update Push Notification Service

The Expo Project ID is already configured in `services/push-notification.service.ts`:

```typescript
const EXPO_PROJECT_ID = "wihngo";
```

If you need to change it, update this constant at the top of the file.

To verify your project ID:

```bash
npx expo whoami
npx eas project:info
```

## 🚀 Usage

### Display Notification Bell

The notification bell is automatically added to all tab screens. To customize placement:

```tsx
import { NotificationBell } from "@/components/notification-bell";

// In your header
<Header>
  <NotificationBell />
</Header>;
```

### Manage Notification Preferences

```tsx
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

function Settings() {
  const { preferences, loading, updatePreference } =
    useNotificationPreferences();

  return (
    <Switch
      value={preferences.loveNotifications}
      onValueChange={(value) => updatePreference("loveNotifications", value)}
    />
  );
}
```

### Display Notifications List

```tsx
import { useNotifications } from "@/hooks/useNotifications";

function NotificationsList() {
  const { notifications, loading, unreadCount, markAsRead } =
    useNotifications();

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => markAsRead(item.id)}
        />
      )}
    />
  );
}
```

### Request Push Permissions

```tsx
import { pushNotificationService } from "@/services/push-notification.service";

async function requestPermissions() {
  const granted = await pushNotificationService.requestPermission();
  if (granted) {
    await pushNotificationService.initialize();
  }
}
```

### Send Test Notification

```tsx
import { notificationService } from "@/services/notification.service";

async function testNotification() {
  await notificationService.sendTestNotification();
}
```

## 🔧 Configuration

### Notification Types

The system supports 10 notification types:

1. **love** - Someone loved your bird
2. **support** - Someone supported your bird
3. **comment** - Someone commented on your content
4. **story** - New story from followed bird
5. **bird_update** - Update about loved bird
6. **recommendation** - Bird/content recommendation
7. **system** - System announcements
8. **payment** - Payment confirmations
9. **premium** - Premium subscription updates
10. **achievement** - User achievements

### Notification Channels

- **Push Notifications** - Expo Push Notifications
- **In-App Notifications** - NotificationCenter modal
- **Email Notifications** - Backend service (optional)
- **SMS Notifications** - Backend service (optional)

### Deep Link Routes

Notifications support deep linking to specific content:

```typescript
{
  bird: "/birds/{birdId}",
  story: "/story/{storyId}",
  comment: "/story/{storyId}#comment-{commentId}",
  profile: "/profile/{userId}",
  payment: "/payment-methods",
  premium: "/premium",
  settings: "/settings"
}
```

## 🧪 Testing

### Test Push Notifications Locally

1. **Request permissions**:

   ```tsx
   await pushNotificationService.requestPermission();
   ```

2. **Get push token**:

   ```tsx
   const token = await pushNotificationService.registerForPushNotifications();
   console.log("Push Token:", token);
   ```

3. **Send test via Expo**:
   ```bash
   npx expo push:test [YOUR_PUSH_TOKEN]
   ```

### Test Notification API

```typescript
// Test notification creation
await notificationService.sendTestNotification();

// Check unread count
const count = await notificationService.getUnreadCount();

// Mark as read
await notificationService.markAsRead(notificationId);
```

## 📱 Platform-Specific Notes

### iOS

- Requires physical device for push notifications (simulator doesn't support)
- Must configure APNs certificates in Expo dashboard
- Requires `UIBackgroundModes` for background notifications

### Android

- Supports push notifications on emulator
- Requires Firebase Cloud Messaging (FCM)
- Add `google-services.json` from Firebase Console
- Set up notification channels for Android 8.0+

## 🔒 Security

### Push Token Management

- Tokens are securely stored on the backend
- Tokens expire and are automatically refreshed
- Unregister tokens on logout:

```typescript
await pushNotificationService.unregisterForPushNotifications();
```

### API Authentication

All notification API calls require authentication:

- Bearer token in Authorization header
- Token managed by AuthContext
- Automatic token refresh on expiration

## 🐛 Troubleshooting

### Notifications Not Appearing

1. Check permissions:

   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log("Permission status:", status);
   ```

2. Verify push token registration:

   ```typescript
   const token = await Notifications.getExpoPushTokenAsync();
   console.log("Push token:", token);
   ```

3. Check backend logs for delivery failures

### Badge Count Not Updating

- iOS: Ensure `setBadgeCountAsync` permission granted
- Android: Badge support varies by launcher

### Deep Links Not Working

1. Verify URL scheme in `app.json`
2. Test deep link:
   ```bash
   npx uri-scheme open wihngo://notification/birds/123 --ios
   ```

## 📊 Backend Requirements

The notification system requires the following backend endpoints:

### Notification Endpoints

- `GET /api/notifications` - Get paginated notifications
- `GET /api/notifications/unread-count` - Get unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Preference Endpoints

- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences

### Push Token Endpoints

- `POST /api/notifications/register-device` - Register push token
- `DELETE /api/notifications/unregister-device` - Unregister token

### Test Endpoint

- `POST /api/notifications/test` - Send test notification

See `docs/BACKEND_API.md` for detailed API specifications.

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure app.json
3. ✅ Update Expo project ID
4. ✅ Test push permissions
5. ✅ Implement backend endpoints
6. ✅ Test end-to-end flow
7. ✅ Deploy to production

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Backend Implementation Guide](./BACKEND_API.md)
