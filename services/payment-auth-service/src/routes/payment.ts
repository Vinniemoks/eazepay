import { Router } from 'express';
import { PaymentController, uploadMiddleware } from '../controllers/PaymentController';

const router = Router();

// Authorize payment (no auth required - biometric is the auth)
router.post('/authorize', uploadMiddleware, PaymentController.authorizePayment);

// Get payment status
router.get('/status/:transactionId', PaymentController.getPaymentStatus);

export default router;
