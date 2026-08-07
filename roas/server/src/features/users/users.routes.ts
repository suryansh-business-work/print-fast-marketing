import { Router } from 'express';
import * as usersController from './users.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
  bulkDeactivateSchema,
} from './users.validators';

const router = Router();

// Profile routes (any authenticated user)
router.get('/profile', requireAuth, usersController.getProfile);

router.patch(
  '/profile',
  requireAuth,
  validateRequest({ body: updateUserSchema }),
  usersController.updateProfile,
);

// User management routes (God User + Admin)
router.get(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ query: listUsersQuerySchema }),
  usersController.listUsers,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: createUserSchema }),
  usersController.createUser,
);

router.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: userIdParamSchema }),
  usersController.getUserById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  usersController.updateUser,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: userIdParamSchema }),
  usersController.deactivateUser,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ params: userIdParamSchema }),
  usersController.activateUser,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  usersController.bulkDeactivateUsers,
);

export default router;
