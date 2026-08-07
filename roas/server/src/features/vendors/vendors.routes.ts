import { Router } from 'express';
import * as vendorsController from './vendors.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createVendorSchema,
  updateVendorSchema,
  listVendorsQuerySchema,
  vendorIdParamSchema,
  bulkDeactivateSchema,
} from './vendors.validators';

const router = Router();

// List all active vendors (for dropdowns) — any authenticated user
router.get('/all-active', requireAuth, vendorsController.listAllActiveVendors);

// Vendor management routes (God User + Admin)
router.get(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ query: listVendorsQuerySchema }),
  vendorsController.listVendors,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: createVendorSchema }),
  vendorsController.createVendor,
);

router.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema }),
  vendorsController.getVendorById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema, body: updateVendorSchema }),
  vendorsController.updateVendor,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema }),
  vendorsController.deactivateVendor,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema }),
  vendorsController.activateVendor,
);

// Send credentials email to vendor
router.post(
  '/:id/send-credentials',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema }),
  vendorsController.sendCredentials,
);

// Get vendor's stored password (for "Show Password" feature)
router.get(
  '/:id/password',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: vendorIdParamSchema }),
  vendorsController.getVendorPassword,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  vendorsController.bulkDeactivateVendors,
);

export default router;
