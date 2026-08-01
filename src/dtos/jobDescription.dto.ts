import { z } from 'zod';

export const createJobDescriptionSchema = z.object({
  title: z.string().min(2, 'Title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  description: z.string().min(30, 'Job description is too short (min 30 characters)'),
});

export type CreateJobDescriptionInput = z.infer<typeof createJobDescriptionSchema>;
