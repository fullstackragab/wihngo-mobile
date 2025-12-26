# Authentication System - Quick Reference Card

## 🚀 Quick Start

### Use Authentication in Components

```typescript
import { useAuth } from "@/contexts/auth-context";

const { user, token, isAuthenticated, login, logout } = useAuth();
```

### Make Authenticated API Calls

```typescript
import { apiHelper } from "@/services/api-helper";

const data = await apiHelper.get("birds");
const result = await apiHelper.post("birds", birdData);
```

### Login User

```typescript
import { loginService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const { login } = useAuth();
const authData = await loginService({ email, password });
await login(authData);
```

### Register User

```typescript
import { registerService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const { login } = useAuth();
const authData = await registerService({ name, email, password });
await login(authData); // Auto-login
```

---

## 🔍 Debug Commands

```typescript
import { debugAuthState } from "@/utils/auth-debug";

// Check auth state
debugAuthState();

// Manual checks
import {
  isAuthenticated,
  getTokenTimeRemaining,
} from "@/lib/auth/auth-manager";

const isAuth = await isAuthenticated();
const timeLeft = await getTokenTimeRemaining();
```

---

## 🏗️ Key Files

| File                        | Purpose               |
| --------------------------- | --------------------- |
| `contexts/auth-context.tsx` | Auth state management |
| `lib/auth/auth-manager.ts`  | Token management      |
| `lib/api/auth.service.ts`   | Login/Register APIs   |
| `services/api-helper.ts`    | API client with auth  |

---

## 🔐 Token Info

- **Duration:** 24 hours
- **Storage:** AsyncStorage
- **Keys:** `auth_token`, `auth_user`, `auth_token_expiry`
- **Auto-expires:** Yes
- **Validation:** Before every API request

---

## ⚠️ Common Patterns

### Protect a Screen

```typescript
const { isAuthenticated } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!isAuthenticated) {
    router.replace("/welcome");
  }
}, [isAuthenticated]);
```

### Handle Auth Errors

```typescript
try {
  await apiHelper.get("protected-endpoint");
} catch (error) {
  if (error.message.includes("Session expired")) {
    // Already logged out by AuthContext
    showNotification("Please login again");
  }
}
```

### Check Before Action

```typescript
const { isAuthenticated, token } = useAuth();

const handlePayment = async () => {
  if (!isAuthenticated || !token) {
    router.replace("/welcome");
    return;
  }
  // Proceed with payment
};
```

---

## 📱 Backend Integration

**Required Response Format:**

```json
{
  "token": "eyJhbGc...",
  "userId": "123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Required Endpoints:**

- `POST /api/auth/register`
- `POST /api/auth/login`

**Protected Endpoints:**

- Require: `Authorization: Bearer <token>`
- Return 401 if invalid

---

## 🐛 Troubleshooting

**"Session expired" on every request:**

```typescript
debugAuthState(); // Check token status
// If no token, user must login again
```

**Token not persisting:**

```typescript
// Check token is being saved
const token = await AsyncStorage.getItem("auth_token");
console.log("Token:", token);
```

**401 errors:**

```typescript
// Verify backend is accepting token format
// Check JWT secret matches
// Try fresh login
```

---

## 📚 Documentation

- **Backend Guide:** `docs/BACKEND_AUTH_IMPLEMENTATION.md`
- **Frontend Reference:** `docs/FRONTEND_AUTH_REFERENCE.md`
- **System Checklist:** `docs/AUTH_SYSTEM_CHECKLIST.md`

---

## ✅ Testing Checklist

- [ ] Login works
- [ ] Registration works
- [ ] Token saved with expiry
- [ ] Protected routes redirect
- [ ] API calls include token
- [ ] 401 triggers logout
- [ ] Expired tokens clear
- [ ] Debug tools work

---

**Version:** 2.0  
**Last Updated:** December 11, 2025  
**Status:** ✅ Production Ready
