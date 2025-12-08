# 📊 Project Structure Guide

Visual guide to the refactored Wihngo project structure.

## Directory Tree

```
wihngo/
│
├── 📱 app/                         # Expo Router - App screens
│   ├── (tabs)/                    # Tab-based navigation
│   │   ├── _layout.tsx           # Tab layout config
│   │   ├── home.tsx              # Home screen
│   │   ├── profile.tsx           # Profile screen
│   │   ├── stories.tsx           # Stories feed
│   │   └── birds/                # Bird screens
│   │       ├── _layout.tsx
│   │       ├── index.tsx         # Bird list
│   │       └── [id].tsx          # Bird detail
│   ├── story/[id].tsx            # Story detail (dynamic)
│   ├── support/[id].tsx          # Support flow (dynamic)
│   ├── welcome.tsx               # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── add-bird.tsx              # Add bird form
│   ├── create-story.tsx          # Create story
│   └── _layout.tsx               # Root layout
│
├── 🧩 components/                 # Reusable UI components
│   ├── bird-card.tsx
│   ├── bird-thumb.tsx
│   ├── story-highlights.tsx
│   ├── premium-badge.tsx
│   ├── premium-upgrade-card.tsx
│   ├── donation-tracker.tsx
│   ├── memory-collage.tsx
│   └── ui/                       # Base UI components
│       ├── animated-card.tsx
│       ├── rounded-text-input.tsx
│       └── icon-symbol.tsx
│
├── 📚 lib/                        # NEW! Core library
│   ├── api/                      # API layer
│   │   ├── api-client.ts        # HTTP methods (GET, POST, PUT, DELETE)
│   │   └── index.ts             # Barrel export for services
│   ├── constants/               # Configuration
│   │   ├── config.ts           # API, features, validation
│   │   ├── theme.ts            # Colors, fonts, spacing
│   │   ├── premium.ts          # Premium plans
│   │   └── index.ts            # Barrel export
│   └── utils/                  # Utilities
│       ├── format.ts          # Formatting functions
│       ├── validation.ts      # Validation functions
│       ├── storage.ts         # Storage helpers
│       └── index.ts           # Barrel export
│
├── 🗂️ types/                     # TypeScript definitions
│   ├── bird.ts                  # Bird types
│   ├── story.ts                 # Story types
│   ├── user.ts                  # User types
│   ├── premium.ts               # Premium types
│   ├── support.ts               # Support types
│   ├── notification.ts          # Notification types
│   └── index.ts                 # Barrel export
│
├── 🌐 contexts/                  # React Context providers
│   └── auth-context.tsx         # Authentication context
│
├── 🪝 hooks/                     # Custom React hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
│
├── 📺 screens/                   # Legacy screen components
│   ├── bird-list.tsx
│   ├── bird-profile.tsx
│   ├── community.tsx
│   └── user-profile.tsx
│
├── 🔌 services/                  # Legacy API services
│   ├── api-helper.ts            # → Migrating to lib/api/
│   ├── auth.service.ts
│   ├── bird.service.ts
│   ├── story.service.ts
│   ├── user.service.ts
│   ├── premium.service.ts
│   ├── search.service.ts
│   ├── support.service.ts
│   └── config.ts                # → Migrated to lib/constants/
│
├── 🖼️ assets/                    # Static assets
│   └── images/
│
├── 📖 docs/                      # Documentation
│   ├── README.md                # Documentation index
│   ├── DEVELOPMENT_GUIDE.md     # Dev workflow
│   ├── MIGRATION_GUIDE.md       # Migration help
│   ├── PROJECT_SUMMARY.md       # Feature overview
│   ├── IMPLEMENTATION.md        # Implementation details
│   ├── API_HELPER_GUIDE.md
│   ├── AUTH_IMPLEMENTATION.md
│   ├── BACKEND_API.md
│   └── PREMIUM_*.md             # Premium docs
│
├── ⚙️ Configuration Files
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── app.config.ts            # Expo config
│   ├── tsconfig.json            # TypeScript config
│   ├── package.json             # Dependencies
│   └── .gitignore
│
└── 📄 Root Files
    ├── README.md                # Main project README
    └── REFACTORING_SUMMARY.md   # This refactoring summary
```

## Import Patterns

### ✅ New Pattern (Recommended)

```typescript
// Types - Use barrel export
import { Bird, Story, User } from "@/types";

// Constants - Use barrel export
import { Colors, API_CONFIG, PREMIUM_PLANS } from "@/lib/constants";

// Utils - Use barrel export
import { formatCurrency, isValidEmail, saveToStorage } from "@/lib/utils";

// Services - Use barrel export (coming soon)
import { birdService, storyService } from "@/lib/api";

// Components
import BirdCard from "@/components/bird-card";
import { RoundedTextInput } from "@/components/ui/rounded-text-input";
```

### ⚠️ Old Pattern (Still works, but migrate when possible)

```typescript
import { Bird } from "@/types/bird";
import { Story } from "@/types/story";
import { Colors } from "@/constants/theme";
import { API_URL } from "@/services/config";
import { authenticatedGet } from "@/services/api-helper";
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      App Screens                         │
│                     (app/*.tsx)                          │
└────────────────┬────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                     Components                           │
│                  (components/*.tsx)                      │
└────────────────┬────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Core Library (lib/)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   API    │  │ Constants│  │  Utils   │              │
│  │ Services │  │  Config  │  │ Helpers  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────┬────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────┐
│                 Types & Interfaces                       │
│                    (types/*.ts)                          │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Interaction
      ↓
App Screen (app/)
      ↓
Component (components/)
      ↓
Service Call (lib/api/)
      ↓
API Client (lib/api/api-client.ts)
      ↓
HTTP Request → Backend API
      ↓
Response
      ↓
Type Validation (types/)
      ↓
Format/Transform (lib/utils/)
      ↓
Update State
      ↓
Re-render UI
```

## Feature Organization

### Authentication Flow

```
app/welcome.tsx (Login)
    → contexts/auth-context.tsx
    → services/auth.service.ts
    → lib/api/api-client.ts
    → lib/utils/storage.ts (Token)
```

### Bird Management

```
app/(tabs)/birds/
    → components/bird-card.tsx
    → services/bird.service.ts
    → types/bird.ts
    → lib/constants/config.ts
```

### Stories

```
app/(tabs)/stories.tsx
app/story/[id].tsx
app/create-story.tsx
    → components/story-*.tsx
    → services/story.service.ts
    → types/story.ts
```

### Premium Features

```
components/premium-*.tsx
    → services/premium.service.ts
    → lib/constants/premium.ts
    → types/premium.ts
```

## Quick Reference

### Adding New Features

1. **Create Types** → `types/feature.ts`
2. **Add Service** → `services/feature.service.ts`
3. **Create Components** → `components/feature-*.tsx`
4. **Add Screen** → `app/feature.tsx`
5. **Update Config** → `lib/constants/config.ts` (if needed)

### Finding Code

| What          | Where                                 |
| ------------- | ------------------------------------- |
| API calls     | `services/*.service.ts` or `lib/api/` |
| Types         | `types/*.ts`                          |
| Configuration | `lib/constants/*.ts`                  |
| Utilities     | `lib/utils/*.ts`                      |
| UI Components | `components/*.tsx`                    |
| Screens       | `app/*.tsx`                           |
| Context/State | `contexts/*.tsx`                      |
| Custom Hooks  | `hooks/*.ts`                          |

---

**Legend:**

- 📱 = App screens
- 🧩 = Components
- 📚 = Core library
- 🗂️ = Types
- 🌐 = Context
- 🪝 = Hooks
- 📺 = Screens
- 🔌 = Services
- 🖼️ = Assets
- 📖 = Documentation
- ⚙️ = Configuration
