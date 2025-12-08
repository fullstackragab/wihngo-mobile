/**
 * Services barrel export
 * Import all services from a single entry point
 *
 * @example
 * import { authService, birdService } from '@/lib/services';
 */

export * from "./api-client";
export { authService } from "./auth.service";
export { birdService } from "./bird.service";
export { loginService } from "./login.service";
export { premiumService } from "./premium.service";
export { searchService } from "./search.service";
export { storyService } from "./story.service";
export { supportService } from "./support.service";
export { userService } from "./user.service";
