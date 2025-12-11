/**
 * Services barrel export
 * Import all services from a single entry point
 *
 * @example
 * import { loginService, registerService, birdService } from '@/lib/api';
 */

// Export API client utilities
export * from "./api-client";

// Export auth services with clear naming
export {
  login as loginService,
  register as registerService,
} from "./auth.service";

// Legacy service exports (still in /services folder)
// These will be migrated to /lib/api gradually
export { birdService } from "@/services/bird.service";
export { premiumService } from "@/services/premium.service";
export { searchService } from "@/services/search.service";
export { storyService } from "@/services/story.service";
export { supportService } from "@/services/support.service";
export { userService } from "@/services/user.service";
