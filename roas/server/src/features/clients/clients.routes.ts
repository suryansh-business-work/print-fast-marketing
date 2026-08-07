import { Router } from 'express';
import * as clientsController from './clients.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
  clientIdParamSchema,
  bulkDeactivateSchema,
} from './clients.validators';

const router = Router();

// Client CRUD routes
router.get(
  '/',
  requireAuth,
  validateRequest({ query: listClientsQuerySchema }),
  clientsController.listClients,
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: createClientSchema }),
  clientsController.createClient,
);

router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: clientIdParamSchema }),
  clientsController.getClientById,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: clientIdParamSchema, body: updateClientSchema }),
  clientsController.updateClient,
);

router.patch(
  '/:id/deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: clientIdParamSchema }),
  clientsController.deactivateClient,
);

router.patch(
  '/:id/activate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: clientIdParamSchema }),
  clientsController.activateClient,
);

router.post(
  '/bulk-deactivate',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: bulkDeactivateSchema }),
  clientsController.bulkDeactivateClients,
);

export default router;
