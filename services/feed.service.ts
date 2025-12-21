/**
 * Feed Service
 *
 * Provides access to the smart feed ranking system API.
 * Handles personalized feed, feed sections, and trending stories.
 */

import {
  FeedRequest,
  FeedResponse,
  FeedSection,
  FeedSectionType,
  RankedStory,
} from '@/types/feed';
import { apiHelper } from './api-helper';

const FEED_ENDPOINT = '/api/feed';

export const feedService = {
  /**
   * Get personalized ranked feed
   * GET /api/feed
   *
   * @param request - Feed request parameters (page, pageSize, language, country, mode)
   * @returns Paginated response with ranked stories
   */
  async getRankedFeed(request: FeedRequest = {}): Promise<FeedResponse> {
    try {
      const params = new URLSearchParams();

      if (request.page) params.append('page', request.page.toString());
      if (request.pageSize) params.append('pageSize', request.pageSize.toString());
      if (request.language) params.append('language', request.language);
      if (request.country) params.append('country', request.country);
      if (request.mode) params.append('mode', request.mode);

      const queryString = params.toString();
      const url = queryString ? `${FEED_ENDPOINT}?${queryString}` : FEED_ENDPOINT;

      const response = await apiHelper.get<FeedResponse>(url);
      console.log(`✅ Fetched ${response.items.length} ranked stories (page ${response.page})`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching ranked feed:', error);
      // Return empty paginated response on error
      return {
        page: 1,
        pageSize: request.pageSize || 10,
        totalCount: 0,
        items: [],
      };
    }
  },

  /**
   * Get all feed sections for the home screen
   * GET /api/feed/sections
   *
   * Returns sections like: followed_birds, in_your_language, from_your_area, discover_worldwide
   *
   * @param storiesPerSection - Number of stories per section (default: 5)
   * @returns Array of feed sections with stories
   */
  async getAllSections(storiesPerSection: number = 5): Promise<FeedSection[]> {
    try {
      const response = await apiHelper.get<FeedSection[]>(
        `${FEED_ENDPOINT}/sections?storiesPerSection=${storiesPerSection}`
      );
      console.log(`✅ Fetched ${response.length} feed sections`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching feed sections:', error);
      return [];
    }
  },

  /**
   * Get a specific feed section
   * GET /api/feed/section/{sectionType}
   *
   * @param sectionType - Section type: from_your_area, in_your_language, discover_worldwide, followed_birds
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Feed section with stories
   */
  async getSection(sectionType: FeedSectionType, limit: number = 10): Promise<FeedSection> {
    try {
      const response = await apiHelper.get<FeedSection>(
        `${FEED_ENDPOINT}/section/${sectionType}?limit=${limit}`
      );
      console.log(`✅ Fetched section "${sectionType}" with ${response.stories.length} stories`);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching section "${sectionType}":`, error);
      return {
        sectionType,
        title: getSectionTitle(sectionType),
        stories: [],
        hasMore: false,
      };
    }
  },

  /**
   * Get trending stories globally
   * GET /api/feed/trending
   *
   * @param limit - Maximum number of stories to return (default: 10)
   * @returns Array of trending stories
   */
  async getTrendingStories(limit: number = 10): Promise<RankedStory[]> {
    try {
      const response = await apiHelper.get<RankedStory[]>(
        `${FEED_ENDPOINT}/trending?limit=${limit}`
      );
      console.log(`✅ Fetched ${response.length} trending stories`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching trending stories:', error);
      return [];
    }
  },
};

/**
 * Get display title for a section type
 */
function getSectionTitle(sectionType: FeedSectionType): string {
  switch (sectionType) {
    case 'from_your_area':
      return 'From Your Area';
    case 'in_your_language':
      return 'In Your Language';
    case 'discover_worldwide':
      return 'Discover Worldwide';
    case 'followed_birds':
      return 'Birds You Follow';
    default:
      return sectionType;
  }
}
