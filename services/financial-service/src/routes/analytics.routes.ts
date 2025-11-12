// Analytics routes
import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { getAnalyticsValidator } from '../middleware/validators';

const router = Router();
const controller = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

// Financial summary (requires VIEW_ANALYTICS permission)
router.get('/summary', requirePermission('VIEW_ANALYTICS'), controller.getFinancialSummary.bind(controller));

// Detailed analytics (requires VIEW_ANALYTICS permission)
router.get('/detailed', requirePermission('VIEW_ANALYTICS'), getAnalyticsValidator, controller.getDetailedAnalytics.bind(controller));

export default router;
