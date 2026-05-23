import express from 'express';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createFeedback).get(protect, admin, getFeedback);

export default router;
