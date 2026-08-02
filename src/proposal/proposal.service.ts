import { ai } from '../config/ai';
import { env } from '../config/env';
import { ResumeRepo } from '../repos/resume.repo';
import { JobDescriptionRepo } from '../repos/jobDescription.repo';
import { PromptTemplateRepo } from '../repos/promptTemplate.repo';
import { AIRequestRepo } from '../repos/aiRequest.repo';
import { UserRepo } from '../repos/user.repo';
import type { TemplateField } from '../template/template.service';
import { BadRequestError, NotFoundError, AppError } from '../error';

const MAX_IN_FLIGHT = 3;

export class ProposalService {
  constructor(
    private resumeRepo: ResumeRepo,
    private jobDescriptionRepo: JobDescriptionRepo,
    private promptTemplateRepo: PromptTemplateRepo,
    private aiRequestRepo: AIRequestRepo,
    private userRepo: UserRepo
  ) {}

  async generate(
    userId: string,
    resumeId: string,
    jobDescriptionId: string,
    options: { templateId?: string; answers?: Record<string, string> } = {}
  ) {
    // 1. Concurrency guard.
    const inFlight = await this.aiRequestRepo.countInFlight(userId);
    if (inFlight >= MAX_IN_FLIGHT) {
      throw new BadRequestError('You already have generations in progress. Please wait for them to finish.');
    }

    const [resume, jobDescription, user] = await Promise.all([
      this.resumeRepo.findByIdForUser(resumeId, userId),
      this.jobDescriptionRepo.findByIdForUser(jobDescriptionId, userId),
      this.userRepo.findById(userId),
    ]);
    if (!resume) throw new NotFoundError('Resume not found');
    if (!jobDescription) throw new NotFoundError('Job description not found');

   
    const template = options.templateId
      ? await this.promptTemplateRepo.findActiveById(options.templateId)
      : await this.promptTemplateRepo.findActiveByType('JOB_PROPOSAL');
    if (!template) {
      throw options.templateId
        ? new NotFoundError('Template not found')
        : new AppError(500, 'No active prompt template configured. Run the seed script.');
    }

    const fields = (template.fields as unknown as TemplateField[]) ?? [];
    const answers = options.answers ?? {};
    const missing = fields
      .filter((f) => f.required && !answers[f.key]?.trim())
      .map((f) => f.label);
    if (missing.length) {
      throw new BadRequestError(`Please answer the required questions: ${missing.join(', ')}`);
    }

    const request = await this.aiRequestRepo.create({
      userId,
      resumeId,
      jobDescriptionId,
      templateId: template.id,
      inputs: answers,
    });

    try {
      await this.aiRequestRepo.updateStatus(request.id, 'PROCESSING');

      const prompt = this.buildPrompt(template.templateText, {
        candidateName: user?.name ?? 'The candidate',
        resumeText: resume.plainText,
        jobTitle: jobDescription.title,
        companyName: jobDescription.company,
        jobDescription: jobDescription.description,
        additionalInfo: this.formatAnswers(fields, answers),
      });

      const completion = await ai.chat.completions.create({
        model: env.AI_MODEL,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const generatedText = completion.choices[0]?.message?.content?.trim();
      if (!generatedText) {
        throw new Error('The AI returned an empty response');
      }

      const response = await this.aiRequestRepo.createResponse(request.id, generatedText);
      await this.aiRequestRepo.updateStatus(request.id, 'SUCCESS');

      return {
        requestId: request.id,
        status: 'SUCCESS' as const,
        proposal: generatedText,
        responseId: response.id,
      };
    } catch (err) {
      await this.aiRequestRepo.updateStatus(request.id, 'FAILED');
      const message = err instanceof Error ? err.message : 'AI generation failed';
      console.error(`[proposal] generation failed for request ${request.id}:`, message);
      throw new AppError(502, `Proposal generation failed: ${message}`);
    }
  }

  listForUser(userId: string) {
    return this.aiRequestRepo.listForUser(userId);
  }

  async getForUser(id: string, userId: string) {
    const request = await this.aiRequestRepo.findByIdForUser(id, userId);
    if (!request) throw new NotFoundError('Proposal request not found');
    return request;
  }

  // Replaces {{placeholders}} in the template with the user's real data.
  private buildPrompt(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => values[key] ?? '');
  }

  // Turns the answered questions into a readable block for the prompt. Only
  // answered fields are included, so the model never sees blanks to fill in.
  private formatAnswers(fields: TemplateField[], answers: Record<string, string>): string {
    const lines = fields
      .filter((f) => answers[f.key]?.trim())
      .map((f) => `- ${f.label} ${answers[f.key].trim()}`);
    return lines.length ? lines.join('\n') : 'None provided.';
  }
}
