import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

export const schemas = {
  register: Joi.object({
    phoneNumber: Joi.string().pattern(/^254[17]\d{8}$/).required()
      .messages({
        'string.pattern.base': 'Phone number must be in format 254XXXXXXXXX'
      }),
    email: Joi.string().email().optional(),
    fullName: Joi.string().min(2).max(255).required(),
    nationalId: Joi.string().optional(),
    password: Joi.string().min(8).required()
      .messages({
        'string.min': 'Password must be at least 8 characters'
      })
  }),

  login: Joi.object({
    phoneNumber: Joi.string().pattern(/^254[17]\d{8}$/).required(),
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  })
};
