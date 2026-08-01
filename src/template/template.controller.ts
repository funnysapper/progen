import { Request, Response } from 'express';
import { TemplateService } from './template.service';

export class TemplateController {
  constructor(private service: TemplateService) {}

  list = async (_req: Request, res: Response) => {
    const templates = await this.service.listActive();
    return res.json(templates);
  };

  getOne = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const template = await this.service.getActive(id);
    return res.json(template);
  };
}
