import {Router} from 'express';
import {UserRepo} from '../repos/user.repo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';


const userRepo = new UserRepo();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);
const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/googleSignUp', authController.google);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

export default authRouter;