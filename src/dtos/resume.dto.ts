import { z } from 'zod';


// Paste path: the user provides only the CV text. No file name / path exist.
export const pasteResumeSchema = z.object({
  plainText: z.string().min(30, 'Resume text is too short (min 30 characters)'),
});

export type PasteResumeInput = z.infer<typeof pasteResumeSchema>;
