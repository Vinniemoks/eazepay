import Joi from 'joi';

/**
 * Password validation rules
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters'
  });

/**
 * Email validation
 */
const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address'
  });

/**
 * Phone validation (international format)
 */
const phoneSchema = Joi.string()
  .pattern(/^\+?[1-9]\d{1,14}$/)
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number in international format (e.g., +254712345678)'
  });

/**
 * Registration schema
 */
export const registerSchema = Joi.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name must not exceed 100 characters'
    }),
  role: Joi.string()
    .valid('CUSTOMER', 'AGENT')
    .required()
    .messages({
      'any.only': 'Role must be either CUSTOMER or AGENT'
    }),
  verificationType: Joi.string()
    .valid('PASSPORT', 'NATIONAL_ID', 'HUDUMA', 'BUSINESS_REGISTRATION')
    .required(),
  verificationNumber: Joi.string()
    .min(5)
    .max(50)
    .trim()
    .required(),
  businessDetails: Joi.when('role', {
    is: 'AGENT',
    then: Joi.object({
      businessName: Joi.string().required(),
      registrationNumber: Joi.string().required(),
      taxNumber: Joi.string().optional(),
      businessType: Joi.string().required(),
      registrationDate: Joi.date().optional()
    }).required(),
    otherwise: Joi.forbidden()
  })
});

/**
 * Login schema
 */
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * 2FA verification schema
 */
export const verify2FASchema = Joi.object({
  sessionToken: Joi.string().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    }),
  biometricData: Joi.object().optional()
});

/**
 * Token refresh schema
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = Joi.object({
  email: emailSchema
});

/**
 * Password reset confirmation schema
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .min(32)
    .max(256)
    .required()
    .messages({
      'string.min': 'Invalid reset token'
    }),
  newPassword: passwordSchema
});

/**
 * Resend OTP schema
 */
export const resendOTPSchema = Joi.object({
  sessionToken: Joi.string().required()
});

/**
 * Session ID parameter validation
 */
export const sessionIdSchema = Joi.object({
  sessionId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid session ID format'
    })
});
