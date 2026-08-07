import { Router } from 'express';
import multer from 'multer';
import * as uploadController from './upload.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { uploadFileQuerySchema } from './upload.validators';

const router = Router();

// Use memory storage for ImageKit uploads (buffer-based)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, SVG, and PDF files are allowed'));
    }
  },
});

// Upload a file to ImageKit
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  validateRequest({ query: uploadFileQuerySchema }),
  uploadController.uploadFile,
);

export default router;
