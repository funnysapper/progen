import prisma from '../config/prisma';

export class JobDescriptionRepo {
  create(data: { userId: string; title: string; company: string; description: string }) {
    return prisma.jobDescription.create({ data });
  }

  findByUser(userId: string) {
    return prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Scoped by userId so a user can only read their own job descriptions.
  findByIdForUser(id: string, userId: string) {
    return prisma.jobDescription.findFirst({ where: { id, userId } });
  }
}
