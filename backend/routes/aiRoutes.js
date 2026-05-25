import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { generateDescription } from '../controllers/aiController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import fs from 'fs';

const router = express.Router();

// Serverless mode: skip creating uploads directory

// Setup multer to store temp files in memory for serverless
const storage = multer.memoryStorage();

const upload = multer({ storage });

// POST /api/ai/generate
router.post('/generate', protect, admin, upload.single('image'), generateDescription);

export default router;
