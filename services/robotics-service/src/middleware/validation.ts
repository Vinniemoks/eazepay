import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const joi = Joi;

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'validation_error', details: error.details.map(d => d.message) });
    }
    req.body = value;
    next();
  };
}