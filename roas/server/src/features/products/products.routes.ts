import { Router } from 'express';
import * as productsController from './products.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  bulkDeactivateSchema,
} from './products.validators';

const router = Router();

// List all active products (for dropdowns) — any authenticated user
router.get('/all-active', requireAuth, productsController.listAllActiveProducts);

// Product CRUD routes
router.get(
  '/',
  requireAuth,
  validateRequest({ query: listProductsQuerySchema }),
  productsController.listProducts,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: createProductSchema }),
  productsController.createProduct,
);

router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: productIdParamSchema }),
  productsController.getProductById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: productIdParamSchema, body: updateProductSchema }),
  productsController.updateProduct,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: productIdParamSchema }),
  productsController.deactivateProduct,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: productIdParamSchema }),
  productsController.activateProduct,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  productsController.bulkDeactivateProducts,
);

export default router;
