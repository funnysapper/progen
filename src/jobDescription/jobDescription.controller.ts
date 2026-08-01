import { Request, Response } from 'express';
import { JobDescriptionService } from './jobDescription.service';
import { createJobDescriptionSchema } from '../dtos/jobDescription.dto';
import { BadRequestError } from '../error';

export class JobDescriptionController {
  constructor(private service: JobDescriptionService) {}

  create = async (req: Request, res: Response) => {
    const parsed = createJobDescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError('Validation failed', parsed.error.flatten().fieldErrors);
    }
    const jd = await this.service.create(req.user!.userId, parsed.data);
    return res.status(201).json(jd);
  };

  list = async (req: Request, res: Response) => {
    const items = await this.service.listForUser(req.user!.userId);
    return res.json(items);
  };

  getOne = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const jd = await this.service.getForUser(id, req.user!.userId);
    return res.json(jd);
  };
}
