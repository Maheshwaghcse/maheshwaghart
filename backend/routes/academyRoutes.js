import express from 'express';
import { joinAcademy } from '../controllers/academyController.js';

const router = express.Router();

// @route   POST /api/academy
// @desc    Join the Art Academy waitlist
// @access  Public
router.post('/', joinAcademy);

export default router;
