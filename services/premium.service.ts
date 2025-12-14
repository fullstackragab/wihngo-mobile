import {
  BirdPremiumSubscription,
  CharityImpact,
  CharityPartner,
  GlobalCharityImpact,
  PremiumPlanDetails,
  PremiumStatusResponse,
  PremiumStyleResponse,
  SubscribeDto,
  SubscriptionResponse,
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

/**
 * Get available premium plans
 */
export async function getPremiumPlans(): Promise<PremiumPlanDetails[]> {
  const endpoint = `${API_URL}premium/plans`;
  return apiHelper.get<PremiumPlanDetails[]>(endpoint);
}

/**
 * Subscribe bird to premium (NEW API)
 */
export async function subscribeToPremium(
  dto: SubscribeDto
): Promise<SubscriptionResponse> {
  const endpoint = `${API_URL}premium/subscribe`;
  return apiHelper.post<SubscriptionResponse>(endpoint, dto);
}

/**
 * Get premium status (NEW API)
 */
export async function getPremiumStatus(
  birdId: string
): Promise<PremiumStatusResponse> {
  const endpoint = `${API_URL}premium/status/${birdId}`;
  return apiHelper.get<PremiumStatusResponse>(endpoint);
}

/**
 * Cancel subscription (NEW API)
 */
export async function cancelSubscription(
  birdId: string
): Promise<{ message: string }> {
  const endpoint = `${API_URL}premium/cancel/${birdId}`;
  return apiHelper.post<{ message: string }>(endpoint, {});
}

/**
 * Update premium style (NEW API)
 */
export async function updatePremiumStyle(
  birdId: string,
  style: UpdatePremiumStyleDto
): Promise<PremiumStyleResponse> {
  const endpoint = `${API_URL}premium/style/${birdId}`;
  return apiHelper.put<PremiumStyleResponse>(endpoint, style);
}

/**
 * Get premium style (NEW API)
 */
export async function getPremiumStyle(
  birdId: string
): Promise<PremiumStyleResponse> {
  const endpoint = `${API_URL}premium/style/${birdId}`;
  return apiHelper.get<PremiumStyleResponse>(endpoint);
}

/**
 * Get bird charity impact
 */
export async function getBirdCharityImpact(
  birdId: string
): Promise<CharityImpact> {
  const endpoint = `${API_URL}charity/impact/${birdId}`;
  return apiHelper.get<CharityImpact>(endpoint);
}

/**
 * Get global charity impact
 */
export async function getGlobalCharityImpact(): Promise<GlobalCharityImpact> {
  const endpoint = `${API_URL}charity/impact/global`;
  return apiHelper.get<GlobalCharityImpact>(endpoint);
}

/**
 * Get charity partners
 */
export async function getCharityPartners(): Promise<CharityPartner[]> {
  const endpoint = `${API_URL}charity/partners`;
  return apiHelper.get<CharityPartner[]>(endpoint);
}
