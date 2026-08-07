import {
  IntegrationModel,
  IIntegration,
  IntegrationProvider,
  IntegrationStatus,
} from './integrations.models';
import { VendorModel } from '../vendors/vendors.models';
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../../utils/errors';
import * as jobberOAuth from './providers/jobber.client';
import { syncIntegration } from './sync.service';
import config from '../../config/config';
import logger from '../../utils/logger';

interface IntegrationResponse {
  integrationId: string;
  vendorId: string;
  provider: string;
  status: string;
  environment?: string;
  connectedAt: Date | null;
  lastSyncAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const toIntegrationResponse = (integration: IIntegration): IntegrationResponse => ({
  integrationId: integration._id.toString(),
  vendorId: integration.vendor.toString(),
  provider: integration.provider,
  status: integration.status,
  environment: integration.credentials?.environment,
  connectedAt: integration.connectedAt,
  lastSyncAt: integration.lastSyncAt,
  isActive: integration.isActive,
  createdAt: integration.createdAt,
  updatedAt: integration.updatedAt,
});

export const getVendorIntegrations = async (vendorId: string): Promise<IntegrationResponse[]> => {
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const integrations = await IntegrationModel.find({
    vendor: vendorId,
    isActive: true,
  });

  return integrations.map(toIntegrationResponse);
};

export const connectServiceTitan = async (
  vendorId: string,
  tenantId: string,
  clientId: string,
  clientSecret: string,
  environment: string,
  createdBy: string,
): Promise<IntegrationResponse> => {
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  // Check if already connected
  const existing = await IntegrationModel.findOne({
    vendor: vendorId,
    provider: IntegrationProvider.SERVICE_TITAN,
    isActive: true,
  });

  if (existing && existing.status === IntegrationStatus.CONNECTED) {
    throw new ConflictError('Service Titan integration already connected for this vendor');
  }

  const integration = existing
    ? await IntegrationModel.findByIdAndUpdate(
        existing._id,
        {
          status: IntegrationStatus.CONNECTED,
          credentials: { tenantId, clientId, clientSecret, environment },
          connectedAt: new Date(),
        },
        { new: true },
      )
    : await IntegrationModel.create({
        vendor: vendorId,
        provider: IntegrationProvider.SERVICE_TITAN,
        status: IntegrationStatus.CONNECTED,
        credentials: { tenantId, clientId, clientSecret, environment },
        connectedAt: new Date(),
        createdBy,
      });

  if (!integration) {
    throw new NotFoundError('Failed to create integration');
  }

  logger.info(`Service Titan connected for vendor ${vendorId}`);
  return toIntegrationResponse(integration);
};

export const connectJobber = async (
  vendorId: string,
  code: string,
): Promise<IntegrationResponse> => {
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const existing = await IntegrationModel.findOne({
    vendor: vendorId,
    provider: IntegrationProvider.JOBBER,
    isActive: true,
  }).select('+credentials.clientId +credentials.clientSecret +credentials.redirectUri');

  if (existing && existing.status === IntegrationStatus.CONNECTED) {
    throw new ConflictError('Jobber integration already connected for this vendor');
  }

  if (!existing?.credentials?.clientId || !existing?.credentials?.clientSecret) {
    throw new ValidationError('Jobber app credentials not configured. Please save Client ID and Client Secret first.');
  }

  const creds: jobberOAuth.JobberAppCredentials = {
    clientId: existing.credentials.clientId,
    clientSecret: existing.credentials.clientSecret,
    redirectUri: existing.credentials.redirectUri || '',
  };

  // Exchange authorization code for tokens via Jobber OAuth
  const tokens = await jobberOAuth.exchangeCodeForTokens(code, creds);

  const integration = await IntegrationModel.findByIdAndUpdate(
    existing._id,
    {
      status: IntegrationStatus.CONNECTED,
      'credentials.accessToken': tokens.accessToken,
      'credentials.refreshToken': tokens.refreshToken,
      connectedAt: new Date(),
    },
    { new: true },
  );

  if (!integration) {
    throw new NotFoundError('Failed to create integration');
  }

  logger.info(`Jobber connected for vendor ${vendorId}`);
  return toIntegrationResponse(integration);
};

export const disconnectIntegration = async (
  vendorId: string,
  provider: string,
): Promise<IntegrationResponse> => {
  const integration = await IntegrationModel.findOne({
    vendor: vendorId,
    provider,
    isActive: true,
  });

  if (!integration) {
    throw new NotFoundError('Integration not found');
  }

  // For Jobber, preserve app credentials (clientId, clientSecret, redirectUri) so user can reconnect
  if (integration.provider === IntegrationProvider.JOBBER) {
    await IntegrationModel.findByIdAndUpdate(integration._id, {
      status: IntegrationStatus.PENDING,
      'credentials.accessToken': null,
      'credentials.refreshToken': null,
      'credentials.tokenExpiresAt': null,
      connectedAt: null,
      lastSyncAt: null,
    });
    const updated = await IntegrationModel.findById(integration._id);
    if (!updated) throw new NotFoundError('Integration not found');
    logger.info(`Integration ${provider} disconnected for vendor ${vendorId} (credentials preserved)`);
    return toIntegrationResponse(updated);
  }

  integration.status = IntegrationStatus.DISCONNECTED;
  integration.credentials = {};
  integration.connectedAt = null;
  await integration.save();

  logger.info(`Integration ${provider} disconnected for vendor ${vendorId}`);
  return toIntegrationResponse(integration);
};

export const updateIntegrationSettings = async (
  integrationId: string,
  settings: {
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    environment?: string;
  },
  userId: string,
  userVendorId: string | null,
): Promise<IntegrationResponse> => {
  const integration = await IntegrationModel.findById(integrationId);
  if (!integration) {
    throw new NotFoundError('Integration not found');
  }

  // Vendor users can only update their own integrations
  if (userVendorId && integration.vendor.toString() !== userVendorId) {
    throw new ForbiddenError('You can only update your own integrations');
  }

  const updateFields: Record<string, string | undefined> = {};
  if (settings.tenantId !== undefined) updateFields['credentials.tenantId'] = settings.tenantId;
  if (settings.clientId !== undefined) updateFields['credentials.clientId'] = settings.clientId;
  if (settings.clientSecret !== undefined) updateFields['credentials.clientSecret'] = settings.clientSecret;
  if (settings.environment !== undefined) updateFields['credentials.environment'] = settings.environment;

  const updated = await IntegrationModel.findByIdAndUpdate(
    integrationId,
    { $set: updateFields },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundError('Failed to update integration');
  }

  logger.info(`Integration ${integrationId} settings updated by user ${userId}`);
  return toIntegrationResponse(updated);
};

export const triggerSync = async (
  integrationId: string,
  userVendorId: string | null,
): Promise<{ jobs: number; invoices: number }> => {
  const integration = await IntegrationModel.findById(integrationId);
  if (!integration) {
    throw new NotFoundError('Integration not found');
  }

  if (integration.status !== IntegrationStatus.CONNECTED) {
    throw new ConflictError('Integration is not connected');
  }

  // Vendor users can only sync their own integrations
  if (userVendorId && integration.vendor.toString() !== userVendorId) {
    throw new ForbiddenError('You can only sync your own integrations');
  }

  return syncIntegration(integrationId);
};

export const handleJobberCallback = async (
  code: string,
  vendorId: string,
): Promise<IntegrationResponse> => {
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const existing = await IntegrationModel.findOne({
    vendor: vendorId,
    provider: IntegrationProvider.JOBBER,
    isActive: true,
  }).select('+credentials.clientId +credentials.clientSecret +credentials.redirectUri');

  if (!existing?.credentials?.clientId || !existing?.credentials?.clientSecret) {
    throw new ValidationError('Jobber app credentials not found for this vendor');
  }

  const creds: jobberOAuth.JobberAppCredentials = {
    clientId: existing.credentials.clientId,
    clientSecret: existing.credentials.clientSecret,
    redirectUri: existing.credentials.redirectUri || '',
  };

  const tokens = await jobberOAuth.exchangeCodeForTokens(code, creds);

  const integration = await IntegrationModel.findByIdAndUpdate(
    existing._id,
    {
      status: IntegrationStatus.CONNECTED,
      'credentials.accessToken': tokens.accessToken,
      'credentials.refreshToken': tokens.refreshToken,
      connectedAt: new Date(),
    },
    { new: true },
  );

  if (!integration) {
    throw new NotFoundError('Failed to complete Jobber OAuth');
  }

  logger.info(`Jobber OAuth callback completed for vendor ${vendorId}`);
  return toIntegrationResponse(integration);
};

export const getJobberOAuthUrl = async (vendorId: string): Promise<string> => {
  const integration = await IntegrationModel.findOne({
    vendor: vendorId,
    provider: IntegrationProvider.JOBBER,
    isActive: true,
  }).select('+credentials.clientId +credentials.clientSecret +credentials.redirectUri');

  if (!integration?.credentials?.clientId || !integration?.credentials?.clientSecret) {
    throw new ValidationError(
      'Jobber app credentials not configured. Please save Client ID and Client Secret first.',
    );
  }

  const creds: jobberOAuth.JobberAppCredentials = {
    clientId: integration.credentials.clientId,
    clientSecret: integration.credentials.clientSecret,
    redirectUri: integration.credentials.redirectUri || `${getDefaultRedirectUri()}`,
  };

  return jobberOAuth.getOAuthUrl(vendorId, creds);
};

export const saveJobberCredentials = async (
  vendorId: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string | undefined,
  createdBy: string,
): Promise<IntegrationResponse> => {
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const existing = await IntegrationModel.findOne({
    vendor: vendorId,
    provider: IntegrationProvider.JOBBER,
    isActive: true,
  });

  if (existing && existing.status === IntegrationStatus.CONNECTED) {
    throw new ConflictError('Jobber integration already connected. Disconnect first to change credentials.');
  }

  const finalRedirectUri = redirectUri || getDefaultRedirectUri();

  const integration = existing
    ? await IntegrationModel.findByIdAndUpdate(
        existing._id,
        {
          status: IntegrationStatus.PENDING,
          credentials: { clientId, clientSecret, redirectUri: finalRedirectUri },
        },
        { new: true },
      )
    : await IntegrationModel.create({
        vendor: vendorId,
        provider: IntegrationProvider.JOBBER,
        status: IntegrationStatus.PENDING,
        credentials: { clientId, clientSecret, redirectUri: finalRedirectUri },
        createdBy,
      });

  if (!integration) {
    throw new NotFoundError('Failed to save Jobber credentials');
  }

  logger.info(`Jobber credentials saved for vendor ${vendorId}`);
  return toIntegrationResponse(integration);
};

const getDefaultRedirectUri = (): string => {
  const origin = Array.isArray(config.corsOrigin) ? config.corsOrigin[0] : config.corsOrigin;
  const port = config.port;
  return `${origin.replace(/:\d+$/, '')}:${port}/api/v1/integrations/jobber/callback`;
};
