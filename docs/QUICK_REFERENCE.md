# 🚀 Quick Reference Card

One-page reference for common development tasks in Wihngo.

## 📦 Common Imports

```typescript
// Types
import { Bird, Story, User, Premium } from "@/types";

// Constants & Config
import { Colors, API_CONFIG, PREMIUM_PLANS, VALIDATION } from "@/lib/constants";

// Utilities
import {
  formatCurrency,
  formatRelativeTime,
  formatCount,
  isValidEmail,
  isValidPassword,
  saveToStorage,
  getFromStorage,
} from "@/lib/utils";

// API Services
import { birdService, storyService, userService } from "@/lib/api";

// Components
import BirdCard from "@/components/bird-card";

// Navigation
import { useRouter } from "expo-router";

// React Native
import { View, Text, StyleSheet, Pressable } from "react-native";
```

## 🎨 Common Patterns

### Component Template

```typescript
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/lib/constants";

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent = ({ title, onPress }: MyComponentProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
});
```

### API Call Pattern

```typescript
import { useState, useEffect } from 'react';
import { birdService } from '@/lib/api';
import { Bird } from '@/types';

const MyScreen = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Bird[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const birds = await birdService.getBirds();
      setData(birds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (/* ... */);
};
```

### Form Validation Pattern

```typescript
import { useState } from 'react';
import { isValidEmail, hasValidLength } from '@/lib/utils';
import { VALIDATION } from '@/lib/constants';

const MyForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Submit form
    }
  };

  return (/* ... */);
};
```

### Navigation Pattern

```typescript
import { useRouter } from 'expo-router';

const MyComponent = () => {
  const router = useRouter();

  const navigateToBird = (id: number) => {
    router.push(`/birds/${id}`);
  };

  const goBack = () => {
    router.back();
  };

  return (/* ... */);
};
```

## 🔧 Common Commands

```bash
# Development
npm start                 # Start Expo dev server
npm run ios              # Run on iOS
npm run android          # Run on Android

# Clearing cache
npx expo start -c        # Clear cache and start

# Type checking
npx tsc --noEmit         # Check TypeScript errors

# Linting
npm run lint             # Run ESLint
```

## 📱 Screen Examples

### List Screen

```typescript
export default function BirdListScreen() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadBirds();
  }, []);

  const loadBirds = async () => {
    const data = await birdService.getBirds();
    setBirds(data);
  };

  return (
    <FlatList
      data={birds}
      renderItem={({ item }) => (
        <BirdCard
          bird={item}
          onPress={() => router.push(`/birds/${item.id}`)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}
```

### Detail Screen

```typescript
export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams();
  const [bird, setBird] = useState<Bird | null>(null);

  useEffect(() => {
    loadBird();
  }, [id]);

  const loadBird = async () => {
    const data = await birdService.getBird(Number(id));
    setBird(data);
  };

  if (!bird) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <Text style={styles.name}>{bird.name}</Text>
      <Text>{bird.species}</Text>
    </ScrollView>
  );
}
```

## 🎨 Styling Shortcuts

```typescript
import { Colors, Spacing, BorderRadius, Shadows } from "@/lib/constants";

const styles = StyleSheet.create({
  // Use theme colors
  card: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.border,
  },

  // Use spacing constants
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Use border radius
  rounded: {
    borderRadius: BorderRadius.lg,
  },

  // Use shadows
  elevated: {
    ...Shadows.md,
  },
});
```

## 🔑 Constants Reference

```typescript
// API
API_CONFIG.baseUrl; // API base URL
API_CONFIG.timeout; // Request timeout

// Features
FEATURES.enablePremium; // Premium enabled?
FEATURES.enableNotifications;

// Validation
VALIDATION.minPasswordLength;
VALIDATION.maxBioLength;
VALIDATION.maxStoryContentLength;

// Image
IMAGE_CONFIG.maxSizeBytes;
IMAGE_CONFIG.allowedTypes;

// Storage Keys
STORAGE_KEYS.AUTH_TOKEN;
STORAGE_KEYS.USER_PROFILE;
```

## 🛠️ Utility Functions

```typescript
// Formatting
formatCurrency(99.99); // "$99.99"
formatCount(15000); // "15.0K"
formatRelativeTime(date); // "2h ago"
truncateText("Long...", 20); // "Long..."

// Validation
isValidEmail("test@test.com"); // true/false
isValidPassword("password"); // { valid, errors }
hasValidLength("text", 2, 10); // { valid, error? }

// Storage
await saveToStorage(key, value);
await getFromStorage(key);
await removeFromStorage(key);
```

## 🐛 Debugging

```typescript
// Console logging
console.log("Data:", data);
console.error("Error:", error);
console.warn("Warning:", warning);

// JSON stringify for objects
console.log(JSON.stringify(bird, null, 2));

// React Native Debugger
// Cmd+D (iOS) / Cmd+M (Android) → Debug
```

## 📝 Type Examples

```typescript
// Bird
const bird: Bird = {
  id: 1,
  name: "Charlie",
  species: "Parrot",
  ownerId: 123,
  // ... more fields
};

// Story
const story: Story = {
  id: 1,
  title: "My Story",
  content: "Content...",
  authorId: 123,
  // ... more fields
};

// User
const user: User = {
  id: 1,
  email: "user@example.com",
  name: "John Doe",
  // ... more fields
};
```

## 🔐 Auth Pattern

```typescript
import { useAuth } from "@/contexts/auth-context";

const MyScreen = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login(email, password);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Text>Welcome {user?.name}</Text>;
};
```

## 📂 File Locations Cheatsheet

| Need           | Location                        |
| -------------- | ------------------------------- |
| New screen     | `app/screen-name.tsx`           |
| Tab screen     | `app/(tabs)/screen-name.tsx`    |
| Component      | `components/component-name.tsx` |
| Type           | `types/feature.ts`              |
| Service        | `services/feature.service.ts`   |
| Utility        | `lib/utils/util-name.ts`        |
| Config         | `lib/constants/config.ts`       |
| Style constant | `lib/constants/theme.ts`        |

## ⚡ Pro Tips

1. **Use barrel exports** - Import multiple items from one location
2. **Type your props** - Always define component prop interfaces
3. **Extract utilities** - Don't repeat formatting/validation logic
4. **Use constants** - No magic strings or numbers
5. **Handle errors** - Always use try/catch with async
6. **Clean up effects** - Return cleanup functions in useEffect
7. **Memoize callbacks** - Use useCallback for child components
8. **Style consistently** - Use theme constants

---

**Print this page and keep it handy!** 📌
