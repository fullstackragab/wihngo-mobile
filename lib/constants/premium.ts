import { PremiumPlanDetails } from "@/types/premium";

/**
 * Premium subscription configuration
 */

export const PREMIUM_PLANS: PremiumPlanDetails[] = [
  {
    id: "monthly",
    name: "Monthly Celebration",
    price: 4.99,
    currency: "USD",
    interval: "month",
    features: [
      "Custom profile theme & cover",
      "Highlighted Best Moments",
      "'Celebrated Bird' badge",
      "Unlimited photos & videos",
      "Memory collages & story albums",
      "QR code for profile sharing",
      "Pin up to 5 story highlights",
      "Donation tracker display",
    ],
    charityAllocation: 10, // 10% to bird charities
  },
  {
    id: "yearly",
    name: "Yearly Celebration",
    price: 49.99,
    currency: "USD",
    interval: "year",
    savings: "Save 2 months!",
    features: [
      "All Monthly features",
      "Custom profile theme & cover",
      "Highlighted Best Moments",
      "'Celebrated Bird' badge",
      "Unlimited photos & videos",
      "Memory collages & story albums",
      "QR code for profile sharing",
      "Pin up to 5 story highlights",
      "Donation tracker display",
      "Priority support",
    ],
    charityAllocation: 15, // 15% to bird charities
  },
  {
    id: "lifetime",
    name: "Lifetime Celebration",
    price: 69.99,
    currency: "USD",
    interval: "lifetime",
    savings: "One-time payment, forever!",
    features: [
      "All Yearly features",
      "Custom profile theme & cover",
      "Highlighted Best Moments",
      "'Celebrated Bird' badge",
      "Unlimited photos & videos",
      "Memory collages & story albums",
      "QR code for profile sharing",
      "Pin up to 5 story highlights",
      "Donation tracker display",
      "Priority support",
      "Exclusive memorial templates",
      "Advanced analytics",
    ],
    charityAllocation: 20, // 20% to bird charities
  },
];

export const PREMIUM_FEATURES = {
  customTheme: {
    id: "custom_theme",
    name: "Custom Profile Theme",
    description:
      "Personalize your bird profile with custom colors and cover images",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  bestMoments: {
    id: "best_moments",
    name: "Highlighted Best Moments",
    description: "Create a beautiful timeline of your bird's best moments",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  badge: {
    id: "celebrated_badge",
    name: "Celebrated Bird Badge",
    description: "Show premium status with a special badge",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  unlimitedMedia: {
    id: "unlimited_media",
    name: "Unlimited Photos & Videos",
    description: "No limits on uploads",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  memoryCollages: {
    id: "memory_collages",
    name: "Memory Collages",
    description: "Auto-generate beautiful photo collages",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  qrCode: {
    id: "qr_code",
    name: "QR Code Sharing",
    description: "Share your bird profile with a QR code",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  storyHighlights: {
    id: "story_highlights",
    name: "Story Highlights",
    description: "Pin important stories to your profile",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  donationTracker: {
    id: "donation_tracker",
    name: "Donation Tracker",
    description: "Display total donations received",
    availableIn: ["monthly", "yearly", "lifetime"],
  },
  memorialTemplates: {
    id: "memorial_templates",
    name: "Memorial Templates",
    description: "Exclusive templates for memorial birds",
    availableIn: ["lifetime"],
  },
  analytics: {
    id: "analytics",
    name: "Advanced Analytics",
    description: "Detailed insights about your bird profile",
    availableIn: ["lifetime"],
  },
} as const;

export const CHARITY_INFO = {
  name: "Bird Conservation Partners",
  description: "Supporting bird sanctuaries and conservation efforts worldwide",
  website: "https://birdconservation.org",
} as const;
