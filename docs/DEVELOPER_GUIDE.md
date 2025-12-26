# Whingo App - Developer Quick Start Guide

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📁 Project Structure

```
wihngo/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Tab-based navigation
│   │   ├── home.tsx            # Home screen
│   │   ├── profile.tsx         # Profile screen
│   │   ├── stories.tsx         # Stories feed
│   │   └── birds/              # Birds screens
│   ├── welcome.tsx             # Login screen
│   ├── signup.tsx              # Registration screen
│   └── _layout.tsx             # Root layout with auth
├── components/                 # Reusable components
│   ├── ui/                     # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── rounded-text-input.tsx
│   │   └── loading.tsx
│   └── ...
├── contexts/                   # React contexts
│   └── auth-context.tsx        # Authentication context
├── lib/                        # Utilities and APIs
│   └── api/                    # API services
├── constants/                  # App constants
│   └── theme.ts                # Design system
└── types/                      # TypeScript types
```

## 🎨 UI Components

### Button

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button
  title="Sign In"
  onPress={handleSubmit}
  loading={isLoading}
/>

// With icon
<Button
  title="Add Bird"
  icon="plus"
  variant="secondary"
  onPress={handleAdd}
/>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: small, medium, large
```

### RoundedTextInput

```tsx
import RoundedTextInput from "@/components/ui/rounded-text-input";

<RoundedTextInput
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  icon="envelope"
  error={emailError}
  keyboardType="email-address"
/>;
```

### Card

```tsx
import { Card } from '@/components/ui';

// Basic card
<Card>
  <Text>Content</Text>
</Card>

// Elevated card
<Card variant="elevated" padding={20}>
  <Text>Content</Text>
</Card>

// Clickable card
<Card onPress={handlePress}>
  <Text>Tap me</Text>
</Card>
```

### Loading & EmptyState

```tsx
import { Loading, EmptyState } from '@/components/ui';

// Loading
<Loading message="Loading birds..." />

// Empty state
<EmptyState
  icon="dove"
  title="No birds found"
  message="Start by adding your first bird"
  action={{
    label: "Add Bird",
    onPress: () => router.push('/add-bird')
  }}
/>
```

## 🎨 Theme System

### Using Colors

```tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const MyComponent = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
};
```

### Available Colors

```typescript
// Brand Colors
colors.primary; // #4ECDC4
colors.primaryDark; // #44A08D
colors.secondary; // #667EEA

// Semantic Colors
colors.success; // #10b981
colors.error; // #EF4444
colors.warning; // #F59E0B
colors.info; // #3B82F6

// UI Colors
colors.background;
colors.card;
colors.border;
colors.text;
colors.textSecondary;
```

## 🔐 Authentication

### Using Auth Context

```tsx
import { useAuth } from "@/contexts/auth-context";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Login
  const handleLogin = async () => {
    const authData = await loginService({ email, password });
    await login(authData);
  };

  // Logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}</Text>
      ) : (
        <Text>Please login</Text>
      )}
    </View>
  );
};
```

## 🛣️ Navigation

### Using Router

```tsx
import { useRouter } from "expo-router";

const MyComponent = () => {
  const router = useRouter();

  // Navigate to screen
  router.push("/settings");

  // Navigate with params
  router.push(`/bird/${birdId}`);

  // Replace (no back button)
  router.replace("/(tabs)/home");

  // Go back
  router.back();
};
```

## 📡 API Integration

### Example Service

```typescript
import { apiClient } from "@/lib/api/api-client";

export const birdService = {
  getBirds: async () => {
    const response = await apiClient.get("/birds");
    return response.data;
  },

  getBirdById: async (id: string) => {
    const response = await apiClient.get(`/birds/${id}`);
    return response.data;
  },

  createBird: async (data: CreateBirdDto) => {
    const response = await apiClient.post("/birds", data);
    return response.data;
  },
};
```

## 🎯 Common Patterns

### Loading State

```tsx
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const data = await service.getData();
    setData(data);
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};
```

### Pull to Refresh

```tsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#4ECDC4"]}
    />
  }
>
  {/* Content */}
</ScrollView>;
```

### Form Validation

```tsx
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");

const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    setEmailError("Invalid email address");
    return false;
  }
  setEmailError("");
  return true;
};

<RoundedTextInput
  value={email}
  onChangeText={(text) => {
    setEmail(text);
    validateEmail(text);
  }}
  error={emailError}
/>;
```

## 🎨 Styling Best Practices

### Use StyleSheet

```tsx
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

### Gradient Backgrounds

```tsx
import { LinearGradient } from "expo-linear-gradient";

<LinearGradient
  colors={["#4ECDC4", "#44A08D"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.gradient}
>
  {/* Content */}
</LinearGradient>;
```

## 🔍 TypeScript Tips

### Define Props

```typescript
interface MyComponentProps {
  title: string;
  onPress: () => void;
  optional?: boolean;
}

export default function MyComponent({
  title,
  onPress,
  optional = false,
}: MyComponentProps) {
  // Component code
}
```

### Custom Types

```typescript
// types/bird.ts
export interface Bird {
  birdId: string;
  name: string;
  species: string;
  imageUrl?: string;
  lovedBy: number;
  supportedBy: number;
}

export type CreateBirdDto = Omit<Bird, "birdId">;
```

## 🐛 Debugging

### Console Logging

```typescript
console.log("✅ Success:", data);
console.error("❌ Error:", error);
console.warn("⚠️ Warning:", message);
```

### React DevTools

- Install React Native Debugger
- Shake device -> Debug
- Use Chrome DevTools

## 📱 Platform-Specific Code

```typescript
import { Platform } from "react-native";

const padding = Platform.select({
  ios: 20,
  android: 16,
  default: 16,
});

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 44 : 0,
  },
});
```

## 🚀 Performance Tips

1. **Use memo for expensive renders**

```typescript
const MemoizedComponent = React.memo(MyComponent);
```

2. **Optimize FlatList**

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  maxToPerformanceRenderPerBatch={10}
  windowSize={10}
/>
```

3. **Lazy load images**

```tsx
<Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎉 Ready to Code!

You're all set to start developing amazing features for Whingo! Check out the OPTIMIZATION_REPORT.md for detailed information about the recent improvements.
