import express from 'express';
import cors from 'cors';
import {errorHandler} from './middleware/errorhandler';
import authRouter from './auth/auth.route';
import resumeRouter from './resume/resume.route';
import jobDescriptionRouter from './jobDescription/jobDescription.route';
import proposalRouter from './proposal/proposal.route';
import templateRouter from './template/template.route';
import morgan from "morgan";
const app = express();

// Origins allowed to call the API from a browser. Defaults to the deployed
// frontend; override/extend with a comma-separated CORS_ORIGIN env var. Any
// localhost port is always allowed so local development works.
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'https://progen-one.vercel.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));           
app.get('/', (_req,res)=> {
    res.json({status: 'ok'});
})

app.use("/api/auth", authRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/job-descriptions", jobDescriptionRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/templates", templateRouter);
app.use(errorHandler)
export default app;


