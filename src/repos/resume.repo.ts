import prisma from '../config/prisma';
import type { ResumeSource } from '../generated/prisma/client';

export class ResumeRepo {
  create(data: {
    userId: string;
    source: ResumeSource;
    plainText: string;
    contentHash: string;
    originalFileName?: string | null;
    filePath?: string | null;
  }) {
    return prisma.resume.create({ data });
  }

  findByUser(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Scoped by userId so one user can never read another user's resume.
  findByIdForUser(id: string, userId: string) {
    return prisma.resume.findFirst({ where: { id, userId } });
  }

  // Used for de-duplication: same user + same CV fingerprint.
  findByUserAndHash(userId: string, contentHash: string) {
    return prisma.resume.findFirst({ where: { userId, contentHash } });
  }
}
