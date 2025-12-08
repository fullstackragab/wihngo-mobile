/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (US format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate min/max length
 */
export function hasValidLength(
  value: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  const length = value.length;

  if (min !== undefined && length < min) {
    return { valid: false, error: `Minimum length is ${min} characters` };
  }
  if (max !== undefined && length > max) {
    return { valid: false, error: `Maximum length is ${max} characters` };
  }

  return { valid: true };
}
