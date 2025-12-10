/**
 * useFormValidation Hook
 * Reusable hook for form validation with error management
 */

import { useCallback, useState } from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (fieldName: string, value: string): string | null => {
      const rule = rules[fieldName];
      if (!rule) return null;

      // Required validation
      if (rule.required && !value.trim()) {
        return rule.message || `${fieldName} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!value.trim() && !rule.required) {
        return null;
      }

      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return (
          rule.message ||
          `${fieldName} must be at least ${rule.minLength} characters`
        );
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return (
          rule.message ||
          `${fieldName} must be less than ${rule.maxLength} characters`
        );
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${fieldName} format is invalid`;
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        return rule.message || `${fieldName} is invalid`;
      }

      return null;
    },
    [rules]
  );

  const validateForm = useCallback(
    (values: { [key: string]: string }): boolean => {
      const newErrors: ValidationErrors = {};

      Object.keys(rules).forEach((fieldName) => {
        const error = validateField(fieldName, values[fieldName] || "");
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules, validateField]
  );

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return touched[fieldName] || false;
    },
    [touched]
  );

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setFieldTouched,
    isFieldTouched,
    getFieldError,
    hasErrors,
  };
}

// Common validation rules
export const commonValidations = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    message: "Please enter a valid phone number",
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: "Please enter a valid URL",
  },
  alphanumeric: {
    pattern: /^[a-zA-Z0-9]+$/,
    message: "Only letters and numbers are allowed",
  },
  noSpecialChars: {
    pattern: /^[a-zA-Z0-9\s]+$/,
    message: "Special characters are not allowed",
  },
};
