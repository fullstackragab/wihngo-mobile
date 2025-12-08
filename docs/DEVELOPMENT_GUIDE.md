# 🔧 Development Guide

A comprehensive guide for developing the Wihngo application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Best Practices](#best-practices)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: Xcode (Mac only)
- **Android**: Android Studio + Android SDK

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/fullstackragab/wihngo.git
cd wihngo

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm start
```

## Project Structure

### Directory Overview

```
wihngo/
├── app/                    # 📱 Expo Router pages
│   ├── (tabs)/            # Main tab navigation
│   ├── story/             # Story screens
│   └── *.tsx              # Other screens
├── components/            # 🧩 Reusable components
│   └── ui/               # Base UI components
├── lib/                   # 📚 Core library (NEW)
│   ├── api/              # API client & services
│   ├── constants/        # Configuration
│   └── utils/            # Utility functions
├── types/                # 📝 TypeScript definitions
├── contexts/             # 🌐 React contexts
├── hooks/                # 🪝 Custom hooks
└── docs/                 # 📖 Documentation
```

### Key Directories Explained

#### `app/` - Pages & Navigation

Expo Router uses file-based routing:

- `app/(tabs)/home.tsx` → `/home` (Tab screen)
- `app/story/[id].tsx` → `/story/123` (Dynamic route)
- `app/welcome.tsx` → `/welcome` (Root screen)

#### `lib/` - Core Functionality

**NEW organized structure:**

- `lib/api/` - API client and services
- `lib/constants/` - All configuration
- `lib/utils/` - Helper functions

#### `components/` - UI Components

Reusable components organized by feature:

- `bird-card.tsx` - Bird display card
- `premium-badge.tsx` - Premium indicator
- `ui/` - Base components

#### `types/` - Type Definitions

TypeScript interfaces and types:

- `bird.ts` - Bird-related types
- `story.ts` - Story types
- `user.ts` - User types

## Development Workflow

### 1. Running the App

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### 2. Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

   - Edit files in `app/`, `components/`, etc.
   - Add types in `types/`
   - Create utilities in `lib/utils/`

3. **Test your changes**

   - Verify on iOS/Android
   - Check TypeScript errors: `npx tsc --noEmit`

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/my-feature
   ```

### 3. Code Style

We follow standard TypeScript/React Native conventions:

```typescript
// ✅ Good
export const BirdCard = ({ bird }: { bird: Bird }) => {
  const handlePress = () => {
    // Handle press
  };

  return (
    <View style={styles.container}>
      <Text>{bird.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Best Practices

### Import Organization

```typescript
// 1. React and React Native
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Third-party libraries
import { useRouter } from "expo-router";

// 3. Local imports - use barrel exports
import { Bird } from "@/types";
import { Colors, API_CONFIG } from "@/lib/constants";
import { formatCurrency, isValidEmail } from "@/lib/utils";
import { birdService } from "@/lib/api";

// 4. Components
import BirdCard from "@/components/bird-card";
```

### Component Structure

```typescript
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bird } from "@/types";
import { Colors } from "@/lib/constants";

interface BirdCardProps {
  bird: Bird;
  onPress?: () => void;
}

export const BirdCard = ({ bird, onPress }: BirdCardProps) => {
  // 1. Hooks at the top
  const [liked, setLiked] = useState(false);

  // 2. Handlers
  const handleLike = () => {
    setLiked(!liked);
  };

  // 3. Render
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{bird.name}</Text>
    </View>
  );
};

// 4. Styles at the bottom
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.card,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
```

### API Calls

```typescript
import { birdService } from '@/lib/api';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);

  const loadBirds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await birdService.getBirds();
      setBirds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (/* ... */);
};
```

### Type Safety

```typescript
// ✅ Always define prop types
interface MyComponentProps {
  title: string;
  count?: number;
  onPress: () => void;
}

// ✅ Use enums for constants
enum BirdStatus {
  Active = "active",
  Memorial = "memorial",
  Rescued = "rescued",
}

// ✅ Define return types for complex functions
function calculateTotal(items: Bird[]): number {
  return items.reduce((sum, item) => sum + item.supportTotal, 0);
}
```

## Common Tasks

### Adding a New Screen

1. Create file in `app/` directory:

   ```typescript
   // app/my-screen.tsx
   import { View, Text } from "react-native";

   export default function MyScreen() {
     return (
       <View>
         <Text>My Screen</Text>
       </View>
     );
   }
   ```

2. Navigation happens automatically via file path
3. Add to navigation if needed in `app/_layout.tsx`

### Creating a New Component

1. Create file in `components/`:

   ```typescript
   // components/my-component.tsx
   import { View, Text, StyleSheet } from "react-native";

   interface MyComponentProps {
     title: string;
   }

   export const MyComponent = ({ title }: MyComponentProps) => {
     return (
       <View style={styles.container}>
         <Text>{title}</Text>
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       padding: 16,
     },
   });
   ```

2. Import and use:
   ```typescript
   import { MyComponent } from "@/components/my-component";
   ```

### Adding a New API Service

1. Create service file in `services/`:

   ```typescript
   // services/myfeature.service.ts
   import { API_CONFIG } from "@/lib/constants";
   import { authenticatedGet, authenticatedPost } from "@/lib/api/api-client";

   export const myFeatureService = {
     getItems: () => authenticatedGet(`${API_CONFIG.baseUrl}/items`),

     createItem: (data: any) =>
       authenticatedPost(`${API_CONFIG.baseUrl}/items`, data),
   };
   ```

2. Add to `lib/api/index.ts`:
   ```typescript
   export { myFeatureService } from "@/services/myfeature.service";
   ```

### Adding Utility Functions

1. Add to appropriate file in `lib/utils/`:

   ```typescript
   // lib/utils/format.ts
   export function formatBirdName(name: string): string {
     return name.charAt(0).toUpperCase() + name.slice(1);
   }
   ```

2. Export from `lib/utils/index.ts` if needed
3. Use with barrel import:
   ```typescript
   import { formatBirdName } from "@/lib/utils";
   ```

### Adding Environment Variables

1. Add to `.env.example`:

   ```env
   NEW_FEATURE_ENABLED=false
   ```

2. Add to `.env`:

   ```env
   NEW_FEATURE_ENABLED=true
   ```

3. Use in code via `lib/constants/config.ts`:
   ```typescript
   export const FEATURES = {
     newFeature: process.env.NEW_FEATURE_ENABLED === "true",
   };
   ```

## Troubleshooting

### Common Issues

#### Metro Bundler Cache Issues

```bash
# Clear cache and restart
npx expo start -c
```

#### iOS Build Fails

```bash
cd ios
pod install
cd ..
npm run ios
```

#### Android Build Fails

```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Type Errors

```bash
# Check all TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit path/to/file.tsx
```

### Debug Tools

#### React Native Debugger

1. Install React Native Debugger
2. Shake device/press `Cmd+D` (iOS) or `Cmd+M` (Android)
3. Select "Debug"

#### Console Logs

```typescript
console.log("Debug:", data);
console.error("Error:", error);
console.warn("Warning:", warning);
```

#### Expo Dev Tools

- Access at `http://localhost:19002` when running `npm start`
- View logs, device info, and more

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Router Docs](https://expo.github.io/router/docs/)

## Getting Help

1. Check [docs/](.) for guides
2. Search existing issues
3. Ask in team chat
4. Create new issue with details

---

Happy coding! 🚀
