import { z } from 'zod';

export const generateProposalSchema = z.object({
  resumeId: z.string().uuid('resumeId must be a valid id'),
  jobDescriptionId: z.string().uuid('jobDescriptionId must be a valid id'),
  // Optional: which template to use. Defaults to the active JOB_PROPOSAL template.
  templateId: z.string().uuid('templateId must be a valid id').optional(),
  // Optional: the user's answers to the template questions, keyed by field key.
  answers: z.record(z.string(), z.string()).optional(),
});

export type GenerateProposalInput = z.infer<typeof generateProposalSchema>;

// All-in-one endpoint: CV + job + answers in a single (multipart) request.
// The CV itself arrives either as an uploaded file or as resumeText.
export const generateAllSchema = z.object({
  resumeText: z.string().min(30, 'Pasted CV text is too short').optional(),
  jobTitle: z.string().min(2, 'Job title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  jobDescription: z.string().min(30, 'Job description is too short (min 30 characters)'),
  templateId: z.string().uuid('templateId must be a valid id').optional(),
});

export type GenerateAllInput = z.infer<typeof generateAllSchema>;
