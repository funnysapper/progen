import {Request, Response} from 'express';
import {AuthService} from './auth.service';
import {loginSchema, registerSchema, googleSchema, refreshTokenSchema} from '../dtos/auth.dto';
import { BadRequestError } from '../error';

export class AuthController{
  
   constructor(private authService:AuthService){}

      register = async(req: Request, res:Response) =>{
        const parsed = registerSchema.safeParse(req.body);
        if(!parsed.success){
          throw new BadRequestError("Validation failed", parsed.error.flatten().fieldErrors);
        }
          const user = await this.authService.register(parsed.data.name, parsed.data.email, parsed.data.password);
          return res.status(200).json(user);
      }

      login = async (req:Request, res:Response) => {
        const parsed = loginSchema.safeParse(req.body);
        if(!parsed.success){
          throw new BadRequestError("Invalid Credentials",parsed.error.flatten().fieldErrors);
        }
          const tokens = await this.authService.login(parsed.data.email, parsed.data.password);
          return res.status(200).json({tokens});
      }

      google = async (req:Request, res:Response) => {
        const parsed = googleSchema.safeParse(req.body);
        if(!parsed.success){
          throw new BadRequestError("Invalid credentials",parsed.error.flatten().fieldErrors);
        }
          const user = await this.authService.googleSignIn(parsed.data.idToken);
          return res.status(200).json(user);
      }

      logout = async (req:Request, res:Response) => {
        const parsed = refreshTokenSchema.safeParse(req.body);
        if(!parsed.success){
          throw new BadRequestError("Refresh token needed",parsed.error.flatten().fieldErrors);
        }
          const logout = await this.authService.logout(parsed.data.refreshToken);
          return res.status(200).json(logout);
      }

      me = async (req:Request, res:Response) => {
        const profile = await this.authService.getProfile(req.user!.userId);
        return res.status(200).json(profile);
      }

      refresh = async(req:Request,res:Response)=>{
        const parsed = refreshTokenSchema.safeParse(req.body);
        if(!parsed.success){
          throw new BadRequestError("Invalid refresh token", parsed.error.flatten().fieldErrors);
        }
          const newRefreshToken = await this.authService.refresh(parsed.data.refreshToken);
          return res.status(200).json(newRefreshToken);
      }
}