import express from 'express';
import { 
    trackVisit, 
    trackClick, 
    getAdminStats, 
    getAdminUsers, 
    getUserInsight, 
    getAdminCustomRequests 
} from '../controllers/trackingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for silent tracking (will skip internally if user is admin)
router.post('/track-visit', trackVisit);
router.post('/track-click', trackClick);

// Protected routes (admin only)
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/users', protect, admin, getAdminUsers);
router.get('/admin/users/:id/insight', protect, admin, getUserInsight);
router.get('/admin/custom-requests', protect, admin, getAdminCustomRequests);

export default router;
