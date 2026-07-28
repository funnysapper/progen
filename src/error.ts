export class AppError extends Error{
   constructor(public statusCode:number, message: string, public details?: unknown){
      super(message);
      this.name = this.constructor.name;
   }
}

export class BadRequestError extends AppError{
    constructor(message:string, details?:unknown){super(400, message, details);} 
}
export class UnAuthorizedError extends AppError{
    constructor(message="UnAuthorzed"){super(401,message);}
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") { super(403, message); }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") { super(404, message); }
}
export class ConflictError extends AppError {
  constructor(message:string) { super(409, message); }
}



