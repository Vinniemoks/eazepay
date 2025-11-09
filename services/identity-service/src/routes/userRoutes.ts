import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import Joi from 'joi';
import { validateParams, commonSchemas } from '@eazepay/validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validate :userId param and return placeholder
const userIdParamSchema = Joi.object({ userId: commonSchemas.uuid });
router.get('/profile/:userId', validateParams(userIdParamSchema), (req, res) => {
  res.json({ success: true, message: 'User profile endpoint - coming soon', userId: req.params.userId });
});

export { router as userRoutes };
