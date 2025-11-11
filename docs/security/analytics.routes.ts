import { Router } from 'express';
import { getDashboardSummary } from '../controllers/analytics.controller';
import { authenticate } from '@eazepay/auth-middleware';

const router = Router();

// All analytics routes should be protected
router.use(authenticate);

router.get('/dashboard-summary', getDashboardSummary);

export default router;