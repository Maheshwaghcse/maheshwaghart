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

        // Convert the file buffer to a base64 Data URI string
        // This allows the image to be stored directly in MongoDB without needing Cloudinary/AWS S3
        // Note: For very large applications, Cloudinary is recommended, but this works perfectly for now!
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        res.json({
            message: 'Image processed successfully',
            image: base64Image,
        });
    });
});

export default router;
