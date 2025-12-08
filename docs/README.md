# 📚 Wihngo Documentation

Welcome to the Wihngo project documentation. This directory contains comprehensive guides and references for development.

## Quick Links

### Getting Started

- **[Main README](../README.md)** - Project overview and quick start
- **[Quick Reference](QUICK_REFERENCE.md)** - ⚡ Daily development cheatsheet
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Complete development workflow
- **[Migration Guide](MIGRATION_GUIDE.md)** - Migrate to new structure
- **[Project Structure](PROJECT_STRUCTURE.md)** - Visual structure guide

### Feature Documentation

- **[Project Summary](PROJECT_SUMMARY.md)** - Complete feature overview
- **[Implementation Guide](IMPLEMENTATION.md)** - Feature implementation details
- **[Premium Features](PREMIUM_IMPLEMENTATION_SUMMARY.md)** - Premium subscription system

### Technical Guides

- **[API Helper Guide](API_HELPER_GUIDE.md)** - API integration patterns
- **[Auth Implementation](AUTH_IMPLEMENTATION.md)** - Authentication system
- **[Backend API](BACKEND_API.md)** - API endpoints reference

### Premium System

- **[Premium Quickstart](PREMIUM_QUICKSTART.md)** - Quick setup guide
- **[Premium Quick Reference](PREMIUM_QUICK_REFERENCE.md)** - Feature reference
- **[Premium Backend](PREMIUM_BACKEND_GUIDE.md)** - Backend integration
- **[Premium Frontend](PREMIUM_FRONTEND_GUIDE.md)** - UI components
- **[Premium Love First](PREMIUM_LOVE_FIRST_GUIDE.md)** - Love feature guide
- **[Premium V2 Summary](PREMIUM_V2_SUMMARY.md)** - Version 2 updates

## Documentation Structure

```
docs/
├── README.md                          # This file
├── DEVELOPMENT_GUIDE.md              # Development workflow
├── MIGRATION_GUIDE.md                # Migration to new structure
├── PROJECT_SUMMARY.md                # Feature overview
├── IMPLEMENTATION.md                 # Implementation details
├── API_HELPER_GUIDE.md              # API patterns
├── AUTH_IMPLEMENTATION.md            # Auth system
├── BACKEND_API.md                    # API reference
└── PREMIUM_*.md                      # Premium features
```

## For Developers

### New to the Project?

1. Read the [main README](../README.md)
2. Follow the [Development Guide](DEVELOPMENT_GUIDE.md)
3. Review the [Project Summary](PROJECT_SUMMARY.md)

### Working with the Refactored Code?

1. Check the [Migration Guide](MIGRATION_GUIDE.md)
2. Use the new imports from `lib/`
3. Follow best practices in [Development Guide](DEVELOPMENT_GUIDE.md)

### Implementing Features?

1. Review [Implementation Guide](IMPLEMENTATION.md)
2. Check [API Helper Guide](API_HELPER_GUIDE.md) for API patterns
3. Refer to type definitions in `types/`

### Working on Premium Features?

1. Start with [Premium Quickstart](PREMIUM_QUICKSTART.md)
2. Use [Premium Quick Reference](PREMIUM_QUICK_REFERENCE.md)
3. Follow [Premium Implementation](PREMIUM_IMPLEMENTATION_SUMMARY.md)

## Project Organization

### New Structure (After Refactor)

The project has been reorganized for better maintainability:

- **`lib/`** - Core functionality

  - `api/` - API client and services
  - `constants/` - Configuration
  - `utils/` - Helper functions

- **Barrel Exports** - Cleaner imports

  ```typescript
  import { Bird, Story } from "@/types";
  import { Colors, API_CONFIG } from "@/lib/constants";
  import { formatCurrency } from "@/lib/utils";
  ```

- **Centralized Config** - All settings in one place
  - `lib/constants/config.ts`
  - `lib/constants/theme.ts`
  - `lib/constants/premium.ts`

## Key Concepts

### File-Based Routing

Expo Router uses the file system for navigation:

- `app/(tabs)/home.tsx` → `/home`
- `app/story/[id].tsx` → `/story/123`

### Type Safety

TypeScript is used throughout:

- Define types in `types/`
- Use interfaces for props
- Leverage type inference

### API Services

Organized service layer:

- One service per domain (birds, stories, users)
- Centralized API client
- Automatic authentication

### Component Structure

- Functional components with hooks
- StyleSheet for styling
- Props typed with interfaces

## Contributing

When adding new documentation:

1. **Choose the right file**

   - Feature docs → Use existing or create new
   - API docs → Update `BACKEND_API.md`
   - Dev workflows → Update `DEVELOPMENT_GUIDE.md`

2. **Follow the format**

   - Use clear headings
   - Include code examples
   - Add table of contents for long docs

3. **Update this index**
   - Add link in appropriate section
   - Keep structure organized

## Getting Help

- **Documentation Issues**: Open an issue
- **Development Questions**: Check guides first
- **Feature Questions**: See implementation docs

## Version History

- **v1.0** - Initial documentation
- **v2.0** - Refactored structure (Current)
  - Added `lib/` organization
  - New migration guide
  - Updated development guide

---

**Last Updated**: December 2025
