import Joi from 'joi';

export const biometricEnrollmentSchema = Joi.object({
  // For agent registration
  phoneNumber: Joi.string().pattern(/^254[17]\d{8}$/).optional(),
  fullName: Joi.string().min(2).max(100).optional(),
  nationalId: Joi.string().optional(),
  biometricData: Joi.alternatives().try(
    Joi.string().base64(),
    Joi.array().items(Joi.object({
      type: Joi.string().valid('fingerprint', 'palm').required(),
      fingerType: Joi.string().valid('thumb', 'index', 'middle', 'ring', 'pinky').when('type', {
        is: 'fingerprint',
        then: Joi.required()
      }),
      hand: Joi.string().valid('left', 'right').required(),
      data: Joi.string().base64().required()
    }))
  ).required(),
  primaryFingerIndex: Joi.number().integer().min(0).optional(),
  
  // For individual enrollment
  fingerType: Joi.string().valid('thumb', 'index', 'middle', 'ring', 'pinky').optional(),
  hand: Joi.string().valid('left', 'right').optional(),
  isPrimary: Joi.boolean().optional()
});

export const biometricVerificationSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().required(),
  merchantId: Joi.string().required(),
  biometricData: Joi.string().base64().required()
});
