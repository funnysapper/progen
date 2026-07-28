import type { Role } from '../generated/prisma/client';

// Augments Express' Request so `req.user` is available (and typed) on
// routes that run behind the `authenticate` middleware.
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: Role };
    }
  }
}

export {};
