import { Router } from 'express';
import multer from 'multer';
import * as campaignsController from './campaigns.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignWeekSchema,
  listCampaignsQuerySchema,
  campaignIdParamSchema,
  campaignWeekParamSchema,
  bulkDeactivateSchema,
} from './campaigns.validators';

const router = Router();

// Use memory storage for ImageKit uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Campaign CRUD routes (God User + Admin)
router.get(
  '/',
  requireAuth,
  validateRequest({ query: listCampaignsQuerySchema }),
  campaignsController.listCampaigns,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: createCampaignSchema }),
  campaignsController.createCampaign,
);

router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: campaignIdParamSchema }),
  campaignsController.getCampaignById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: campaignIdParamSchema, body: updateCampaignSchema }),
  campaignsController.updateCampaign,
);

router.patch(
  '/:id/weeks/:weekNumber',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: campaignWeekParamSchema, body: updateCampaignWeekSchema }),
  campaignsController.updateCampaignWeek,
);

router.post(
  '/:id/postcard-image',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  upload.single('postcardImage'),
  campaignsController.uploadPostcardPdf,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: campaignIdParamSchema }),
  campaignsController.deactivateCampaign,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: campaignIdParamSchema }),
  campaignsController.activateCampaign,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  campaignsController.bulkDeactivateCampaigns,
);

export default router;
