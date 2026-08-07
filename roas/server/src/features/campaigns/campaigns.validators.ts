import { z } from 'zod';

const PAYMENT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const createCampaignSchema = z.object({
  vendor: z.string().min(1, 'Vendor is required'),
  name: z.string().min(1, 'Campaign name is required').max(200, 'Name max 200 characters'),
  description: z.string().max(2000, 'Description max 2000 characters').optional().default(''),
  currentProduct: z
    .string()
    .min(1, 'Current product is required')
    .max(100, 'Current product max 100 characters'),
  totalMailingQuantity: z.number().int().min(1, 'Total mailing quantity must be at least 1'),
  totalWeeks: z.number().int().min(1, 'Must have at least 1 week').max(52, 'Max 52 weeks'),
  startDate: z.string().min(1, 'Start date is required'),
  paymentDay: z.enum(PAYMENT_DAYS, {
    errorMap: () => ({ message: 'Invalid payment day' }),
  }),
  nextScheduledProduct: z.string().max(100).optional().default(''),
  nextScheduledArtworkDueDate: z.string().optional(),
  address: z.string().min(1, 'Address is required').max(300, 'Address max 300 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City max 100 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State max 50 characters'),
  zipCode: z.string().min(1, 'Zip code is required').max(10, 'Zip code max 10 characters'),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  currentProduct: z.string().min(1).max(100).optional(),
  totalMailingQuantity: z.number().int().min(1).optional(),
  totalWeeks: z.number().int().min(1).max(52).optional(),
  startDate: z.string().optional(),
  paymentDay: z.enum(PAYMENT_DAYS).optional(),
  nextScheduledProduct: z.string().max(100).optional(),
  nextScheduledArtworkDueDate: z.string().optional(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  zipCode: z.string().min(1).max(10).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateCampaignWeekSchema = z.object({
  mailingQuantity: z.number().int().min(0).optional(),
  totalPayments: z.number().min(0).optional(),
  inHomesWeekOf: z.string().optional(),
  productService: z.string().nullable().optional(),
});

export const listCampaignsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  vendor: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().optional(),
  currentProduct: z.string().optional(),
  vendorName: z.string().optional(),
});

export const campaignIdParamSchema = z.object({
  id: z.string().min(1, 'Campaign ID is required'),
});

export const campaignWeekParamSchema = z.object({
  id: z.string().min(1, 'Campaign ID is required'),
  weekNumber: z.string().min(1, 'Week number is required'),
});

export const bulkDeactivateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type UpdateCampaignWeekInput = z.infer<typeof updateCampaignWeekSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type BulkDeactivateInput = z.infer<typeof bulkDeactivateSchema>;
