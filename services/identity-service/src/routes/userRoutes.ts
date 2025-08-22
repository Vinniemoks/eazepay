import { Router } from 'express';

const router = Router();

// User routes will be implemented here
router.get('/profile/:userId', (req, res) => {
  res.json({ message: 'User profile endpoint - coming soon' });
});

export { router as userRoutes };
