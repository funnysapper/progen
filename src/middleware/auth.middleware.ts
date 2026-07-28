import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnAuthorizedError, ForbiddenError } from '../error';
import type { Role } from '../generated/prisma/client';

interface AccessTokenPayload {
  userId: string;
  role: Role;
}

// Verifies the Bearer access token and attaches { userId, role } to req.user.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnAuthorizedError('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_TOKEN) as AccessTokenPayload;
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw new UnAuthorizedError('Invalid or expired access token');
  }
}

// Route guard for admin-only endpoints (e.g. managing prompt templates).
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnAuthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError();
    next();
  };
}
