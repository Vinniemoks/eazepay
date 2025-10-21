// Superuser routes
// Phase 3: Superuser Management

import { Router } from 'express';
import { SuperuserController } from '../controllers/SuperuserController';
import { authenticate, requireSuperuser } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const superuserController = new SuperuserController();

// All superuser routes require authentication and superuser role
router.use(authenticate);
router.use(requireSuperuser);

// Validation schemas
const createSuperuserSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(12).required(),
  fullName: Joi.string().min(2).max(255).required(),
  twoFactorMethod: Joi.string().valid('SMS', 'BIOMETRIC', 'BOTH').required()
});

// Superuser management routes
router.post('/create', validateRequest(createSuperuserSchema), superuserController.createSuperuser);
router.get('/list', superuserController.listSuperusers);
router.delete('/:userId/revoke', superuserController.revokeSuperuser);

export default router;
