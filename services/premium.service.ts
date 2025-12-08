import {
  BirdPremiumSubscription,
  PremiumStatusResponse,
  SubscribeDto,
  UpdatePremiumStyleDto,
} from "@/types/premium";
import Constants from "expo-constants";
import { apiHelper } from "./api-helper";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

/**
 * Subscribe a bird to premium features
 */
export async function subscribeBirdToPremium(
  birdId: string,
  dto: SubscribeDto
): Promise<BirdPremiumSubscription> {
  const endpoint = `${API_URL}birds/${birdId}/premium/subscribe`;
  return apiHelper.post<BirdPremiumSubscription>(endpoint, dto);
}

/**
 * Cancel premium subscription for a bird
 */
export async function cancelBirdPremium(
  birdId: string
): Promise<BirdPremiumSubscription> {
  const endpoint = `${API_URL}birds/${birdId}/premium/cancel`;
  return apiHelper.post<BirdPremiumSubscription>(endpoint, {});
}

/**
 * Get premium subscription status for a bird
 */
export async function getBirdPremiumStatus(
  birdId: string
): Promise<PremiumStatusResponse> {
  const endpoint = `${API_URL}birds/${birdId}/premium/status`;
  return apiHelper.get<PremiumStatusResponse>(endpoint);
}

/**
 * Update premium style settings for a bird
 */
export async function updateBirdPremiumStyle(
  birdId: string,
  style: UpdatePremiumStyleDto
): Promise<{ premiumStyle: UpdatePremiumStyleDto }> {
  const endpoint = `${API_URL}birds/${birdId}/premium/style`;
  return apiHelper.patch<{ premiumStyle: UpdatePremiumStyleDto }>(
    endpoint,
    style
  );
}

/**
 * Highlight a story (premium feature)
 */
export async function highlightStory(
  birdId: string,
  storyId: string,
  highlightOrder: number
): Promise<void> {
  const endpoint = `${API_URL}birds/${birdId}/stories/${storyId}/highlight`;
  return apiHelper.patch<void>(endpoint, { highlightOrder });
}

/**
 * Remove highlight from a story
 */
export async function unhighlightStory(
  birdId: string,
  storyId: string
): Promise<void> {
  const endpoint = `${API_URL}birds/${birdId}/stories/${storyId}/highlight`;
  return apiHelper.patch<void>(endpoint, { highlightOrder: null });
}

/**
 * Check if a bird has active premium features
 */
export function hasPremium(bird: { isPremium?: boolean }): boolean {
  return bird.isPremium === true;
}

/**
 * Get premium feature availability
 */
export function getPremiumFeatures(isPremium: boolean) {
  return {
    customFrames: isPremium,
    storyHighlights: isPremium,
    premiumBadge: isPremium,
    visualBoost: isPremium,
  };
}
