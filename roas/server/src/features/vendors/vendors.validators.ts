import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name max 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone max 20 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address max 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City max 100 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State max 50 characters'),
  zipCode: z.string().min(1, 'Zip code is required').max(10, 'Zip code max 10 characters'),
  contactPerson: z
    .string()
    .min(1, 'Contact person is required')
    .max(100, 'Contact person max 100 characters'),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  zipCode: z.string().min(1).max(10).optional(),
  contactPerson: z.string().min(1).max(100).optional(),
});

export const listVendorsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const vendorIdParamSchema = z.object({
  id: z.string().min(1, 'Vendor ID is required'),
});

export const bulkDeactivateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type BulkDeactivateInput = z.infer<typeof bulkDeactivateSchema>;
