import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {env} from "../config/env";
import {OAuth2Client} from "google-auth-library";
import { UserRepo } from "../repos/user.repo";
import type { Role } from "../generated/prisma/client";
import { ConflictError, BadRequestError, NotFoundError } from "../error";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID); 
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService{
   
    constructor(private userRepo: UserRepo){}
    
    async register(name:string, email:string, password:string){
        const existingUser = await this.userRepo.findByEmail(email);
        if(existingUser){
            throw new ConflictError('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userRepo.createLocalUser(name,email,hashedPassword);
        return {id: user.id, name: user.name, email: user.email, role: user.role};
    }

    async login(email:string, password:string){
        const user= await this.userRepo.findByEmail(email);
        if(!user || !user.password) throw new BadRequestError('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) throw new BadRequestError('Invalid credentials');
        return this.issueTokens(user.id, user.role);
    }

    async refresh(token:string){
        const stored = await this.userRepo.findRefreshToken(token);
        if(!stored || stored.revoked || stored.expiresAt < new Date()) {throw new NotFoundError('Invalid refresh token')};
        jwt.verify(token, env.JWT_REFRESH_TOKEN);
        await this.userRepo.revokeRefreshToken(token);      

        const user = await this.userRepo.findById(stored.userId);
        if (!user) throw new Error('User no longer exists');
        return this.issueTokens(user.id, user.role);
    }

    async googleSignIn(idToken: string) {
        const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.sub) throw new Error('Invalid Google token');

        const name = payload.name ?? payload.email.split('@')[0]; 
        let user = await this.userRepo.findByGoogleId(payload.sub);
        if (!user) {
        const existing = await this.userRepo.findByEmail(payload.email);
        user = existing
            ? await this.userRepo.linkByGoogleId(existing.id, payload.sub)
            : await this.userRepo.createGoogleUser(name, payload.email, payload.sub);
        }
        return this.issueTokens(user.id, user.role);
    }

    async logout(refreshToken: string){
        await this.userRepo.revokeRefreshToken(refreshToken);
    }


    private async issueTokens(userId: string, role: Role){
        const accessToken = jwt.sign({userId, role}, env.JWT_ACCESS_TOKEN, {expiresIn: '1h'});
        const refreshToken = jwt.sign({userId, role}, env.JWT_REFRESH_TOKEN, {expiresIn:'7d'});
        await this.userRepo.storeRefreshToken(refreshToken, userId,  new Date(Date.now() + REFRESH_TTL_MS));
        return {accessToken, refreshToken};
    }
}