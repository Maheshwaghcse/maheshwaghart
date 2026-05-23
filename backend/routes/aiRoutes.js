import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { generateDescription } from '../controllers/aiController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import fs from 'fs';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer to store temp files in the uploads directory
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-temp-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// POST /api/ai/generate
router.post('/generate', protect, admin, upload.single('image'), generateDescription);

export default router;
