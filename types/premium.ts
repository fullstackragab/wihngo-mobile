export type PremiumSubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "expired";
export type PremiumPlan = "monthly" | "yearly" | "lifetime";
export type PremiumProvider = "stripe" | "apple" | "google" | "crypto";

export type BirdPremiumSubscription = {
  id: string;
  birdId: string;
  ownerId: string;

  status: PremiumSubscriptionStatus;
  plan: PremiumPlan;

  provider: PremiumProvider;
  providerSubscriptionId: string;

  startedAt: string;
  currentPeriodEnd: string;
  canceledAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type PremiumStyle = {
  frameId?: string;
  badgeId?: string;
  highlightColor?: string;
  themeId?: string;
  coverImageUrl?: string;
};

export type BestMoment = {
  id: string;
  birdId: string;
  storyId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  order: number;
};

export type MemoryCollage = {
  id: string;
  birdId: string;
  title: string;
  imageUrls: string[];
  description?: string;
  createdAt: string;
};

export type DonationTracker = {
  totalDonations: number;
  donorCount: number;
  recentDonors: {
    name: string;
    amount: number;
    message?: string;
    date: string;
  }[];
  charityAllocation?: {
    charityName: string;
    percentage: number;
    amount: number;
  }[];
};

export type SubscribeDto = {
  birdId: string;
  paymentMethodId?: string;
  provider: PremiumProvider;
  plan: PremiumPlan;
  cryptoCurrency?: string; // For crypto payments
  cryptoNetwork?: string; // For crypto payments
};

export type PremiumPlanDetails = {
  id: PremiumPlan;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year" | "lifetime";
  savings?: string;
  description?: string; // Love-focused description
  features: string[];
  charityAllocation?: number; // Percentage going to bird charities
};

export type PremiumStatusResponse = {
  isPremium: boolean;
  subscription?: BirdPremiumSubscription;
};

export type UpdatePremiumStyleDto = {
  frameId?: string;
  badgeId?: string;
  highlightColor?: string;
  themeId?: string;
  coverImageUrl?: string;
};

export type CharityImpact = {
  totalContributed: number;
  birdsHelped: number;
  sheltersSupported: number;
  conservationProjects: number;
};

export type GlobalCharityImpact = {
  totalContributed: number;
  totalSubscribers: number;
  birdsHelped: number;
  sheltersSupported: number;
  conservationProjects: number;
};

export type CharityPartner = {
  name: string;
  description: string;
  website: string;
};

export type SubscriptionResponse = {
  subscriptionId: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  message: string;
};

export type PremiumStyleResponse = {
  id: string;
  birdId: string;
  frameId?: string;
  badgeId?: string;
  highlightColor?: string;
  themeId?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};
