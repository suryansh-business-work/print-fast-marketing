import { z } from 'zod';

export const invoicesListQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
});

export const vendorIdParamSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
});

export type InvoicesListQuery = z.infer<typeof invoicesListQuerySchema>;
