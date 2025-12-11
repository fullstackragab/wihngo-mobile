import { PremiumPlanDetails } from "@/types/premium";

export const PREMIUM_PLANS: PremiumPlanDetails[] = [
  {
    id: "monthly",
    name: "Monthly Celebration",
    price: 3.99,
    currency: "USD",
    interval: "month",
    description: "Show your love & support your bird monthly",
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
    charityAllocation: 10, // 10% to bird charities/shelters
  },
  {
    id: "yearly",
    name: "Yearly Celebration",
    price: 39.99,
    currency: "USD",
    interval: "year",
    savings: "Save $8/year - 2 months free!",
    description: "A year of love & celebration for your bird",
    features: [
      "All Monthly features included",
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
    charityAllocation: 15, // 15% to bird charities/shelters
  },
  {
    id: "lifetime",
    name: "Lifetime Celebration",
    price: 69.99,
    currency: "USD",
    interval: "lifetime",
    savings: "One-time payment, celebrate forever!",
    description: "Eternal love & premium features for your bird",
    features: [
      "All premium features forever",
      "Custom profile theme & cover",
      "Highlighted Best Moments",
      "'Celebrated Bird' badge",
      "Unlimited photos & videos",
      "Memory collages & story albums",
      "QR code for profile sharing",
      "Pin up to 5 story highlights",
      "Donation tracker display",
      "Exclusive lifetime badge",
      "Support bird charities",
      "VIP support access",
    ],
    charityAllocation: 20, // 20% to bird charities/conservation
  },
];

export const PREMIUM_FEATURES = {
  FREE: {
    maxPhotos: 5,
    maxVideos: 5,
    storyHighlights: 0,
    bestMoments: 0,
    memoryCollages: 0,
    customTheme: false,
    premiumBadge: false,
    qrCode: false,
    donationTracker: false,
  },
  PREMIUM: {
    maxPhotos: -1, // Unlimited
    maxVideos: -1, // Unlimited
    storyHighlights: 5,
    bestMoments: 10,
    memoryCollages: 10,
    customTheme: true,
    premiumBadge: true,
    qrCode: true,
    donationTracker: true,
  },
};

export const CUSTOM_THEMES = [
  {
    id: "default",
    name: "Classic",
    primaryColor: "#0a7ea4",
    secondaryColor: "#FFD700",
    gradientColors: ["#fbc2eb", "#a6c1ee"],
    borderColor: "#E8E8E8",
    free: true,
  },
  {
    id: "nature",
    name: "Nature's Love",
    primaryColor: "#228B22",
    secondaryColor: "#90EE90",
    gradientColors: ["#a8e6cf", "#dcedc1"],
    borderColor: "#90EE90",
    free: false,
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    primaryColor: "#006994",
    secondaryColor: "#4DD0E1",
    gradientColors: ["#4facfe", "#00f2fe"],
    borderColor: "#4DD0E1",
    free: false,
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    primaryColor: "#FF6B35",
    secondaryColor: "#FFD93D",
    gradientColors: ["#ff6b6b", "#feca57"],
    borderColor: "#FFD93D",
    free: false,
  },
  {
    id: "lavender",
    name: "Lavender Dreams",
    primaryColor: "#9B59B6",
    secondaryColor: "#E8DAEF",
    gradientColors: ["#c471ed", "#f7b3ff"],
    borderColor: "#E8DAEF",
    free: false,
  },
  {
    id: "golden",
    name: "Golden Celebration",
    primaryColor: "#DAA520",
    secondaryColor: "#FFD700",
    gradientColors: ["#f9d423", "#ff4e50"],
    borderColor: "#FFD700",
    free: false,
  },
];

export const CELEBRATION_BADGES = [
  {
    id: "celebrated",
    name: "Celebrated Bird",
    icon: "star",
    color: "#FFD700",
    description: "A bird loved by the community",
  },
  {
    id: "lifetime",
    name: "Lifetime Member",
    icon: "infinite",
    color: "#9B59B6",
    description: "Forever celebrated",
  },
  {
    id: "charity",
    name: "Charity Supporter",
    icon: "heart",
    color: "#FF6B6B",
    description: "Supporting bird charities",
  },
];
