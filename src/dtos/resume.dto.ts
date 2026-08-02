import { z } from 'zod';


export const pasteResumeSchema = z.object({
  plainText: z.string().min(30, 'Resume text is too short (min 30 characters)'),
});

export type PasteResumeInput = z.infer<typeof pasteResumeSchema>;
