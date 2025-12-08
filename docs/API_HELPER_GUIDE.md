# API Helper Documentation

## Overview

The `api-helper.ts` module provides a centralized, type-safe API client for the Wihngo mobile app. It handles authentication, request/response formatting, error handling, and token management.

---

## Features

✅ **Automatic JWT Token Injection** - Includes auth token in all requests  
✅ **Type-Safe Requests** - Full TypeScript support with generics  
✅ **Error Handling** - Custom ApiError class with detailed error info  
✅ **Session Management** - Auto-logout on 401 responses  
✅ **Empty Response Handling** - Properly handles 204 No Content  
✅ **File Upload Support** - Multipart form data for images  
✅ **Token Management** - Save, retrieve, and clear auth tokens

---

## Usage

### Basic HTTP Methods

```typescript
import { apiHelper } from "@/services/api-helper";

// GET request
const birds = await apiHelper.get<Bird[]>("https://api.example.com/birds");

// POST request
const newBird = await apiHelper.post<Bird>("https://api.example.com/birds", {
  name: "Tweety",
  species: "Canary",
});

// PUT request
const updatedBird = await apiHelper.put<Bird>(
  "https://api.example.com/birds/123",
  { name: "Tweety Updated" }
);

// PATCH request
const patchedBird = await apiHelper.patch<Bird>(
  "https://api.example.com/birds/123",
  { tagline: "New tagline" }
);

// DELETE request
await apiHelper.delete<void>("https://api.example.com/birds/123");
```

### File Upload

```typescript
import { uploadFile } from '@/services/api-helper';

const imageFile = /* ... get file from picker ... */;

const result = await uploadFile<{ url: string }>(
  'https://api.example.com/upload',
  imageFile,
  'image', // field name
  { birdId: '123', type: 'profile' } // additional fields
);

console.log('Uploaded image URL:', result.url);
```

### Token Management

```typescript
import {
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  clearAuthData,
  isAuthenticated,
} from "@/services/api-helper";

// Save token after login
await saveAuthToken("your-jwt-token");

// Check if user is authenticated
const isLoggedIn = await isAuthenticated();

// Get current token
const token = await getAuthToken();

// Remove token on logout
await removeAuthToken();

// Clear all auth data (token + user info)
await clearAuthData();
```

---

## Error Handling

### ApiError Class

All HTTP errors throw an `ApiError` instance with:

```typescript
class ApiError {
  status: number; // HTTP status code (e.g., 404, 500)
  statusText: string; // Status text (e.g., "Not Found")
  data?: any; // Response body (JSON or text)
}
```

### Error Handling Example

```typescript
import { apiHelper, ApiError } from "@/services/api-helper";

try {
  const bird = await apiHelper.get<Bird>(`${API_URL}birds/123`);
  console.log(bird);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    if (error.status === 404) {
      console.log("Bird not found");
    } else if (error.status === 500) {
      console.log("Server error:", error.data);
    }
  } else {
    // Handle network or other errors
    console.error("Request failed:", error);
  }
}
```

---

## Session Management

### Automatic Logout on 401

When the API returns a 401 Unauthorized response:

1. Auth token is automatically cleared from storage
2. User data is removed
3. Error is thrown: `"Session expired. Please login again."`

```typescript
// This is handled automatically by authenticatedFetch
if (response.status === 401) {
  await AsyncStorage.multiRemove([TOKEN_KEY, "auth_user"]);
  throw new Error("Session expired. Please login again.");
}
```

### Implementation in Services

```typescript
export async function getUserProfile(): Promise<UserProfile> {
  try {
    return await apiHelper.get<UserProfile>(`${API_URL}users/profile`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Session expired")) {
      // Redirect to login screen
      router.replace("/welcome");
    }
    throw error;
  }
}
```

---

## Advanced Features

### Custom Headers

For requests that need custom headers:

```typescript
import { authenticatedFetch } from "@/services/api-helper";

const response = await authenticatedFetch("https://api.example.com/birds", {
  method: "GET",
  headers: {
    "X-Custom-Header": "value",
    "Accept-Language": "en-US",
  },
});

const data = await response.json();
```

### Empty Response Handling

The helper automatically handles empty responses:

- **204 No Content**: Returns `{}` (empty object)
- **201 Created**: Checks for body, returns parsed JSON or `{}`
- **DELETE**: Safely handles both empty and non-empty responses

```typescript
// DELETE typically returns 204 No Content
await apiHelper.delete<void>(`${API_URL}birds/123`);
// Returns {} even if server sends no body
```

---

## Configuration

### API URL Setup

The API URL is configured in `app.config.ts`:

```typescript
// app.config.ts
export default {
  extra: {
    apiUrl:
      process.env.APP_MODE === "production"
        ? "https://api.wihngo.com/api/"
        : "http://localhost:5000/api/",
  },
};
```

### Using in Services

```typescript
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

Or use the centralized config:

```typescript
import { API_URL } from "@/services/config";
```

---

## Best Practices

### 1. Always Use Type Parameters

```typescript
// ✅ Good - Type-safe
const birds = await apiHelper.get<Bird[]>(`${API_URL}birds`);

// ❌ Bad - No type safety
const birds = await apiHelper.get(`${API_URL}birds`);
```

### 2. Handle Errors Gracefully

```typescript
try {
  const bird = await apiHelper.get<Bird>(`${API_URL}birds/${id}`);
  setBird(bird);
} catch (error) {
  console.error("Failed to fetch bird:", error);
  Alert.alert("Error", "Could not load bird. Please try again.");
}
```

### 3. Use Loading States

```typescript
const [loading, setLoading] = useState(false);

const fetchBirds = async () => {
  setLoading(true);
  try {
    const data = await apiHelper.get<Bird[]>(`${API_URL}birds`);
    setBirds(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### 4. Implement Retry Logic (Optional)

```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

// Usage
const birds = await fetchWithRetry(() =>
  apiHelper.get<Bird[]>(`${API_URL}birds`)
);
```

---

## Testing

### Mock apiHelper in Tests

```typescript
// __mocks__/api-helper.ts
export const apiHelper = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

export const saveAuthToken = jest.fn();
export const getAuthToken = jest.fn();
export const removeAuthToken = jest.fn();
export const clearAuthData = jest.fn();
```

### Test Example

```typescript
import { apiHelper } from "@/services/api-helper";
import { getBirdsService } from "@/services/bird.service";

jest.mock("@/services/api-helper");

describe("getBirdsService", () => {
  it("should fetch birds successfully", async () => {
    const mockBirds = [{ id: "1", name: "Tweety" }];
    (apiHelper.get as jest.Mock).mockResolvedValue(mockBirds);

    const result = await getBirdsService();

    expect(apiHelper.get).toHaveBeenCalledWith(
      expect.stringContaining("birds")
    );
    expect(result).toEqual(mockBirds);
  });
});
```

---

## API Reference

### Methods

| Method                                                | Description            | Parameters               | Returns                   |
| ----------------------------------------------------- | ---------------------- | ------------------------ | ------------------------- |
| `apiHelper.get<T>(url)`                               | GET request            | `url: string`            | `Promise<T>`              |
| `apiHelper.post<T>(url, data)`                        | POST request           | `url: string, data: any` | `Promise<T>`              |
| `apiHelper.put<T>(url, data)`                         | PUT request            | `url: string, data: any` | `Promise<T>`              |
| `apiHelper.patch<T>(url, data)`                       | PATCH request          | `url: string, data: any` | `Promise<T>`              |
| `apiHelper.delete<T>(url)`                            | DELETE request         | `url: string`            | `Promise<T>`              |
| `uploadFile<T>(url, file, fieldName, additionalData)` | Upload file            | See below                | `Promise<T>`              |
| `saveAuthToken(token)`                                | Save JWT token         | `token: string`          | `Promise<void>`           |
| `getAuthToken()`                                      | Get JWT token          | -                        | `Promise<string \| null>` |
| `removeAuthToken()`                                   | Remove JWT token       | -                        | `Promise<void>`           |
| `clearAuthData()`                                     | Clear all auth data    | -                        | `Promise<void>`           |
| `isAuthenticated()`                                   | Check if authenticated | -                        | `Promise<boolean>`        |

### uploadFile Parameters

```typescript
uploadFile<T>(
  url: string,              // Upload endpoint
  file: File | Blob,        // File to upload
  fieldName?: string,       // Form field name (default: 'file')
  additionalData?: Record<string, any>  // Additional form fields
): Promise<T>
```

---

## Migration Guide

If you have existing fetch calls, migrate them to use `apiHelper`:

### Before

```typescript
const response = await fetch(`${API_URL}birds`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (!response.ok) {
  throw new Error("Failed to fetch");
}

const birds = await response.json();
```

### After

```typescript
const birds = await apiHelper.get<Bird[]>(`${API_URL}birds`);
```

**Benefits:**

- ✅ Automatic token injection
- ✅ Type safety
- ✅ Better error handling
- ✅ Less boilerplate
- ✅ Consistent patterns

---

## Troubleshooting

### Issue: "Session expired" errors

**Cause**: Token is invalid or expired  
**Solution**:

1. Clear app storage/cache
2. Logout and login again
3. Check backend token expiration settings

### Issue: Network request failed

**Cause**: Network connectivity or wrong API URL  
**Solution**:

1. Check internet connection
2. Verify API_URL in `app.config.ts`
3. Check backend is running

### Issue: CORS errors (web only)

**Cause**: Backend doesn't allow requests from web origin  
**Solution**: Configure CORS on backend to allow your web domain

---

## Security Notes

⚠️ **Token Storage**: Tokens are stored in AsyncStorage (secure on native, less secure on web)  
⚠️ **HTTPS**: Always use HTTPS in production  
⚠️ **Token Expiration**: Implement refresh token logic for better security  
⚠️ **Sensitive Data**: Never log tokens or sensitive data in production

---

## Future Enhancements

- [ ] Request/response interceptors
- [ ] Request caching
- [ ] Retry logic with exponential backoff
- [ ] Request cancellation (AbortController)
- [ ] Offline queue
- [ ] Request deduplication
- [ ] Performance monitoring

---

## Support

For issues or questions about the API helper:

1. Check this documentation
2. Review `BACKEND_API.md` for endpoint details
3. Check service implementations in `/services`
4. Review error logs in console

---

**Last Updated**: December 2025  
**Version**: 1.0.0
