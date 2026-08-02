import { Request, Response } from 'express';
import { ProposalService } from './proposal.service';
import { ResumeService } from '../resume/resume.service';
import { JobDescriptionService } from '../jobDescription/jobDescription.service';
import { streamProposalPdf } from './pdf';
import { generateProposalSchema, generateAllSchema } from '../dtos/proposal.dto';
import { BadRequestError } from '../error';

export class ProposalController {
  constructor(
    private service: ProposalService,
    private resumeService: ResumeService,
    private jobDescriptionService: JobDescriptionService
  ) {}

  create = async (req: Request, res: Response) => {
    const parsed = generateProposalSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const result = await this.service.generate(
      req.user!.userId,
      parsed.data.resumeId,
      parsed.data.jobDescriptionId,
      { templateId: parsed.data.templateId, answers: parsed.data.answers }
    );
    return res.status(201).json(result);
  };

  generateAll = async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const answers = this.parseAnswers(req.body.answers);

    const parsed = generateAllSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError('Validation failed', parsed.error.flatten().fieldErrors);
    }

    let resumeId: string;
    if (req.file) {
      const resume = await this.resumeService.createFromFile(userId, req.file);
      resumeId = resume.id;
    } else if (parsed.data.resumeText) {
      const resume = await this.resumeService.createFromText(userId, parsed.data.resumeText);
      resumeId = resume.id;
    } else {
      throw new BadRequestError('Please provide your CV — upload a file or paste the text.');
    }

    const job = await this.jobDescriptionService.create(userId, {
      title: parsed.data.jobTitle,
      company: parsed.data.company,
      description: parsed.data.jobDescription,
    });

    const result = await this.service.generate(userId, resumeId, job.id, {
      templateId: parsed.data.templateId,
      answers,
    });
    return res.status(201).json(result);
  };

  list = async (req: Request, res: Response) => {
    const items = await this.service.listForUser(req.user!.userId);
    return res.json(items);
  };

  getOne = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const request = await this.service.getForUser(id, req.user!.userId);
    return res.json(request);
  };

  downloadPdf = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const request = await this.service.getForUser(id, req.user!.userId);
    if (request.status !== 'SUCCESS' || !request.aiResponse) {
      throw new BadRequestError('This proposal has not been generated yet, so there is nothing to download.');
    }

    const title = request.jobDescription
      ? `Job Proposal — ${request.jobDescription.title} at ${request.jobDescription.company}`
      : 'Job Proposal';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${id}.pdf"`);
    streamProposalPdf(res, { title, markdown: request.aiResponse.generatedText });
  };

  private parseAnswers(raw: unknown): Record<string, string> {
    if (typeof raw !== 'string' || !raw.trim()) return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
      throw new Error();
    } catch {
      throw new BadRequestError('answers must be a JSON object, e.g. {"availability":"Immediately"}');
    }
  }
}
