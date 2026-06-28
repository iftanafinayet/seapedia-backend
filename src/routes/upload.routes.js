import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { uploadImage } from '../utils/cloudinary.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, upload.single('image'), async (req, res, next) => {
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
