import { Router } from 'express';
import * as invoicesController from './invoices.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import { invoicesListQuerySchema, vendorIdParamSchema } from './invoices.validators';

const router = Router();

// List invoices for a vendor
router.get(
  '/vendor/:vendorId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: vendorIdParamSchema, query: invoicesListQuerySchema }),
  invoicesController.listInvoices,
);

// Get single invoice by ID
router.get(
  '/:invoiceId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  invoicesController.getInvoiceById,
);

export default router;
