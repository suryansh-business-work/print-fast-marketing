import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name max 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name max 50 characters'),
  role: z.enum([UserRole.ADMIN_USER, UserRole.VENDOR_USER], {
    errorMap: () => ({ message: 'Role must be admin_user or vendor_user' }),
  }),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name max 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name max 50 characters')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  role: z.enum([UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER]).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const bulkDeactivateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type BulkDeactivateInput = z.infer<typeof bulkDeactivateSchema>;
