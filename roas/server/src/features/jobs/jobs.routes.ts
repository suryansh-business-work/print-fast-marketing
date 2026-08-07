import { Router } from 'express';
import * as jobsController from './jobs.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import { jobsListQuerySchema, vendorIdParamSchema } from './jobs.validators';

const router = Router();

// List jobs for a vendor
router.get(
  '/vendor/:vendorId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: vendorIdParamSchema, query: jobsListQuerySchema }),
  jobsController.listJobs,
);

// Get single job by ID
router.get(
  '/:jobId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  jobsController.getJobById,
);

export default router;
