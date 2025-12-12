# 🐦 Wihngo - Bird Memorial & Support Platform

A React Native mobile application for celebrating, supporting, and memorializing birds. Share stories, connect with bird owners, and support bird sanctuaries.

## 📱 Features

- **Bird Profiles** - Create detailed profiles for your birds with photos, stories, and health updates
- **Community Stories** - Share and discover heartwarming bird stories
- **Support System** - Donate to bird sanctuaries and individual birds
- **Premium Subscriptions** - Enhanced features for premium members
- **Search & Discovery** - Find birds, stories, and other bird lovers
- **Authentication** - Secure user registration and login

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fullstackragab/wihngo.git
   cd wihngo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your API URL and configuration
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

> ⚠️ **Important:** Push notifications (remote notifications) require a **development build** in Expo SDK 53+. Expo Go no longer supports this feature. See [Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/) for setup instructions.

## 📁 Project Structure

```
wihngo/
├── app/                    # Expo Router pages and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── story/             # Story detail screens
│   ├── support/           # Support flow screens
│   └── *.tsx              # Root level screens (welcome, signup, etc.)
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core library code (NEW)
│   ├── api/             # API client and services
│   ├── constants/       # App configuration and constants
│   └── utils/           # Utility functions
├── screens/              # Screen components
├── services/             # Legacy API services (to be migrated)
├── types/                # TypeScript type definitions
├── assets/               # Images, fonts, and static assets
└── docs/                 # Project documentation

```

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Building for Production

For push notifications and other native features to work properly in SDK 53+, create a development or production build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login and configure
eas login
eas build:configure

# Create development build (for testing)
eas build --profile development --platform android
eas build --profile development --platform ios

# Create production build
eas build --profile production --platform all
```

See [NOTIFICATION_SETUP.md](./docs/NOTIFICATION_SETUP.md) for detailed notification configuration.

### Code Organization

#### **Services** (in `lib/api/`)

All API services are now consolidated with barrel exports:

```typescript
import { birdService, storyService } from "@/lib/api";
```

#### **Constants** (in `lib/constants/`)

Configuration, theme, and premium settings:

```typescript
import { API_CONFIG, Colors, PREMIUM_PLANS } from "@/lib/constants";
```

#### **Utils** (in `lib/utils/`)

Helper functions for formatting, validation, and storage:

```typescript
import { formatCurrency, isValidEmail, saveToStorage } from "@/lib/utils";
```

#### **Types** (in `types/`)

TypeScript definitions with barrel exports:

```typescript
import { Bird, Story, User } from "@/lib/types";
// or from types directly
import { Bird } from "@/types";
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
API_URL=http://localhost:5000/api/
APP_ENV=development
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_PREMIUM=true
```

### TypeScript

The project uses TypeScript for type safety. Key type definitions are in:

- `types/bird.ts` - Bird-related types
- `types/story.ts` - Story and comment types
- `types/user.ts` - User and authentication types
- `types/premium.ts` - Premium subscription types

## 🏗️ Architecture

### Navigation

Uses Expo Router (file-based routing):

- `app/(tabs)/` - Main tab navigation
- `app/story/[id].tsx` - Dynamic story routes
- `app/welcome.tsx` - Auth screens

### State Management

- React Context for global state (auth, theme)
- Local state with useState/useReducer
- AsyncStorage for persistence

### API Communication

- Centralized API client in `lib/api/api-client.ts`
- Service layer pattern for each domain (birds, stories, users)
- Automatic token management and error handling

### Styling

- React Native StyleSheet
- Theme system with light/dark mode
- Consistent spacing and colors from `lib/constants/theme.ts`

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [Project Summary](docs/PROJECT_SUMMARY.md) - Complete feature overview
- [API Helper Guide](docs/API_HELPER_GUIDE.md) - API integration guide
- [Auth Implementation](docs/AUTH_IMPLEMENTATION.md) - Authentication flow
- [Backend API](docs/BACKEND_API.md) - API endpoints reference
- [Premium Features](docs/PREMIUM_IMPLEMENTATION_SUMMARY.md) - Premium subscription details

## 🔧 Configuration

### App Config (`app.config.ts`)

Configure app metadata, build settings, and environment-specific values.

### Constants (`lib/constants/`)

- `config.ts` - API, features, validation rules
- `theme.ts` - Colors, fonts, spacing
- `premium.ts` - Premium plans and features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🐛 Issues & Support

For bugs and feature requests, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Migrate all services to `lib/api/`
- [ ] Add comprehensive unit tests
- [ ] Implement offline-first capabilities
- [ ] Add push notifications
- [ ] Enhance analytics and monitoring
- [ ] Implement CI/CD pipeline

## 👥 Team

Built by the Wihngo development team.

---

**Made with ❤️ for bird lovers everywhere**
