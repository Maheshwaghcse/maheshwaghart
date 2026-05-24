import express from 'express';
import multer from 'multer';
import path from 'path';

import fs from 'fs';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

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

        const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
        res.json({
            message: 'Image Uploaded',
            image: imagePath,
        });
    });
});

export default router;
