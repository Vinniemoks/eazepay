import Joi from 'joi';
import { validators } from './validators';

/**
 * Common validation schemas
 */

// Custom Joi validators
const customJoi = Joi.extend((joi) => ({
  type: 'kenyanPhone',
  base: joi.string(),
  messages: {
    'kenyanPhone.invalid': 'Invalid Kenyan phone number format'
  },
  validate(value, helpers) {
    if (!validators.isKenyanPhoneNumber(value)) {
      return { value, errors: helpers.error('kenyanPhone.invalid') };
    }
    return { value };
  }
}));

export const commonSchemas = {
  /**
   * Email schema
   */
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),

  /**
   * Password schema
   */
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),

  /**
   * Phone number schema (E.164)
   */
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format (E.164)',
      'any.required': 'Phone number is required'
    }),

  /**
   * Kenyan phone number schema
   */
  kenyanPhoneNumber: Joi.string()
    .pattern(/^(\+?254|0)[17]\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Kenyan phone number',
      'any.required': 'Phone number is required'
    }),

  /**
   * UUID schema
   */
  uuid: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid UUID format',
      'any.required': 'ID is required'
    }),

  /**
   * Name schema
   */
  name: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Name is required'
    }),

  /**
   * Amount schema
   */
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.base': 'Amount must be a number',
      'any.required': 'Amount is required'
    }),

  /**
   * Currency code schema
   */
  currency: Joi.string()
    .uppercase()
    .length(3)
    .valid('KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS', 'RWF')
    .required()
    .messages({
      'any.only': 'Invalid currency code',
      'any.required': 'Currency is required'
    }),

  /**
   * Date schema (ISO 8601)
   */
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Invalid date format (ISO 8601)',
      'any.required': 'Date is required'
    }),

  /**
   * Pagination page schema
   */
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.base': 'Page must be a number'
    }),

  /**
   * Pagination limit schema
   */
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
      'number.base': 'Limit must be a number'
    }),

  /**
   * Transaction type schema
   */
  transactionType: Joi.string()
    .uppercase()
    .valid('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT')
    .required()
    .messages({
      'any.only': 'Invalid transaction type',
      'any.required': 'Transaction type is required'
    }),

  /**
   * Transaction status schema
   */
  transactionStatus: Joi.string()
    .uppercase()
    .valid('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')
    .messages({
      'any.only': 'Invalid transaction status'
    }),

  /**
   * User role schema
   */
  userRole: Joi.string()
    .uppercase()
    .valid('CUSTOMER', 'AGENT', 'ADMIN', 'MANAGER', 'SUPERUSER')
    .required()
    .messages({
      'any.only': 'Invalid user role',
      'any.required': 'User role is required'
    }),

  /**
   * Kenyan ID number schema
   */
  kenyanID: Joi.string()
    .pattern(/^\d{7,8}$/)
    .messages({
      'string.pattern.base': 'Invalid Kenyan ID number'
    }),

  /**
   * Passport number schema
   */
  passportNumber: Joi.string()
    .pattern(/^[A-Z0-9]{6,9}$/)
    .uppercase()
    .messages({
      'string.pattern.base': 'Invalid passport number'
    }),

  /**
   * M-Pesa transaction ID schema
   */
  mpesaTransactionID: Joi.string()
    .pattern(/^[A-Z0-9]{10}$/)
    .uppercase()
    .messages({
      'string.pattern.base': 'Invalid M-Pesa transaction ID'
    }),

  /**
   * Description schema
   */
  description: Joi.string()
    .max(500)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),

  /**
   * URL schema
   */
  url: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Invalid URL format'
    }),

  /**
   * Coordinates schema
   */
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  })
};

/**
 * Pre-built validation schemas for common use cases
 */

export const schemas = {
  /**
   * User registration schema
   */
  userRegistration: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    phoneNumber: commonSchemas.kenyanPhoneNumber,
    fullName: commonSchemas.name,
    role: commonSchemas.userRole.default('CUSTOMER')
  }),

  /**
   * User login schema
   */
  userLogin: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  /**
   * Transaction creation schema
   */
  transactionCreate: Joi.object({
    type: commonSchemas.transactionType,
    amount: commonSchemas.amount,
    currency: commonSchemas.currency,
    fromUserId: commonSchemas.uuid,
    toUserId: commonSchemas.uuid,
    description: commonSchemas.description
  }),

  /**
   * Pagination schema
   */
  pagination: Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }),

  /**
   * ID parameter schema
   */
  idParam: Joi.object({
    id: commonSchemas.uuid
  }),

  /**
   * Date range schema
   */
  dateRange: Joi.object({
    startDate: commonSchemas.date,
    endDate: commonSchemas.date
  }).custom((value, helpers) => {
    if (value.startDate > value.endDate) {
      return helpers.error('dateRange.invalid');
    }
    return value;
  }).messages({
    'dateRange.invalid': 'Start date must be before end date'
  })
};
