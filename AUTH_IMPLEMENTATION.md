# Authentication Implementation

This project now has a complete authentication system integrated with your .NET backend.

## Features Implemented

### 1. **Type Definitions** (`types/user.ts`)

- `User` - User profile data
- `UserCreateDto` - Registration payload
- `LoginDto` - Login credentials
- `AuthResponseDto` - Server response with JWT token

### 2. **Auth Service** (`services/auth.service.ts`)

- `registerService()` - Register new users
- `loginService()` - Login existing users
- `testAuthConnection()` - Test backend connection
- Automatic Android emulator support (localhost → 10.0.2.2)
- Comprehensive error handling

### 3. **Auth Context** (`contexts/auth-context.tsx`)

- Global authentication state management
- Persistent storage using AsyncStorage
- JWT token management
- User profile caching

### 4. **Updated Screens**

#### Welcome Screen (`app/welcome.tsx`)

- Integrated login functionality
- Form validation
- Loading states
- Error handling with alerts
- Auto-navigation after successful login

#### Signup Screen (`app/signup.tsx`)

- Complete registration flow
- Password confirmation
- Form validation (email, password strength)
- Loading states
- Auto-navigation after signup

#### Profile Screen (`app/(tabs)/profile.tsx`)

- Display logged-in user info
- Logout functionality
- Auth state checks

## How to Use

### Register a New User

```typescript
import { registerService } from "@/services/auth.service";

const userData = {
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
};

const authData = await registerService(userData);
// Returns: { token, userId, name, email }
```

### Login

```typescript
import { loginService } from "@/services/auth.service";

const credentials = {
  email: "john@example.com",
  password: "password123",
};

const authData = await loginService(credentials);
// Returns: { token, userId, name, email }
```

### Access Auth State in Components

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please login</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Button onPress={logout}>Logout</Button>
    </View>
  );
}
```

### Making Authenticated API Requests

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { token } = useAuth();

  const fetchProtectedData = async () => {
    const response = await fetch(`${API_URL}protected-endpoint`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  };
}
```

## Backend Endpoints

The service connects to these endpoints:

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth` - Test connection

## Environment Configuration

Make sure your `.env.development` or `.env.production` has:

```env
API_URL=http://192.168.x.x:PORT/api/
```

For physical devices, use your computer's local IP address.
For Android emulator, the service automatically converts `localhost` to `10.0.2.2`.

## Security Features

- ✅ JWT token storage in AsyncStorage
- ✅ Automatic token inclusion in requests
- ✅ Password hashing on backend (BCrypt)
- ✅ Token expiration (7 days)
- ✅ Secure password fields
- ✅ Input validation

## Error Handling

All services include comprehensive error handling:

- Network errors
- Validation errors
- 401 Unauthorized
- 409 Conflict (duplicate email)
- Server errors

## Next Steps

To protect routes and require authentication:

1. Create a protected route wrapper:

```typescript
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/welcome");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return null;

  return children;
}
```

2. Add token refresh logic
3. Implement "Remember Me" functionality
4. Add biometric authentication
