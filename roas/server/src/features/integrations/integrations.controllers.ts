import { Request, Response, NextFunction } from 'express';
import * as integrationsService from './integrations.services';
import { sendSuccess } from '../../utils/response';
import {
  ConnectServiceTitanInput,
  ConnectJobberInput,
  DisconnectIntegrationInput,
  UpdateSettingsInput,
  JobberCallbackQuery,
  SaveJobberCredentialsInput,
} from './integrations.validators';
import config from '../../config/config';

export const getVendorIntegrations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { vendorId } = req.params;
    const integrations = await integrationsService.getVendorIntegrations(vendorId as string);
    sendSuccess(res, integrations);
  } catch (error) {
    next(error);
  }
};

export const connectServiceTitan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as ConnectServiceTitanInput;
    const creatorId = req.user!.userId;

    const integration = await integrationsService.connectServiceTitan(
      data.vendorId,
      data.tenantId,
      data.clientId,
      data.clientSecret,
      data.environment,
      creatorId,
    );

    sendSuccess(res, integration, 'Service Titan connected successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const connectJobber = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as ConnectJobberInput;

    const integration = await integrationsService.connectJobber(
      data.vendorId,
      data.code,
    );

    sendSuccess(res, integration, 'Jobber connected successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const disconnectIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as DisconnectIntegrationInput;
    const integration = await integrationsService.disconnectIntegration(
      data.vendorId,
      data.provider,
    );

    sendSuccess(res, integration, 'Integration disconnected successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const integrationId = req.params.integrationId as string;
    const settings = req.body as UpdateSettingsInput;
    const userId = req.user!.userId;
    const userVendorId = req.user!.vendorId;

    const integration = await integrationsService.updateIntegrationSettings(
      integrationId,
      settings,
      userId,
      userVendorId,
    );

    sendSuccess(res, integration, 'Integration settings updated successfully');
  } catch (error) {
    next(error);
  }
};

export const triggerSync = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const integrationId = req.params.integrationId as string;
    const userVendorId = req.user!.vendorId;

    const result = await integrationsService.triggerSync(integrationId, userVendorId);

    sendSuccess(res, result, `Sync completed: ${result.jobs} jobs, ${result.invoices} invoices`);
  } catch (error) {
    next(error);
  }
};

export const jobberCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { code, state: vendorId } = req.query as unknown as JobberCallbackQuery;

    await integrationsService.handleJobberCallback(code, vendorId);

    // Redirect to frontend integrations page with success
    const frontendUrl = Array.isArray(config.corsOrigin)
      ? config.corsOrigin[0]
      : config.corsOrigin;
    res.redirect(`${frontendUrl}/integrations?jobber=connected`);
  } catch (error) {
    next(error);
  }
};

export const getJobberOAuthUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorId = req.params.vendorId as string;
    const url = await integrationsService.getJobberOAuthUrl(vendorId);
    sendSuccess(res, { url }, 'Jobber OAuth URL generated');
  } catch (error) {
    next(error);
  }
};

export const saveJobberCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = req.body as SaveJobberCredentialsInput;
    const creatorId = req.user!.userId;

    const integration = await integrationsService.saveJobberCredentials(
      data.vendorId,
      data.clientId,
      data.clientSecret,
      data.redirectUri,
      creatorId,
    );

    sendSuccess(res, integration, 'Jobber credentials saved successfully', 201);
  } catch (error) {
    next(error);
  }
};
