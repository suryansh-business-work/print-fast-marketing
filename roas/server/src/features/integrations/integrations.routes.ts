import { Router } from 'express';
import * as integrationsController from './integrations.controllers';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { UserRole } from '../../types/enums';
import {
  connectServiceTitanSchema,
  connectJobberSchema,
  disconnectIntegrationSchema,
  vendorIntegrationsParamSchema,
  integrationIdParamSchema,
  updateSettingsSchema,
  jobberCallbackQuerySchema,
  saveJobberCredentialsSchema,
} from './integrations.validators';

const router = Router();

// Jobber OAuth callback (no auth — redirect from Jobber)
router.get(
  '/jobber/callback',
  validateRequest({ query: jobberCallbackQuerySchema }),
  integrationsController.jobberCallback,
);

// Get all integrations for a vendor
router.get(
  '/vendor/:vendorId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: vendorIntegrationsParamSchema }),
  integrationsController.getVendorIntegrations,
);

// Get Jobber OAuth URL for a vendor
router.get(
  '/jobber/oauth-url/:vendorId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: vendorIntegrationsParamSchema }),
  integrationsController.getJobberOAuthUrl,
);

// Connect Service Titan
router.post(
  '/service-titan/connect',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: connectServiceTitanSchema }),
  integrationsController.connectServiceTitan,
);

// Connect Jobber
router.post(
  '/jobber/connect',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: connectJobberSchema }),
  integrationsController.connectJobber,
);

// Save Jobber app credentials (before OAuth)
router.post(
  '/jobber/credentials',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: saveJobberCredentialsSchema }),
  integrationsController.saveJobberCredentials,
);

// Disconnect an integration
router.post(
  '/disconnect',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ body: disconnectIntegrationSchema }),
  integrationsController.disconnectIntegration,
);

// Update integration settings (credentials)
router.patch(
  '/settings/:integrationId',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: integrationIdParamSchema, body: updateSettingsSchema }),
  integrationsController.updateSettings,
);

// Trigger manual sync
router.post(
  '/:integrationId/sync',
  requireAuth,
  requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER),
  validateRequest({ params: integrationIdParamSchema }),
  integrationsController.triggerSync,
);

export default router;
