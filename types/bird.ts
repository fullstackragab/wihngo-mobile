export type PremiumStyle = {
  frameId?: string;
  badgeId?: string;
  highlightColor?: string;
};

// Bird activity status based on last activity timestamp
export type BirdActivityStatus = 'Active' | 'Quiet' | 'Inactive' | 'Memorial';

export type Bird = {
  birdId: string;
  name: string;
  species: string;
  commonName?: string;
  scientificName?: string;
  tagline: string;
  description?: string;
  imageUrl?: string; // Pre-signed URL from API
  imageS3Key?: string; // S3 storage key
  coverImageUrl?: string; // Pre-signed URL from API
  coverImageS3Key?: string; // S3 storage key
  videoUrl?: string; // Pre-signed URL from API (required)
  videoS3Key?: string; // S3 storage key (required)
  lovedBy: number;
  supportedBy: number;
  ownerId: string;
  ownerName?: string;
  age?: string;
  location?: string;
  isLoved?: boolean;
  isSupported?: boolean;
  totalSupport?: number;
  isMemorial?: boolean; // For deceased birds
  isPremium?: boolean;
  premiumStyle?: PremiumStyle;
  // Activity status fields
  activityStatus?: BirdActivityStatus;
  lastSeenText?: string;
  canSupport?: boolean;
  supportUnavailableMessage?: string;
};

export type BirdSupport = {
  supportId: string;
  birdId: string;
  userId: string;
  amount: number;
  message?: string;
  createdAt: string;
};

export type BirdHealthLog = {
  logId: string;
  birdId: string;
  logType: "vet" | "food" | "medicine" | "other";
  title: string;
  description: string;
  cost?: number;
  imageUrl?: string; // Pre-signed URL from API
  imageS3Key?: string; // S3 storage key
  createdAt: string;
};

export type CreateBirdDto = {
  name: string;
  species: string;
  commonName?: string;
  scientificName?: string;
  description?: string;
  imageS3Key?: string;
  coverImageS3Key?: string;
  videoS3Key?: string;
  age?: string;
  location?: string;
};

export type UpdateBirdDto = Partial<CreateBirdDto>;

export type SupportBirdDto = {
  birdId: string;
  amount: number;
  message?: string;
};
