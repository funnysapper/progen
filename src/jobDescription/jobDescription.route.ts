import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { JobDescriptionRepo } from '../repos/jobDescription.repo';
import { JobDescriptionService } from './jobDescription.service';
import { JobDescriptionController } from './jobDescription.controller';

const controller = new JobDescriptionController(
  new JobDescriptionService(new JobDescriptionRepo())
);
const jobDescriptionRouter = Router();

jobDescriptionRouter.use(authenticate);

jobDescriptionRouter.post('/', controller.create);
jobDescriptionRouter.get('/', controller.list);
jobDescriptionRouter.get('/:id', controller.getOne);

export default jobDescriptionRouter;
