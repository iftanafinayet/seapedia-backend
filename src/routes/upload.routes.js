import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { uploadImage } from '../utils/cloudinary.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
  'image/heic', 'image/heif', 'image/bmp', 'image/tiff', 'image/svg+xml',
];

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported image format. Allowed: JPEG, PNG, WebP, AVIF, GIF, HEIC, BMP, TIFF, SVG'));
    }
  },
});

router.post('/', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const result = await uploadImage(req.file.path, 'seapedia');
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, data: result });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
});

export default router;
