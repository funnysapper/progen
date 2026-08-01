import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { PromptTemplateRepo } from '../repos/promptTemplate.repo';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

const controller = new TemplateController(new TemplateService(new PromptTemplateRepo()));
const templateRouter = Router();

templateRouter.use(authenticate);

templateRouter.get('/', controller.list);
templateRouter.get('/:id', controller.getOne);

export default templateRouter;
