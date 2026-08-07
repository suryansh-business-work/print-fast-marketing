import { Router } from 'express';
import * as postcardsController from './postcards.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createPostcardSchema,
  updatePostcardSchema,
  listPostcardsQuerySchema,
  postcardIdParamSchema,
  bulkDeactivateSchema,
} from './postcards.validators';

const router = Router();

// Postcard CRUD routes
router.get(
  '/',
  requireAuth,
  validateRequest({ query: listPostcardsQuerySchema }),
  postcardsController.listPostcards,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: createPostcardSchema }),
  postcardsController.createPostcard,
);

router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: postcardIdParamSchema }),
  postcardsController.getPostcardById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: postcardIdParamSchema, body: updatePostcardSchema }),
  postcardsController.updatePostcard,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: postcardIdParamSchema }),
  postcardsController.deactivatePostcard,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: postcardIdParamSchema }),
  postcardsController.activatePostcard,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  postcardsController.bulkDeactivatePostcards,
);

export default router;
