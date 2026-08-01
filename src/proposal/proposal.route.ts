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

proposalRouter.use(authenticate);

// All-in-one form flow (CV file optional + job + answers in one request).
proposalRouter.post('/generate', upload.single('file'), controller.generateAll);

// Granular flow (caller already has stored resume + job ids).
proposalRouter.post('/', controller.create);
proposalRouter.get('/', controller.list);
proposalRouter.get('/:id/pdf', controller.downloadPdf);
proposalRouter.get('/:id', controller.getOne);

export default proposalRouter;
