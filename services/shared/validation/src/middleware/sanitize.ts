import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitization options
 */
interface SanitizeOptions {
  trim?: boolean;
  escape?: boolean;
  stripLow?: boolean;
  blacklist?: string;
  whitelist?: string;
}

/**
 * Sanitize input data
 */
export function sanitizeInput(
  data: any,
  options: SanitizeOptions = {}
): any {
  const {
    trim = true,
    escape = true,
    stripLow = true,
    blacklist,
    whitelist
  } = options;

  if (typeof data === 'string') {
    let sanitized = data;

    if (trim) {
      sanitized = validator.trim(sanitized);
    }

    if (stripLow) {
      sanitized = validator.stripLow(sanitized);
    }

    if (blacklist) {
      sanitized = validator.blacklist(sanitized, blacklist);
    }

    if (whitelist) {
      sanitized = validator.whitelist(sanitized, whitelist);
    }

    if (escape) {
      sanitized = validator.escape(sanitized);
    }

    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item, options));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      sanitized[key] = sanitizeInput(data[key], options);
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitization middleware
 */
export function sanitize(options: SanitizeOptions = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeInput(req.body, options);
    }

    // Sanitize query
    if (req.query) {
      req.query = sanitizeInput(req.query, options);
    }

    // Sanitize params
    if (req.params) {
      req.params = sanitizeInput(req.params, options);
    }

    next();
  };
}

/**
 * Remove sensitive fields from object
 */
export function removeSensitiveFields(
  data: any,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey']
): any {
  if (Array.isArray(data)) {
    return data.map(item => removeSensitiveFields(item, sensitiveFields));
  }

  if (typeof data === 'object' && data !== null) {
    const cleaned: any = {};
    for (const key in data) {
      if (!sensitiveFields.includes(key.toLowerCase())) {
        cleaned[key] = removeSensitiveFields(data[key], sensitiveFields);
      }
    }
    return cleaned;
  }

  return data;
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string, countryCode: string = '254'): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Handle Kenyan numbers
  if (countryCode === '254') {
    // Remove leading 0
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1);
    }
    // Add country code if not present
    if (!normalized.startsWith('254')) {
      normalized = '254' + normalized;
    }
    // Add + prefix
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
  }

  return normalized;
}

/**
 * Normalize email to lowercase
 */
export function normalizeEmail(email: string): string {
  return validator.normalizeEmail(email) || email.toLowerCase().trim();
}

/**
 * Strip HTML tags
 */
export function stripHTML(text: string): string {
  return validator.stripLow(text.replace(/<[^>]*>/g, ''));
}
