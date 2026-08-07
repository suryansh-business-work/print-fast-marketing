import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200, 'Name max 200 characters'),
  email: z.string().email('Invalid email address'),
  label: z.string().max(100, 'Label max 100 characters').optional().default(''),
  category: z.string().max(100, 'Category max 100 characters').optional().default(''),
  tag: z.string().max(100, 'Tag max 100 characters').optional().default(''),
  vendor: z.string().min(1, 'Vendor is required'),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('Invalid email address').optional(),
  label: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  tag: z.string().max(100).optional(),
});

export const listClientsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  vendor: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  label: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
});

export const clientIdParamSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
});

export const bulkDeactivateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type BulkDeactivateInput = z.infer<typeof bulkDeactivateSchema>;
