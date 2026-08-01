import express from 'express';
import {errorHandler} from './middleware/errorhandler';
import authRouter from './auth/auth.route';
import resumeRouter from './resume/resume.route';
import jobDescriptionRouter from './jobDescription/jobDescription.route';
import proposalRouter from './proposal/proposal.route';
import templateRouter from './template/template.route';
import morgan from "morgan";
const app = express();
app.use(express.json());
app.use(morgan("dev"));           
app.get('/health', (_req,res)=> {
    res.json({status: 'ok'});
})

app.use("/api/auth", authRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/job-descriptions", jobDescriptionRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/templates", templateRouter);
app.use(errorHandler)
export default app;


