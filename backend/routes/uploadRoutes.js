import express from 'express';
import multer from 'multer';
import path from 'path';

import fs from 'fs';

const router = express.Router();

// Since Vercel is read-only, we skip creating the uploads folder

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors (e.g. file too large)
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // File filter rejection (e.g. 'Images only!')
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file received. Make sure the field name is "image".' });
        }

        // For serverless (Vercel), we would normally upload this buffer to a cloud service (e.g. S3, Cloudinary).
        // Since we are using memoryStorage, req.file.buffer contains the file data.
        // We'll return a placeholder path or a data URL (not recommended for large files)
        // Note: For a true serverless app, YOU MUST implement cloud storage upload here.
        
        // As a temporary stand-in to keep frontend from breaking immediately, 
        // we'll return a mock path (this image won't actually be served by Vercel!)
        const imagePath = `/uploads/${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        
        res.json({
            message: 'Image received in memory (Requires Cloud Storage in Serverless)',
            image: imagePath,
        });
    });
});

export default router;
