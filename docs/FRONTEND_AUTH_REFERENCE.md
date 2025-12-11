# Frontend Authentication System - Complete Reference

## 🏗️ Architecture Overview

The authentication system consists of four layers:

```
┌─────────────────────────────────────────────────────┐
│              UI Layer (Screens/Components)           │
│  • welcome.tsx  • signup.tsx  • Protected Screens   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Auth Context (State Management)            │
│  • AuthProvider  • useAuth hook                      │
│  • Token validation  • Session management            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         Auth Manager (Token Management)              │
│  • Token storage  • Expiration checks                │
│  • Centralized token operations                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            API Clients (Network Layer)               │
│  • api-helper.ts  • api-client.ts                    │
│  • Authenticated requests  • Error handling          │
└─────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
wihngo/
├── contexts/
│   └── auth-context.tsx                 # Authentication state management
├── lib/
│   ├── auth/
│   │   └── auth-manager.ts             # Centralized token management
│   ├── api/
│   │   ├── auth.service.ts             # Login/Register API calls
│   │   ├── api-client.ts               # API client with auth
│   │   └── index.ts                    # Service exports
│   └── constants/
│       └── config.ts                   # Storage keys & config
├── services/
│   └── api-helper.ts                   # Legacy API helper (still used)
├── utils/
│   └── auth-debug.ts                   # Debugging utilities
├── app/
│   ├── welcome.tsx                     # Login screen
│   ├── signup.tsx                      # Registration screen
│   └── _layout.tsx                     # Route protection
└── types/
    └── user.ts                         # Auth type definitions
```

---

## 🔑 Core Components

### 1. Auth Context (`contexts/auth-context.tsx`)

**Purpose:** Central state management for authentication

**Provides:**

- `user` - Current user data
- `token` - JWT token
- `isLoading` - Loading state
- `isAuthenticated` - Boolean auth status
- `login(authData)` - Login method
- `logout()` - Logout method
- `updateUser(user)` - Update user data
- `validateAuth()` - Check token validity

**Usage:**

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome {user.name}</div>;
}
```

### 2. Auth Manager (`lib/auth/auth-manager.ts`)

**Purpose:** Centralized token management with expiration

**Key Functions:**

```typescript
// Save token with 24-hour expiry
await saveAuthToken(token);

// Get token (returns null if expired)
const token = await getAuthToken();

// Check if authenticated
const isAuth = await isAuthenticated();

// Clear all auth data
await clearAuthData();

// Get time remaining
const ms = await getTokenTimeRemaining();

// Check if expiring soon
const soon = await isTokenExpiringSoon();
```

### 3. Auth Services (`lib/api/auth.service.ts`)

**Login:**

```typescript
import { loginService } from "@/lib/api";

const authData = await loginService({
  email: "user@example.com",
  password: "password123",
});

await authLogin(authData); // Save to context
```

**Register:**

```typescript
import { registerService } from "@/lib/api";

const authData = await registerService({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
});

await authLogin(authData); // Auto-login after registration
```

### 4. API Clients

**Authenticated Requests:**

```typescript
import { apiHelper } from "@/services/api-helper";

// Automatically includes token
const birds = await apiHelper.get("birds");
const bird = await apiHelper.post("birds", birdData);
```

**Token Handling:**

- Automatically retrieves token from storage
- Checks expiration before requests
- Includes `Authorization: Bearer <token>` header
- Triggers logout on 401 errors

---

## 🔐 Authentication Flow

### Registration Flow

```
User fills form
      ↓
Validate inputs
      ↓
Call registerService()
      ↓
Backend creates user & returns token
      ↓
Call authContext.login(authData)
      ↓
Save token + user + expiry to AsyncStorage
      ↓
Update React state
      ↓
Redirect to home
```

### Login Flow

```
User enters credentials
      ↓
Validate inputs
      ↓
Call loginService()
      ↓
Backend validates & returns token
      ↓
Call authContext.login(authData)
      ↓
Save token + user + expiry to AsyncStorage
      ↓
Update React state
      ↓
Redirect to home
```

### Protected Route Access

```
User navigates to protected route
      ↓
_layout.tsx checks isAuthenticated
      ↓
Is Authenticated?
   ├─ Yes → Allow access
   └─ No → Redirect to /welcome
```

### API Request Flow

```
Component makes API call
      ↓
authenticatedFetch() called
      ↓
Get token from storage
      ↓
Check token expiration
      ↓
Token valid?
   ├─ Yes → Add to headers & make request
   └─ No → Trigger logout & throw error
      ↓
Backend response
      ↓
Status code?
   ├─ 401 → Trigger logout & redirect
   ├─ 403 → Show permission error
   └─ 2xx → Return data
```

---

## 🛡️ Security Features

### Token Expiration

- **Duration:** 24 hours from login
- **Storage:** Saved in AsyncStorage with expiry timestamp
- **Validation:** Checked before every API request
- **Auto-logout:** Triggers when token expires

### Session Management

```typescript
// On app start
useEffect(() => {
  loadAuthData(); // Load from AsyncStorage
}, []);

// Before API calls
const token = await getAuthToken(); // Checks expiration
if (!token) {
  logout(); // Auto-logout if expired
}
```

### Error Handling

**401 Unauthorized:**

- Token invalid or expired
- Automatic logout triggered
- User redirected to login
- All auth data cleared

**403 Forbidden:**

- User authenticated but not authorized
- Show permission error
- Don't logout

---

## 🧪 Testing & Debugging

### Debug Auth State

```typescript
import { debugAuthState } from "@/utils/auth-debug";

// In any component or screen
debugAuthState();
// Logs: token, user, expiry, time remaining
```

### Check Authentication

```typescript
import { isAuthenticated } from "@/lib/auth/auth-manager";

const isAuth = await isAuthenticated();
console.log("User authenticated:", isAuth);
```

### Clear Auth Data (Testing)

```typescript
import { clearAuthData } from "@/utils/auth-debug";

// Manually clear all auth data
await clearAuthData();
```

### Manual Token Check

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check what's in storage
const token = await AsyncStorage.getItem("auth_token");
const user = await AsyncStorage.getItem("auth_user");
const expiry = await AsyncStorage.getItem("auth_token_expiry");

console.log("Token:", token);
console.log("User:", JSON.parse(user));
console.log("Expires:", new Date(parseInt(expiry)));
```

---

## 🔧 Configuration

### Storage Keys

All auth-related storage keys are centralized:

```typescript
// lib/auth/auth-manager.ts
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  TOKEN_EXPIRY: "auth_token_expiry",
};
```

### Token Expiry Duration

```typescript
// lib/auth/auth-manager.ts
const TOKEN_EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

To change expiry, update this constant.

### API Base URL

```typescript
// app.config.ts
extra: {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/";
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Session expired" error on every request

**Causes:**

1. No token in storage
2. Token expired
3. Token format invalid

**Solution:**

```typescript
import { debugAuthState } from "@/utils/auth-debug";
debugAuthState(); // Check token status

// If token missing, user needs to login again
// If token expired, it will be auto-cleared
```

### Issue: Token exists but still getting 401

**Causes:**

1. Backend not accepting token
2. Token format mismatch
3. Backend JWT secret changed

**Solution:**

- Check token format in request headers
- Verify backend JWT configuration
- Try logging in again to get new token

### Issue: User stays logged in forever

**Cause:** Token expiry not being checked

**Solution:**

- Ensure using `getAuthToken()` not direct AsyncStorage
- Check auth-manager is properly integrated
- Verify TOKEN_EXPIRY_KEY is being saved

---

## 📱 Screen Protection

### Protect Individual Screens

```typescript
// In screen component
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "expo-router";

export default function ProtectedScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/welcome");
    }
  }, [isAuthenticated]);

  return <YourContent />;
}
```

### Global Route Protection

Already implemented in `app/_layout.tsx`:

```typescript
useEffect(() => {
  if (isLoading) return;

  const inAuthGroup = segments[0] === "(tabs)";

  if (!isAuthenticated && inAuthGroup) {
    router.replace("/welcome");
  }
}, [isAuthenticated, segments, isLoading]);
```

---

## 🔄 Migration from Old System

If migrating from old auth system:

1. **Clear old storage:**

```typescript
await AsyncStorage.multiRemove(["old_token_key", "old_user_key"]);
```

2. **Users must re-login** to get new tokens with expiry

3. **Update imports:**

```typescript
// Old
import { authenticatedFetch } from "@/services/api-helper";

// New (same, but now with expiration checking)
import { apiHelper } from "@/services/api-helper";
```

---

## 📈 Performance Considerations

- **Token validation** is async but cached in memory
- **Storage reads** happen only when needed
- **Expiry checks** are fast (timestamp comparison)
- **Context updates** trigger minimal re-renders

---

## 🎯 Best Practices

1. **Always use `useAuth` hook** for auth state
2. **Never access AsyncStorage directly** for tokens
3. **Use `apiHelper` or `authenticatedFetch`** for API calls
4. **Check `isAuthenticated`** before protected operations
5. **Handle logout gracefully** in catch blocks
6. **Test with expired tokens** regularly
7. **Log auth state changes** for debugging

---

## 📞 Need Help?

Run debug utility:

```typescript
import { debugAuthState } from "@/utils/auth-debug";
debugAuthState();
```

Check console for:

- Token presence
- Token expiry time
- User data
- Time remaining

---

Last Updated: December 11, 2025
