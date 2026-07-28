import express from 'express';
import {errorHandler} from './middleware/errorhandler';
import authRouter from './auth/auth.route';
import morgan from "morgan";
const app = express();
app.use(express.json());
app.use(morgan("dev"));           // log every request — placed BEFORE routes so it sees them all
app.get('/health', (_req,res)=> {
    res.json({status: 'ok'});
})

app.use("/api/auth", authRouter); // leading slash is required
app.use(errorHandler)             // must stay last
export default app;


