# 🔄 Migration Guide

This guide helps you migrate to the new refactored project structure.

## Overview of Changes

The project has been reorganized for better maintainability and developer experience:

1. **New `lib/` directory** - Centralized core functionality
2. **Consolidated constants** - All config in one place
3. **Barrel exports** - Cleaner imports
4. **Utility functions** - Reusable helpers extracted
5. **Environment variables** - `.env` support added

## Step-by-Step Migration

### 1. Update Imports - Services

**Before:**

```typescript
import { API_URL } from "@/services/config";
import { authenticatedGet } from "@/services/api-helper";
```

**After:**

```typescript
import { API_CONFIG } from "@/lib/constants";
import { authenticatedGet } from "@/lib/api/api-client";
// Or use barrel export
import { birdService, storyService } from "@/lib/api";
```

### 2. Update Imports - Constants

**Before:**

```typescript
import { Colors } from "@/constants/theme";
import { PREMIUM_PLANS } from "@/constants/premium-config";
```

**After:**

```typescript
import { Colors, PREMIUM_PLANS } from "@/lib/constants";
// Or individual imports
import { Colors } from "@/lib/constants/theme";
import { PREMIUM_PLANS } from "@/lib/constants/premium";
```

### 3. Update Storage Keys

**Before:**

```typescript
const TOKEN_KEY = "auth_token";
await AsyncStorage.getItem(TOKEN_KEY);
```

**After:**

```typescript
import { STORAGE_KEYS } from "@/lib/constants";
await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
// Or use helper
import { getFromStorage } from "@/lib/utils";
await getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
```

### 4. Use Utility Functions

**Before:**

```typescript
const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```

**After:**

```typescript
import { formatCurrency, isValidEmail } from "@/lib/utils";

const price = formatCurrency(49.99); // "$49.99"
const valid = isValidEmail("user@example.com"); // true
```

### 5. Update Type Imports

**Before:**

```typescript
import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import { User } from "@/types/user";
```

**After (using barrel export):**

```typescript
import { Bird, Story, User } from "@/types";
// Original imports still work too
import { Bird } from "@/types/bird";
```

## New Features Available

### Utility Functions

#### Formatting

```typescript
import {
  formatCurrency,
  formatRelativeTime,
  formatCount,
  truncateText,
} from "@/lib/utils";

formatCurrency(99.99); // "$99.99"
formatRelativeTime(new Date()); // "just now"
formatCount(1500); // "1.5K"
truncateText("Long text...", 20); // "Long text..."
```

#### Validation

```typescript
import { isValidEmail, isValidPassword, hasValidLength } from "@/lib/utils";

isValidEmail("test@example.com"); // true

const passwordCheck = isValidPassword("weak");
// { valid: false, errors: [...] }

const lengthCheck = hasValidLength("text", 2, 10);
// { valid: true }
```

#### Storage

```typescript
import { saveToStorage, getFromStorage, removeFromStorage } from "@/lib/utils";

await saveToStorage("key", { data: "value" });
const data = await getFromStorage("key");
await removeFromStorage("key");
```

### Centralized Configuration

All configuration is now in `lib/constants/`:

```typescript
import {
  API_CONFIG, // API settings
  FEATURES, // Feature flags
  VALIDATION, // Validation rules
  IMAGE_CONFIG, // Image settings
  PAGINATION, // Pagination defaults
  Colors, // Theme colors
  Spacing, // Layout spacing
  PREMIUM_PLANS, // Premium tiers
} from "@/lib/constants";

// Use in your code
if (FEATURES.enablePremium) {
  // Show premium features
}

if (file.size > IMAGE_CONFIG.maxSizeBytes) {
  // File too large
}
```

## Breaking Changes

### ⚠️ Service Imports

Old imports from `@/services/` still work but will be deprecated. Migrate to:

- `@/lib/api/api-client` for HTTP methods
- `@/lib/api` for service barrel exports

### ⚠️ Config Location

- `@/services/config` → `@/lib/constants/config`
- Individual configs are now in `lib/constants/`

### ⚠️ Storage Keys

Use constants instead of hardcoded strings:

```typescript
// ❌ Don't use
"auth_token";

// ✅ Use
STORAGE_KEYS.AUTH_TOKEN;
```

## Migration Checklist

- [ ] Update all service imports to use `@/lib/api`
- [ ] Replace config imports with `@/lib/constants`
- [ ] Use utility functions for common operations
- [ ] Replace hardcoded storage keys with constants
- [ ] Update type imports to use barrel exports
- [ ] Test all affected components
- [ ] Remove old imports after verification

## Component Example

### Before

```typescript
import { Bird } from "@/types/bird";
import { API_URL } from "@/services/config";
import { authenticatedGet } from "@/services/api-helper";
import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BirdCard = ({ bird }: { bird: Bird }) => {
  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

  const loadData = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    const data = await authenticatedGet(`${API_URL}/birds`);
  };

  return <Text style={{ color: Colors.light.text }}>...</Text>;
};
```

### After

```typescript
import { Bird } from "@/types";
import { API_CONFIG, Colors, STORAGE_KEYS } from "@/lib/constants";
import { authenticatedGet, getFromStorage, formatCurrency } from "@/lib/utils";

const BirdCard = ({ bird }: { bird: Bird }) => {
  const loadData = async () => {
    const token = await getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
    const data = await authenticatedGet(`${API_CONFIG.baseUrl}/birds`);
  };

  return (
    <Text style={{ color: Colors.light.text }}>
      {formatCurrency(bird.supportTotal)}
    </Text>
  );
};
```

## Need Help?

If you encounter issues during migration:

1. Check this guide for the updated import path
2. Look in `lib/` for the new location
3. Use your IDE's "Find in Files" to locate exports
4. Refer to type definitions in `types/`

## Timeline

- ✅ **Phase 1**: New structure created (Complete)
- 🚧 **Phase 2**: Gradual migration of components (In Progress)
- 📅 **Phase 3**: Deprecate old imports (Future)
- 📅 **Phase 4**: Remove legacy code (Future)

## Benefits of Migration

- ✨ **Cleaner imports** - Barrel exports reduce import clutter
- 🎯 **Better organization** - Logical structure for growing codebase
- 🔧 **Reusable utilities** - Don't repeat yourself
- 📚 **Centralized config** - One place for all settings
- 🚀 **Better TypeScript** - Improved type inference
- 🧪 **Easier testing** - Isolated, testable modules

---

Questions? Check the [README.md](../README.md) or open an issue.
