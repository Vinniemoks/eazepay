// Analytics routes
import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();
const controller = new AnalyticsController();

// All routes require authentication
router.use(authMiddleware);

// Financial summary (requires VIEW_ANALYTICS permission)
router.get('/summary', requirePermission('VIEW_ANALYTICS'), controller.getFinancialSummary.bind(controller));

// Detailed analytics (requires VIEW_ANALYTICS permission)
router.get('/detailed', requirePermission('VIEW_ANALYTICS'), controller.getDetailedAnalytics.bind(controller));

export default router;
