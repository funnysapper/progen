import {Request, Response, NextFunction} from 'express';
import {AppError} from '../error';

export function errorHandler(err:Error, req:Request, res:Response, next: NextFunction){
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? {details: err.details}:{})
        })
    }
    console.error(`[${req.method} ${req.path}]`, err);
    return  res.status(500).json({error:"Internal Server Error!"});

}