/**
 * Simple Input Sanitization Utilities
 * Provides functions to validate and sanitize user input without heavy dependencies
 */

/**
 * Simple HTML sanitization - removes all HTML tags
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove all HTML tags and decode common entities
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Validates and sanitizes text input
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);
  
  return sanitized;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  return isValidEmail(sanitized) ? sanitized : '';
}

/**
 * Validates phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitizes phone number input
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Keep only digits, plus, spaces, dashes, and parentheses
  const sanitized = phone.replace(/[^\d\+\s\-\(\)]/g, '').trim();
  return isValidPhone(sanitized) ? sanitized : '';
}

/**
 * Validates name format (letters, spaces, hyphens, apostrophes)
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s\-\']+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
}

/**
 * Sanitizes name input
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // Keep only letters, spaces, hyphens, and apostrophes
  const sanitized = name.replace(/[^a-zA-Z\s\-\']/g, '').trim();
  
  // Capitalize first letter of each word
  return sanitized.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validates and sanitizes a complete form object
 */
export function validateAndSanitize<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, {
    type: 'text' | 'email' | 'phone' | 'name' | 'html';
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  }>
): { isValid: boolean; sanitizedData: Partial<T>; errors: string[] } {
  const errors: string[] = [];
  const sanitizedData = {} as Partial<T>;
  
  for (const [key, value] of Object.entries(data)) {
    const fieldSchema = schema[key as keyof T];
    
    if (!fieldSchema) continue;
    
    // Check if required field is missing
    if (fieldSchema.required && (!value || value.toString().trim() === '')) {
      errors.push(`${key.toString()} is required`);
      continue;
    }
    
    // Skip validation if field is empty and not required
    if (!value && !fieldSchema.required) {
      (sanitizedData as any)[key] = value;
      continue;
    }
    
    const stringValue = value.toString();
    
    // Validate length
    if (fieldSchema.minLength && stringValue.length < fieldSchema.minLength) {
      errors.push(`${key.toString()} must be at least ${fieldSchema.minLength} characters`);
      continue;
    }
    
    if (fieldSchema.maxLength && stringValue.length > fieldSchema.maxLength) {
      errors.push(`${key.toString()} must not exceed ${fieldSchema.maxLength} characters`);
      continue;
    }
    
    // Sanitize based on type
    switch (fieldSchema.type) {
      case 'email':
        if (!isValidEmail(stringValue)) {
          errors.push(`${key.toString()} must be a valid email address`);
        } else {
          (sanitizedData as any)[key] = sanitizeEmail(stringValue);
        }
        break;
        
      case 'phone':
        if (!isValidPhone(stringValue)) {
          errors.push(`${key.toString()} must be a valid phone number`);
        } else {
          (sanitizedData as any)[key] = sanitizePhone(stringValue);
        }
        break;
        
      case 'name':
        if (!isValidName(stringValue)) {
          errors.push(`${key.toString()} must contain only letters, spaces, hyphens, and apostrophes`);
        } else {
          (sanitizedData as any)[key] = sanitizeName(stringValue);
        }
        break;
        
      case 'html':
        (sanitizedData as any)[key] = sanitizeHtml(stringValue);
        break;
        
      case 'text':
      default:
        (sanitizedData as any)[key] = sanitizeText(stringValue, fieldSchema.maxLength);
        break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedData,
    errors
  };
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: string, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  if (typeof input !== 'string') return null;
  
  const num = parseFloat(input.replace(/[^\d.-]/g, ''));
  
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  
  return num;
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Sanitizes date input
 */
export function sanitizeDate(dateString: string): string | null {
  if (typeof dateString !== 'string') return null;
  
  const sanitized = dateString.trim();
  return isValidDate(sanitized) ? sanitized : null;
}
