import express from 'express';
import { trackVisit, trackClick, getAdminStats } from '../controllers/trackingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for silent tracking (will skip internally if user is admin)
router.post('/track-visit', trackVisit);
router.post('/track-click', trackClick);

// Protected routes (admin only)
router.get('/admin/stats', protect, admin, getAdminStats);

export default router;
