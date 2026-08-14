import { Router } from 'express';
import { PromptTemplateRepo } from '../repos/promptTemplate.repo';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

const controller = new TemplateController(new TemplateService(new PromptTemplateRepo()));
const templateRouter = Router();

// Public — templates only expose names and questions (never the prompt text),
// so guests can see them and use the generator without an account.
templateRouter.get('/', controller.list);
templateRouter.get('/:id', controller.getOne);

export default templateRouter;
