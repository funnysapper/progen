import {Request, Response, NextFunction} from 'express';
import {MulterError} from 'multer';
import {AppError} from '../error';

export function errorHandler(err:Error, req:Request, res:Response, next: NextFunction){
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? {details: err.details}:{})
        })
    }
    // Bad multipart upload (wrong/missing field name, file too large, etc.) is a
    // client error, not a server fault — surface it as 400 with a plain message.
    if(err instanceof MulterError){
        return res.status(400).json({
            error: multerMessage(err),
            details: {code: err.code, field: err.field ?? null},
        })
    }
    console.error(`[${req.method} ${req.path}]`, err);
    return  res.status(500).json({error:"Internal Server Error!"});

}

// Translates Multer's terse error codes into messages a frontend can show as-is.
function multerMessage(err: MulterError): string {
    switch (err.code) {
        case 'LIMIT_UNEXPECTED_FILE':
            return "Please upload exactly one file using the field name 'file'. This error means either you sent more than one file, or the field name is misspelled or has extra spaces.";
        case 'LIMIT_FILE_SIZE':
            return 'That file is too large. The maximum resume size is 5 MB.';
        case 'LIMIT_FILE_COUNT':
            return 'Too many files. Please upload only one file per request.';
        default:
            return `Upload error: ${err.message}`;
    }
}