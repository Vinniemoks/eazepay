import validator from 'validator';

/**
 * Common validation functions
 */

export const validators = {
  /**
   * Email validation
   */
  isEmail(value: string): boolean {
    return validator.isEmail(value);
  },

  /**
   * Phone number validation (E.164 format)
   */
  isPhoneNumber(value: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(value);
  },

  /**
   * Kenyan phone number validation
   */
  isKenyanPhoneNumber(value: string): boolean {
    // Supports: +254..., 254..., 07..., 01...
    return /^(\+?254|0)[17]\d{8}$/.test(value);
  },

  /**
   * UUID validation
   */
  isUUID(value: string): boolean {
    return validator.isUUID(value);
  },

  /**
   * Strong password validation
   * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  isStrongPassword(value: string): boolean {
    return validator.isStrongPassword(value, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    });
  },

  /**
   * URL validation
   */
  isURL(value: string): boolean {
    return validator.isURL(value);
  },

  /**
   * Date validation (ISO 8601)
   */
  isDate(value: string): boolean {
    return validator.isISO8601(value);
  },

  /**
   * Currency code validation (ISO 4217)
   */
  isCurrencyCode(value: string): boolean {
    const currencyCodes = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'RWF'];
    return currencyCodes.includes(value.toUpperCase());
  },

  /**
   * Amount validation (positive number with max 2 decimal places)
   */
  isAmount(value: number): boolean {
    return value > 0 && Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toString());
  },

  /**
   * Kenyan ID number validation
   */
  isKenyanID(value: string): boolean {
    return /^\d{7,8}$/.test(value);
  },

  /**
   * Passport number validation
   */
  isPassportNumber(value: string): boolean {
    return /^[A-Z0-9]{6,9}$/.test(value);
  },

  /**
   * M-Pesa transaction ID validation
   */
  isMpesaTransactionID(value: string): boolean {
    return /^[A-Z0-9]{10}$/.test(value);
  },

  /**
   * Alphanumeric validation
   */
  isAlphanumeric(value: string): boolean {
    return validator.isAlphanumeric(value);
  },

  /**
   * Numeric validation
   */
  isNumeric(value: string): boolean {
    return validator.isNumeric(value);
  },

  /**
   * Length validation
   */
  isLength(value: string, min: number, max: number): boolean {
    return validator.isLength(value, { min, max });
  },

  /**
   * Credit card validation
   */
  isCreditCard(value: string): boolean {
    return validator.isCreditCard(value);
  },

  /**
   * IP address validation
   */
  isIP(value: string): boolean {
    return validator.isIP(value);
  },

  /**
   * JSON validation
   */
  isJSON(value: string): boolean {
    return validator.isJSON(value);
  },

  /**
   * Base64 validation
   */
  isBase64(value: string): boolean {
    return validator.isBase64(value);
  },

  /**
   * Latitude validation
   */
  isLatitude(value: string): boolean {
    return validator.isLatLong(value);
  },

  /**
   * Longitude validation
   */
  isLongitude(value: string): boolean {
    return validator.isLatLong(value);
  }
};

/**
 * Custom validation messages
 */
export const validationMessages = {
  email: 'Invalid email format',
  phoneNumber: 'Invalid phone number format (E.164)',
  kenyanPhoneNumber: 'Invalid Kenyan phone number',
  uuid: 'Invalid UUID format',
  strongPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  url: 'Invalid URL format',
  date: 'Invalid date format (ISO 8601)',
  currencyCode: 'Invalid currency code',
  amount: 'Invalid amount (must be positive with max 2 decimal places)',
  kenyanID: 'Invalid Kenyan ID number',
  passportNumber: 'Invalid passport number',
  mpesaTransactionID: 'Invalid M-Pesa transaction ID',
  required: 'This field is required',
  minLength: (min: number) => `Minimum length is ${min} characters`,
  maxLength: (max: number) => `Maximum length is ${max} characters`,
  min: (min: number) => `Minimum value is ${min}`,
  max: (max: number) => `Maximum value is ${max}`,
  enum: (values: string[]) => `Must be one of: ${values.join(', ')}`
};
