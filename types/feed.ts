/**
 * Feed types for the smart feed ranking system
 *
 * These types match the backend DTOs:
 * - RankedStoryDto
 * - FeedSectionDto
 * - UserPreferencesDto
 * - FeedRequestDto
 */

import { Story, StoryMode } from './story';

/**
 * Ranked story with personalization metadata
 * Extends Story with relevance scoring and matching info
 */
export type RankedStory = Story & {
  /** Relevance score calculated by the ranking algorithm (0-100+) */
  relevanceScore?: number;
  /** ISO 639-1 language code of the story content */
  language?: string;
  /** ISO 3166-1 alpha-2 country code */
  country?: string;
  /** Why this story was recommended */
  matchReason?: FeedMatchReason;
  /** UTC timestamp when the story was created */
  createdAt?: string;
};

/**
 * Match reason for feed ranking
 */
export type FeedMatchReason =
  | 'in_your_language'
  | 'from_your_area'
  | 'followed_birds'
  | 'trending'
  | 'discover_worldwide'
  | null;

/**
 * Feed section types
 */
export type FeedSectionType =
  | 'from_your_area'
  | 'in_your_language'
  | 'discover_worldwide'
  | 'followed_birds';

/**
 * Feed section with stories
 */
export type FeedSection = {
  /** Section type identifier */
  sectionType: FeedSectionType;
  /** Localized title for display */
  title: string;
  /** Stories in this section */
  stories: RankedStory[];
  /** Whether there are more stories to load */
  hasMore: boolean;
};

/**
 * User content preferences
 */
export type UserPreferences = {
  /** List of preferred content language codes (ISO 639-1) */
  preferredLanguages: string[];
  /** User's country code (ISO 3166-1 alpha-2) */
  country?: string;
};

/**
 * Request parameters for feed API
 */
export type FeedRequest = {
  page?: number;
  pageSize?: number;
  language?: string;
  country?: string;
  mode?: StoryMode;
};

/**
 * Paginated feed response
 */
export type FeedResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  items: RankedStory[];
};

/**
 * Available languages for content preferences
 * ISO 639-1 codes matching the app's 16 supported languages
 */
export const SUPPORTED_CONTENT_LANGUAGES = [
  { code: 'ar', name: 'العربية', englishName: 'Arabic' },
  { code: 'de', name: 'Deutsch', englishName: 'German' },
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'es', name: 'Español', englishName: 'Spanish' },
  { code: 'fr', name: 'Français', englishName: 'French' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'it', name: 'Italiano', englishName: 'Italian' },
  { code: 'ja', name: '日本語', englishName: 'Japanese' },
  { code: 'ko', name: '한국어', englishName: 'Korean' },
  { code: 'pl', name: 'Polski', englishName: 'Polish' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese' },
  { code: 'th', name: 'ไทย', englishName: 'Thai' },
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese' },
  { code: 'zh', name: '中文', englishName: 'Chinese' },
] as const;

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string {
  const lang = SUPPORTED_CONTENT_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
}

/**
 * Get English language name by code
 */
export function getLanguageEnglishName(code: string): string {
  const lang = SUPPORTED_CONTENT_LANGUAGES.find(l => l.code === code);
  return lang?.englishName || code;
}
