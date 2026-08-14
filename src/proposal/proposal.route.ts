import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/upload';
import { ResumeRepo } from '../repos/resume.repo';
import { JobDescriptionRepo } from '../repos/jobDescription.repo';
import { PromptTemplateRepo } from '../repos/promptTemplate.repo';
import { AIRequestRepo } from '../repos/aiRequest.repo';
import { UserRepo } from '../repos/user.repo';
import { ResumeService } from '../resume/resume.service';
import { JobDescriptionService } from '../jobDescription/jobDescription.service';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';

const proposalService = new ProposalService(
  new ResumeRepo(),
  new JobDescriptionRepo(),
  new PromptTemplateRepo(),
  new AIRequestRepo(),
  new UserRepo()
);
const controller = new ProposalController(
  proposalService,
  new ResumeService(new ResumeRepo()),
  new JobDescriptionService(new JobDescriptionRepo())
);
const proposalRouter = Router();

// Public — guests can generate a one-time proposal without an account.
proposalRouter.post('/preview', upload.single('file'), controller.preview);

// Everything below requires a signed-in user.
proposalRouter.use(authenticate);

proposalRouter.post('/generate', upload.single('file'), controller.generateAll);
proposalRouter.post('/persist', upload.single('file'), controller.persist);
proposalRouter.post('/', controller.create);
proposalRouter.get('/', controller.list);
proposalRouter.get('/:id/pdf', controller.downloadPdf);
proposalRouter.get('/:id', controller.getOne);
proposalRouter.delete('/:id', controller.remove);

export default proposalRouter;
