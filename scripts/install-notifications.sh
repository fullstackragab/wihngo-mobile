#!/bin/bash

# Wihngo Notification System - Installation Script
# This script installs all required dependencies for the notification system

echo "📦 Installing Expo Notifications Dependencies..."
echo ""

# Install expo-notifications and expo-device
npx expo install expo-notifications expo-device

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update EXPO_PROJECT_ID in services/push-notification.service.ts"
echo "2. Configure app.json with notification settings (see docs/NOTIFICATION_SETUP.md)"
echo "3. Test push permissions and notifications"
echo ""
echo "📚 See docs/NOTIFICATION_SETUP.md for full setup instructions"
