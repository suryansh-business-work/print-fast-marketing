export enum IntegrationProvider {
  SERVICE_TITAN = 'service_titan',
  JOBBER = 'jobber',
  SERVICE_WARE = 'service_ware',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}

export interface IIntegration {
  integrationId: string;
  vendorId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  environment?: string;
  connectedAt: string | null;
  lastSyncAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConnectServiceTitanPayload {
  vendorId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  environment: 'production' | 'integration';
}

export interface IConnectJobberPayload {
  vendorId: string;
  code: string;
}

export interface ISaveJobberCredentialsPayload {
  vendorId: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface IDisconnectIntegrationPayload {
  vendorId: string;
  provider: IntegrationProvider;
}

export interface IUpdateIntegrationSettingsPayload {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  environment?: 'production' | 'integration';
}

export interface ISyncResult {
  jobs: number;
  invoices: number;
}

export interface IJobberOAuthUrlResponse {
  url: string;
}
