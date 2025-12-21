/**
 * Preferences Service
 *
 * Handles user content preferences for the smart feed system.
 * Manages preferred languages and country settings.
 */

import { UserPreferences, SUPPORTED_CONTENT_LANGUAGES } from '@/types/feed';
import { apiHelper } from './api-helper';

const USERS_ENDPOINT = '/api/users';

export const preferencesService = {
  /**
   * Get current user's content preferences
   * GET /api/users/preferences
   *
   * @returns User preferences including preferred languages and country
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiHelper.get<UserPreferences>(
        `${USERS_ENDPOINT}/preferences`
      );
      console.log('✅ Fetched user preferences');
      return response;
    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      // Return default preferences on error
      return {
        preferredLanguages: ['en'],
        country: undefined,
      };
    }
  },

  /**
   * Update preferred content languages
   * PUT /api/users/preferences/languages
   *
   * @param languages - Array of ISO 639-1 language codes
   * @throws Error if update fails
   */
  async updatePreferredLanguages(languages: string[]): Promise<void> {
    try {
      // Validate languages are supported
      const validLanguages = languages.filter(lang =>
        SUPPORTED_CONTENT_LANGUAGES.some(l => l.code === lang)
      );

      if (validLanguages.length === 0) {
        throw new Error('At least one valid language must be selected');
      }

      await apiHelper.put(`${USERS_ENDPOINT}/preferences/languages`, {
        languages: validLanguages,
      });
      console.log('✅ Updated preferred languages:', validLanguages);
    } catch (error) {
      console.error('❌ Error updating preferred languages:', error);
      throw error;
    }
  },

  /**
   * Update user's country
   * PUT /api/users/preferences/country
   *
   * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "SA")
   * @throws Error if update fails
   */
  async updateCountry(countryCode: string): Promise<void> {
    try {
      await apiHelper.put(`${USERS_ENDPOINT}/preferences/country`, {
        countryCode,
      });
      console.log('✅ Updated country:', countryCode);
    } catch (error) {
      console.error('❌ Error updating country:', error);
      throw error;
    }
  },

  /**
   * Get list of available content languages
   * GET /api/users/preferences/languages/available
   *
   * @returns Array of available language codes with names
   */
  async getAvailableLanguages(): Promise<{ code: string; name: string; englishName: string }[]> {
    try {
      const response = await apiHelper.get<{ code: string; name: string; englishName: string }[]>(
        `${USERS_ENDPOINT}/preferences/languages/available`
      );
      console.log('✅ Fetched available languages');
      return response;
    } catch (error) {
      console.error('❌ Error fetching available languages:', error);
      // Return local copy on error
      return [...SUPPORTED_CONTENT_LANGUAGES];
    }
  },
};
