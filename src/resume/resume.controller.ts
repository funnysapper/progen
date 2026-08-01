import { Request, Response } from 'express';
import { ResumeService } from './resume.service';
import { pasteResumeSchema } from '../dtos/resume.dto';
import { BadRequestError, UnAuthorizedError } from '../error';

export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  
  create = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnAuthorizedError();

    if (req.file) {
      const resume = await this.resumeService.createFromFile(userId, req.file);
      return res.status(201).json(resume);
    }

    const parsed = pasteResumeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(
        'Provide a resume file (PDF/DOCX) or paste resume text',
        parsed.error.flatten().fieldErrors
      );
    }
    const resume = await this.resumeService.createFromText(userId, parsed.data.plainText);
    return res.status(201).json(resume);
  };

  list = async (req: Request, res: Response) => {
    const resumes = await this.resumeService.listForUser(req.user!.userId);
    return res.json(resumes);
  };

  getOne = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const resume = await this.resumeService.getForUser(id, req.user!.userId);
    return res.json(resume);
  };
}
