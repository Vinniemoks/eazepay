import type { Schema } from 'joi';
import type { Request, Response, NextFunction } from 'express';

export function validateRequest(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
      return res.status(400).json({
        error: 'validation_failed',
        details: error.details?.map(d => ({ message: d.message, path: d.path })) ?? [],
      });
    }
    next();
  };
}