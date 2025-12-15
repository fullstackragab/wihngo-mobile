# RTL (Right-to-Left) Implementation Guide

## Overview

RTL support has been implemented for Arabic language throughout the app. This guide explains how RTL works and how to implement it in new screens.

## Current Implementation Status

### ✅ Completed

- **i18n initialization** - RTL is set up when app starts based on saved language
- **Language Context** - Provides `isRTL` state and handles RTL toggling with app restart
- **Payout Settings Page** - Full RTL support with dynamic layouts and text alignment
- **Settings Page** - Full RTL support for all UI elements
- **App restart mechanism** - Automatic reload when switching between RTL/LTR languages

### 🔧 How RTL Works

#### 1. **App Initialization** (`i18n/index.ts`)

When the app starts:

```typescript
const shouldBeRTL = initialLanguage === "ar";
if (I18nManager.isRTL !== shouldBeRTL) {
  I18nManager.forceRTL(shouldBeRTL);
  I18nManager.allowRTL(shouldBeRTL);
}
```

#### 2. **Language Context** (`contexts/language-context.tsx`)

Provides RTL state to all components:

```typescript
const { isRTL } = useLanguage();
```

When language changes to/from Arabic:

- Sets `I18nManager.forceRTL()` and `I18nManager.allowRTL()`
- Prompts user to restart app via `expo-updates`
- App reload applies RTL layout changes

#### 3. **Component Implementation**

Each screen needs to apply RTL to:

- **flexDirection**: Use `row-reverse` for RTL
- **textAlign**: Use `right` for RTL

## Implementation Guide for New Screens

### Step 1: Import Required Dependencies

```typescript
import { I18nManager } from "react-native";
import { useLanguage } from "@/contexts/language-context";
```

### Step 2: Get RTL State

```typescript
const { isRTL } = useLanguage();
// OR directly use
const isRTL = I18nManager.isRTL;
```

### Step 3: Apply RTL to Styles

#### For Row Layouts (with flexDirection)

```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
  },
});
```

#### For Text Elements

```typescript
const styles = StyleSheet.create({
  text: {
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});
```

#### Common Patterns

**Setting Item with Icon and Text:**

```typescript
settingItem: {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  justifyContent: "space-between",
  alignItems: "center",
},
settingLeft: {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  alignItems: "center",
  gap: 12,
},
settingText: {
  textAlign: I18nManager.isRTL ? "right" : "left",
},
```

**Card Headers:**

```typescript
cardHeader: {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  justifyContent: "space-between",
  alignItems: "center",
},
cardTitle: {
  textAlign: I18nManager.isRTL ? "right" : "left",
},
```

**Button with Icon:**

```typescript
button: {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  alignItems: "center",
  gap: 8,
},
```

**Badge/Tag Lists:**

```typescript
badges: {
  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  gap: 8,
},
```

## Complete Example

```typescript
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  I18nManager,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/contexts/language-context";
import { useTranslation } from "react-i18next";

export default function MyScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("myScreen.title")}</Text>
        <Ionicons name="settings-outline" size={24} />
      </View>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="add-circle-outline" size={20} />
        <Text style={styles.buttonText}>{t("myScreen.addButton")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  button: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#4ECDC4",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});
```

## Testing RTL

1. **Switch to Arabic Language:**

   - Go to Settings
   - Select Language
   - Choose "العربية" (Arabic)
   - App will prompt to restart

2. **Verify:**

   - All text should be right-aligned
   - Icons should appear on the left side
   - Navigation flows from right to left
   - All row layouts should be reversed

3. **Switch Back to English:**
   - Same process - app will restart
   - Layout returns to LTR

## Screens Needing RTL Implementation

Check and update these screens:

- [ ] Home/Feed screens
- [ ] Bird profile pages
- [ ] Forms (add-bird, create-story, etc.)
- [ ] Navigation tabs
- [ ] Profile pages
- [ ] Donation/payment flows
- [ ] Notification screens
- [ ] Search screens

## Best Practices

1. **Always use I18nManager.isRTL** for dynamic styles
2. **Don't hardcode margins** - use padding or gap instead
3. **Test with Arabic** before considering it complete
4. **Apply to both flexDirection AND textAlign**
5. **Remember icons need to flip position** in row layouts
6. **Restart required** when switching RTL/LTR languages

## Troubleshooting

**RTL not applying:**

- Check if `I18nManager.forceRTL()` was called
- Verify app was restarted after language change
- Make sure styles use conditional `I18nManager.isRTL`

**Text not right-aligned:**

- Add `textAlign: I18nManager.isRTL ? "right" : "left"` to text styles

**Icons on wrong side:**

- Check parent container has `flexDirection: I18nManager.isRTL ? "row-reverse" : "row"`

**App crashes on language change:**

- Ensure `expo-updates` is properly installed
- Check Alert implementation in language context

## Files Modified

- `i18n/index.ts` - Added RTL initialization
- `contexts/language-context.tsx` - Added RTL state and restart mechanism
- `app/payout-settings.tsx` - Full RTL implementation
- `app/settings.tsx` - Full RTL implementation
- All locale files - Added `headers.payoutSettings` translations

## Next Steps

1. Audit all screens for RTL support
2. Add RTL to remaining screens systematically
3. Test thoroughly with Arabic language
4. Consider creating reusable RTL-aware components
