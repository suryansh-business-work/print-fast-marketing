import api from './api';
import { IApiResponse } from '../types/user.types';
import {
  IIntegration,
  IConnectServiceTitanPayload,
  IConnectJobberPayload,
  IDisconnectIntegrationPayload,
  IUpdateIntegrationSettingsPayload,
  ISyncResult,
  IJobberOAuthUrlResponse,
  ISaveJobberCredentialsPayload,
} from '../types/integration.types';

export const getVendorIntegrations = async (
  vendorId: string,
): Promise<IApiResponse<IIntegration[]>> => {
  const response = await api.get<IApiResponse<IIntegration[]>>(`/integrations/vendor/${vendorId}`);
  return response.data;
};

export const connectServiceTitan = async (
  payload: IConnectServiceTitanPayload,
): Promise<IApiResponse<IIntegration>> => {
  const response = await api.post<IApiResponse<IIntegration>>(
    '/integrations/service-titan/connect',
    payload,
  );
  return response.data;
};

export const connectJobber = async (
  payload: IConnectJobberPayload,
): Promise<IApiResponse<IIntegration>> => {
  const response = await api.post<IApiResponse<IIntegration>>(
    '/integrations/jobber/connect',
    payload,
  );
  return response.data;
};

export const disconnectIntegration = async (
  payload: IDisconnectIntegrationPayload,
): Promise<IApiResponse<IIntegration>> => {
  const response = await api.post<IApiResponse<IIntegration>>('/integrations/disconnect', payload);
  return response.data;
};

export const updateIntegrationSettings = async (
  integrationId: string,
  payload: IUpdateIntegrationSettingsPayload,
): Promise<IApiResponse<IIntegration>> => {
  const response = await api.patch<IApiResponse<IIntegration>>(
    `/integrations/settings/${integrationId}`,
    payload,
  );
  return response.data;
};

export const triggerSync = async (
  integrationId: string,
): Promise<IApiResponse<ISyncResult>> => {
  const response = await api.post<IApiResponse<ISyncResult>>(
    `/integrations/${integrationId}/sync`,
  );
  return response.data;
};

export const getJobberOAuthUrl = async (
  vendorId: string,
): Promise<IApiResponse<IJobberOAuthUrlResponse>> => {
  const response = await api.get<IApiResponse<IJobberOAuthUrlResponse>>(
    `/integrations/jobber/oauth-url/${vendorId}`,
  );
  return response.data;
};

export const saveJobberCredentials = async (
  payload: ISaveJobberCredentialsPayload,
): Promise<IApiResponse<IIntegration>> => {
  const response = await api.post<IApiResponse<IIntegration>>(
    '/integrations/jobber/credentials',
    payload,
  );
  return response.data;
};
