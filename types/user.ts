export type User = {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string; // Pre-signed URL from API (deprecated, use profileImageUrl)
  profileImageUrl?: string; // Pre-signed S3 URL from API
  profileImageS3Key?: string; // S3 storage key
  location?: string;
  isOwner?: boolean; // Has birds listed
};

export type UserProfile = User & {
  lovedBirds: string[]; // Bird IDs
  supportedBirds: string[]; // Bird IDs
  ownedBirds: string[]; // Bird IDs (if owner)
  storiesCount: number;
  totalSupport: number; // Total amount supported
};

export type UserCreateDto = {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  bio?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponseDto = {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  profileImageUrl?: string;
  profileImageS3Key?: string;
};

export type UpdateUserDto = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
};

export type UpdateProfileDto = {
  name?: string;
  bio?: string;
  profileImageS3Key?: string;
};

export type ProfileResponse = {
  userId: string;
  name: string;
  email: string;
  profileImageS3Key?: string;
  profileImageUrl?: string;
  bio?: string;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
};
