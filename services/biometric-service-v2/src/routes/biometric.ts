import { Router } from 'express';
import { BiometricController, uploadMiddleware } from '../controllers/BiometricController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Enroll biometric
router.post('/enroll', uploadMiddleware, BiometricController.enroll);

// Verify biometric (can be used without userId for 1:N matching)
router.post('/verify', uploadMiddleware, BiometricController.verify);

// Get enrolled templates
router.get('/templates', BiometricController.getTemplates);

// Delete template
router.delete('/templates/:templateId', BiometricController.deleteTemplate);

// Get enrollment status
router.get('/status', BiometricController.getEnrollmentStatus);

export default router;
