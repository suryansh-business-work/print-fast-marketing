import { z } from 'zod';

export const uploadFileQuerySchema = z.object({
  folder: z.enum(['postcards', 'profiles', 'products', 'general']).optional().default('general'),
});

export type UploadFileQuery = z.infer<typeof uploadFileQuerySchema>;
