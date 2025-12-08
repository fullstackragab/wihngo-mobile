export type User = {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
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
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponseDto = {
  token: string;
  userId: string;
  name: string;
  email: string;
};

export type UpdateUserDto = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
};
