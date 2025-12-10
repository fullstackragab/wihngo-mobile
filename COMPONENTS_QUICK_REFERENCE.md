# Reusable Components Quick Reference

## Component Index

### UI Components

1. [SupportButton](#supportbutton) - Support functionality with modal
2. [ShareButton](#sharebutton) - Share content with automatic error handling
3. [LoveThisBirdButton](#lovethisbirdbutton) - Love/unlove with database sync
4. [ValidatedTextInput](#validatedtextinput) - Text input with validation
5. [ImagePickerButton](#imagepickerbutton) - Image selection with preview
6. [ListEmptyState](#listemptystate) - Empty state for lists
7. [LoadingScreen](#loadingscreen) - Loading indicator
8. [ErrorView](#errorview) - Error display with retry

### Hooks

1. [useFormValidation](#useformvalidation) - Form validation management
2. [useImagePicker](#useimagepicker) - Image selection logic
3. [useAsyncOperation](#useasyncoperation) - Async operation management

---

## SupportButton

**Location:** `components/support-button.tsx`

**Purpose:** Centralized support functionality with modal integration.

### Props

```typescript
{
  birdId?: string;
  birdName?: string;
  isPlatformSupport?: boolean;  // true for platform donations
  onSupportComplete?: () => void;
  variant?: "gradient" | "solid";
  style?: ViewStyle;
  disabled?: boolean;
  isMemorial?: boolean;
}
```

### Usage Examples

```tsx
// Bird support (gradient variant)
<SupportButton
  birdId={bird.birdId}
  birdName={bird.name}
  isMemorial={bird.isMemorial}
  variant="gradient"
/>

// Platform support
<SupportButton
  isPlatformSupport
  variant="solid"
  onSupportComplete={() => console.log("Support completed")}
/>

// Compact layout (solid variant)
<View style={{ flexDirection: "row", gap: 8 }}>
  <LoveThisBirdButton variant="pill" style={{ flex: 1 }} />
  <SupportButton variant="solid" style={{ flex: 1 }} />
</View>
```

### Features

- ✅ Automatic memorial checking (shows alert for memorial birds)
- ✅ Integrated SupportModal (handles PayPal + crypto payments)
- ✅ Two variants: gradient (full-width) and solid (compact)
- ✅ Completion callback support

---

## ShareButton

**Location:** `components/share-button.tsx`

**Purpose:** Reusable sharing with automatic error handling.

### Props

```typescript
{
  title: string;
  message: string;
  url?: string;
  onShareSuccess?: () => void;
  onShareDismissed?: () => void;
  variant?: "icon" | "button" | "text";
  style?: ViewStyle;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}
```

### Usage Examples

```tsx
// Icon variant (minimal)
<ShareButton
  variant="icon"
  title="Check out this bird"
  message="This is an amazing bird!"
  iconSize={24}
  iconColor="#000"
/>

// Button variant (prominent)
<ShareButton
  variant="button"
  title="Share Bird"
  message={`${bird.name} - ${bird.species}`}
  onShareSuccess={() => console.log("Shared!")}
/>

// Text variant (link-style)
<ShareButton
  variant="text"
  title="Share Profile"
  message="Check out my profile!"
  onShareSuccess={() => trackShareEvent()}
/>

// With URL
<ShareButton
  title="Wihngo App"
  message="Download the Wihngo app!"
  url="https://wihngo.com/download"
/>
```

### Features

- ✅ Three variants: icon, button, text
- ✅ Built-in error handling with alerts
- ✅ Success/dismiss callbacks
- ✅ Customizable icon size and color
- ✅ Optional URL sharing

---

## LoveThisBirdButton

**Location:** `components/love-this-bird-button.tsx`

**Purpose:** Love/unlove button with database sync and optimistic updates.

### Props

```typescript
{
  birdId: string;
  initialIsLoved?: boolean;
  initialLoveCount?: number;
  onLoveChange?: (isLoved: boolean, newCount: number) => void;
  variant?: "gradient" | "pill";
  style?: ViewStyle;
  disabled?: boolean;
}
```

### Usage Examples

```tsx
// Gradient variant (full-width)
<LoveThisBirdButton
  birdId={bird.birdId}
  initialIsLoved={bird.isLoved}
  initialLoveCount={bird.lovedBy}
  onLoveChange={(isLoved, count) => setLoveCount(count)}
  variant="gradient"
/>

// Pill variant (compact)
<LoveThisBirdButton
  birdId={bird.birdId}
  initialIsLoved={bird.isLoved}
  initialLoveCount={bird.lovedBy}
  variant="pill"
  style={{ flex: 1 }}
/>
```

### Features

- ✅ Optimistic UI updates (instant feedback)
- ✅ Automatic rollback on error
- ✅ Real-time love count updates
- ✅ Two variants: gradient (full) and pill (compact)
- ✅ Parent notification via callback

---

## ValidatedTextInput

**Location:** `components/ui/validated-text-input.tsx`

**Purpose:** Text input with built-in validation and error display.

### Props

```typescript
{
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  // ...all standard TextInput props
}
```

### Usage Examples

```tsx
const { getFieldError, setFieldTouched, isFieldTouched } = useFormValidation({
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
});

<ValidatedTextInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  onBlur={() => setFieldTouched("email")}
  error={getFieldError("email")}
  touched={isFieldTouched("email")}
  required
  placeholder="your@email.com"
  keyboardType="email-address"
  autoCapitalize="none"
/>

// Multiline input
<ValidatedTextInput
  label="Description"
  value={description}
  onChangeText={setDescription}
  placeholder="Tell us more..."
  multiline
  numberOfLines={6}
  style={{ height: 120 }}
/>
```

### Features

- ✅ Automatic error display when touched
- ✅ Required field indicator (\*)
- ✅ Error styling (red border, red text)
- ✅ Full TextInput compatibility

---

## ImagePickerButton

**Location:** `components/ui/image-picker-button.tsx`

**Purpose:** Complete image selection UI with preview.

### Props

```typescript
{
  onImageSelected: (uri: string) => void;
  initialUri?: string;
  label?: string;
  placeholder?: string;
  maxSizeMB?: number;
  style?: ViewStyle;
  aspectRatio?: [number, number];
  showPreview?: boolean;
}
```

### Usage Examples

```tsx
// Profile image (square)
<ImagePickerButton
  label="Profile Image"
  placeholder="Tap to select a profile image"
  initialUri={profileImageUrl}
  onImageSelected={setProfileImageUrl}
  maxSizeMB={5}
/>

// Cover image (16:9)
<ImagePickerButton
  label="Cover Image"
  placeholder="Tap to select a cover image"
  initialUri={coverImageUrl}
  onImageSelected={setCoverImageUrl}
  maxSizeMB={5}
  aspectRatio={[16, 9]}
/>

// Without preview
<ImagePickerButton
  label="Select Image"
  onImageSelected={handleImage}
  showPreview={false}
/>
```

### Features

- ✅ Integrated image preview
- ✅ Camera + library selection
- ✅ Loading indicator
- ✅ Remove image option
- ✅ Size validation
- ✅ Customizable aspect ratio

**Note:** Requires `expo-image-picker` package. See hook documentation for installation.

---

## ListEmptyState

**Location:** `components/ui/list-empty-state.tsx`

**Purpose:** Standardized empty state for lists.

### Props

```typescript
{
  icon?: keyof typeof Feather.glyphMap;  // default: "inbox"
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

### Usage Examples

```tsx
// FlatList empty component
<FlatList
  data={birds}
  ListEmptyComponent={
    <ListEmptyState
      icon="dove"
      title="No birds found"
      message="Start adding birds to your collection"
      actionLabel="Add Bird"
      onAction={() => router.push("/add-bird")}
    />
  }
/>

// Search results empty state
<ListEmptyState
  icon="search"
  title="No results found"
  message="Try adjusting your search terms"
  actionLabel="Clear Search"
  onAction={clearSearch}
/>

// Without action button
<ListEmptyState
  icon="info"
  title="Coming Soon"
  message="This feature is under development"
/>
```

### Features

- ✅ Icon from Feather icon set
- ✅ Optional action button
- ✅ Consistent styling
- ✅ Flexible messaging

---

## LoadingScreen

**Location:** `components/ui/loading-screen.tsx`

**Purpose:** Standardized loading indicator.

### Props

```typescript
{
  message?: string;
  color?: string;
  size?: "small" | "large";
}
```

### Usage Examples

```tsx
// Default
if (loading) {
  return <LoadingScreen />;
}

// Custom message
<LoadingScreen message="Loading birds..." />

// Custom color and size
<LoadingScreen
  message="Processing payment..."
  color="#10b981"
  size="large"
/>
```

---

## ErrorView

**Location:** `components/ui/error-view.tsx`

**Purpose:** Error display with retry functionality.

### Props

```typescript
{
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
}
```

### Usage Examples

```tsx
// With retry
if (error) {
  return (
    <ErrorView
      message="Failed to load bird details"
      onRetry={loadBirdDetails}
      retryButtonText="Try Again"
    />
  );
}

// Without retry
<ErrorView message="This feature is not available" />;
```

---

## useFormValidation

**Location:** `hooks/useFormValidation.ts`

**Purpose:** Comprehensive form validation with error management.

### API

```typescript
const {
  errors, // All validation errors
  touched, // Touched fields tracking
  validateField, // Validate single field
  validateForm, // Validate entire form
  setFieldError, // Set custom error
  clearFieldError, // Clear field error
  clearAllErrors, // Clear all errors
  setFieldTouched, // Mark field as touched
  isFieldTouched, // Check if field touched
  getFieldError, // Get field error message
  hasErrors, // Check if any errors exist
} = useFormValidation(rules);
```

### Validation Rules

```typescript
{
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}
```

### Common Validation Patterns

```typescript
import { commonValidations } from "@/hooks/useFormValidation";

const rules = {
  email: {
    required: true,
    ...commonValidations.email,
  },
  phone: {
    ...commonValidations.phone,
  },
  website: {
    ...commonValidations.url,
  },
};
```

### Full Example

```tsx
import { useFormValidation } from "@/hooks/useFormValidation";
import ValidatedTextInput from "@/components/ui/validated-text-input";

function MyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const { validateForm, getFieldError, setFieldTouched, isFieldTouched } =
    useFormValidation({
      name: {
        required: true,
        minLength: 2,
        message: "Name must be at least 2 characters",
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Valid email is required",
      },
      website: {
        pattern: /^https?:\/\/.+/,
        message: "Must be a valid URL starting with http:// or https://",
      },
    });

  const handleSubmit = () => {
    const isValid = validateForm({ name, email, website });

    if (!isValid) {
      Alert.alert("Validation Error", "Please fix form errors");
      return;
    }

    // Submit form...
  };

  return (
    <View>
      <ValidatedTextInput
        label="Name"
        value={name}
        onChangeText={setName}
        onBlur={() => setFieldTouched("name")}
        error={getFieldError("name")}
        touched={isFieldTouched("name")}
        required
      />

      <ValidatedTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setFieldTouched("email")}
        error={getFieldError("email")}
        touched={isFieldTouched("email")}
        required
        keyboardType="email-address"
      />

      <ValidatedTextInput
        label="Website"
        value={website}
        onChangeText={setWebsite}
        onBlur={() => setFieldTouched("website")}
        error={getFieldError("website")}
        touched={isFieldTouched("website")}
      />

      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## useImagePicker

**Location:** `hooks/useImagePicker.ts`

**Purpose:** Image selection logic with validation.

**⚠️ Note:** Requires `expo-image-picker` package to be installed.

### Installation

```bash
npx expo install expo-image-picker
```

### API

```typescript
const {
  uri, // Selected image URI
  loading, // Loading state
  error, // Error message
  pickImage, // Open image library
  takePhoto, // Open camera
  clearImage, // Clear selection
} = useImagePicker(options, onImageSelected);
```

### Options

```typescript
{
  maxSizeMB?: number;              // Max file size (default: 5MB)
  allowedTypes?: string[];         // Allowed MIME types
  quality?: number;                // Compression quality (0-1)
  aspect?: [number, number];       // Aspect ratio
  allowsEditing?: boolean;         // Enable cropping
}
```

### Usage Example

```tsx
import { useImagePicker } from "@/hooks/useImagePicker";

function MyComponent() {
  const { uri, loading, pickImage, takePhoto, clearImage } = useImagePicker(
    {
      maxSizeMB: 5,
      aspect: [1, 1],
      allowsEditing: true,
      quality: 0.8,
    },
    (uri) => {
      console.log("Image selected:", uri);
      setImageUrl(uri);
    }
  );

  return (
    <View>
      {loading && <ActivityIndicator />}
      {uri && <Image source={{ uri }} style={{ width: 200, height: 200 }} />}

      <Button title="Pick Image" onPress={pickImage} />
      <Button title="Take Photo" onPress={takePhoto} />
      {uri && <Button title="Clear" onPress={clearImage} />}
    </View>
  );
}
```

---

## useAsyncOperation

**Location:** `hooks/useAsyncOperation.ts`

**Purpose:** Generic async operation management.

### API

```typescript
const { loading, error, data, execute, reset } = useAsyncOperation<T>(
  asyncFunction,
  { onSuccess, onError }
);
```

### Usage Example

```tsx
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

function MyComponent() {
  const { loading, error, data, execute } = useAsyncOperation(
    async (id: string) => {
      const response = await fetch(`/api/birds/${id}`);
      return response.json();
    },
    {
      onSuccess: (data) => console.log("Success:", data),
      onError: (error) => Alert.alert("Error", error.message),
    }
  );

  return (
    <View>
      {loading && <LoadingScreen />}
      {error && (
        <ErrorView message={error.message} onRetry={() => execute("123")} />
      )}
      {data && <Text>{data.name}</Text>}

      <Button title="Load" onPress={() => execute("123")} />
    </View>
  );
}
```

---

## Best Practices

### 1. **Always Use Type-Safe Props**

```tsx
// ✅ Good
<SupportButton birdId={bird.birdId} birdName={bird.name} />

// ❌ Bad
<SupportButton birdId="123" />  // Missing context
```

### 2. **Handle Callbacks**

```tsx
// ✅ Good
<LoveThisBirdButton
  onLoveChange={(isLoved, count) => {
    setLoveCount(count);
    trackLoveEvent(isLoved);
  }}
/>

// ⚠️ OK but limited
<LoveThisBirdButton />  // Works but parent won't know about changes
```

### 3. **Combine Components**

```tsx
// ✅ Good - Reuse multiple components together
<View style={{ flexDirection: "row", gap: 8 }}>
  <LoveThisBirdButton variant="pill" style={{ flex: 1 }} />
  <SupportButton variant="solid" style={{ flex: 1 }} />
</View>
```

### 4. **Use Loading/Error States**

```tsx
// ✅ Good - Complete UX
if (loading) return <LoadingScreen message="Loading birds..." />;
if (error) return <ErrorView message={error} onRetry={loadBirds} />;
return <BirdList birds={birds} />;

// ❌ Bad - Poor UX
if (loading) return null;
return <BirdList birds={birds} />;
```

### 5. **Validate Forms Properly**

```tsx
// ✅ Good - Use validation hook
const { validateForm, getFieldError, setFieldTouched } =
  useFormValidation(rules);

// ❌ Bad - Manual validation scattered everywhere
if (!name.trim()) {
  Alert.alert("Error", "Name is required");
  return;
}
if (name.length < 2) {
  Alert.alert("Error", "Name too short");
  return;
}
```

---

## Migration Checklist

When refactoring existing code to use these components:

- [ ] Replace manual support buttons with `<SupportButton>`
- [ ] Replace Share.share() calls with `<ShareButton>`
- [ ] Replace love/unlove logic with `<LoveThisBirdButton>`
- [ ] Replace loading states with `<LoadingScreen>`
- [ ] Replace error views with `<ErrorView>`
- [ ] Replace empty states with `<ListEmptyState>`
- [ ] Replace form validation with `useFormValidation`
- [ ] Replace text inputs with `<ValidatedTextInput>`
- [ ] Replace image pickers with `<ImagePickerButton>`
- [ ] Update imports and remove old code
- [ ] Test all functionality
- [ ] Update documentation

---

## Component Dependencies

```
SupportButton
├── SupportModal (existing)
├── LinearGradient
└── FontAwesome6 / MaterialCommunityIcons

ShareButton
└── Feather

LoveThisBirdButton
├── birdService (existing)
├── LinearGradient
└── Ionicons / Feather

ValidatedTextInput
└── TextInput (React Native)

ImagePickerButton
├── useImagePicker
├── Image (React Native)
└── Feather

useImagePicker
└── expo-image-picker (⚠️ requires installation)

useFormValidation
└── useState, useCallback (React)
```

---

## Support

For questions or issues:

1. Check this guide
2. Review component source code
3. Check REFACTORING_SUMMARY.md
4. Review usage in refactored files

**Refactored Files for Reference:**

- `app/(tabs)/birds/[id].tsx`
- `screens/bird-profile.tsx`
- `screens/bird-list.tsx`
- `app/add-bird.tsx`
