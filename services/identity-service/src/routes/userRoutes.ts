import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validate :userId param and return placeholder
const userIdParamSchema = Joi.object({ userId: Joi.string().uuid().required() });
router.get('/profile/:userId', (req, res, next) => {
  const { error } = userIdParamSchema.validate({ userId: req.params.userId });
  if (error) {
    return res.status(400).json({ success: false, error: 'Invalid userId', code: 'INVALID_USER_ID' });
  }
  next();
}, (req, res) => {
  res.json({ success: true, message: 'User profile endpoint - coming soon', userId: req.params.userId });
});

export { router as userRoutes };
