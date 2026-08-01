import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/upload';
import { ResumeRepo } from '../repos/resume.repo';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';

const controller = new ResumeController(new ResumeService(new ResumeRepo()));
const resumeRouter = Router();


resumeRouter.use(authenticate);

resumeRouter.post('/', upload.single('file'), controller.create);
resumeRouter.get('/', controller.list);
resumeRouter.get('/:id', controller.getOne);

export default resumeRouter;
