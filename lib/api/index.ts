/**
 * Services barrel export
 * Import all services from a single entry point
 *
 * @example
 * import { authService, birdService } from '@/lib/api';
 */

export * from "./api-client";
export * from "./auth.service";

// Legacy service exports (still in /services folder)
// These will be migrated to /lib/api gradually
export { birdService } from "@/services/bird.service";
export { premiumService } from "@/services/premium.service";
export { searchService } from "@/services/search.service";
export { storyService } from "@/services/story.service";
export { supportService } from "@/services/support.service";
export { userService } from "@/services/user.service";
