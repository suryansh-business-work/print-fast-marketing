import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Name max 200 characters'),
  description: z.string().max(2000, 'Description max 2000 characters').optional().default(''),
  images: z.array(z.string().url('Invalid image URL')).optional().default([]),
  vendor: z.string().min(1, 'Vendor is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  vendor: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
});

export const bulkDeactivateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type BulkDeactivateInput = z.infer<typeof bulkDeactivateSchema>;
