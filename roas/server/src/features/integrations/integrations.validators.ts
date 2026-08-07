import { z } from 'zod';

export const connectServiceTitanSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  environment: z.enum(['production', 'integration'], {
    required_error: 'Environment is required',
  }),
});

export const connectJobberSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  code: z.string().min(1, 'OAuth code is required'),
});

export const saveJobberCredentialsSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  redirectUri: z.string().url('Must be a valid URL').optional(),
});

export const disconnectIntegrationSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  provider: z.enum(['service_titan', 'jobber', 'service_ware'], {
    required_error: 'Provider is required',
  }),
});

export const vendorIntegrationsParamSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

export const integrationIdParamSchema = z.object({
  integrationId: z.string().min(1, 'Integration ID is required'),
});

export const updateSettingsSchema = z.object({
  tenantId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  clientSecret: z.string().min(1).optional(),
  environment: z.enum(['production', 'integration']).optional(),
});

export const jobberCallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

export type ConnectServiceTitanInput = z.infer<typeof connectServiceTitanSchema>;
export type ConnectJobberInput = z.infer<typeof connectJobberSchema>;
export type SaveJobberCredentialsInput = z.infer<typeof saveJobberCredentialsSchema>;
export type DisconnectIntegrationInput = z.infer<typeof disconnectIntegrationSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type JobberCallbackQuery = z.infer<typeof jobberCallbackQuerySchema>;
