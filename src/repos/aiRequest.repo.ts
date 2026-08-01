import prisma from '../config/prisma';
import type { Status } from '../generated/prisma/client';

export class AIRequestRepo {
  create(data: {
    userId: string;
    resumeId: string;
    jobDescriptionId: string;
    templateId: string;
    inputs?: Record<string, string>;
  }) {
    return prisma.aIRequest.create({ data });
  }

  updateStatus(id: string, status: Status) {
    return prisma.aIRequest.update({ where: { id }, data: { status } });
  }

  createResponse(requestId: string, generatedText: string) {
    return prisma.aIResponse.create({ data: { requestId, generatedText } });
  }

  // Per-user concurrency guard: how many of their requests are still running.
  countInFlight(userId: string) {
    return prisma.aIRequest.count({
      where: { userId, status: { in: ['PENDING', 'PROCESSING'] } },
    });
  }

  findByIdForUser(id: string, userId: string) {
    return prisma.aIRequest.findFirst({
      where: { id, userId },
      include: { aiResponse: true, jobDescription: true },
    });
  }

  listForUser(userId: string) {
    return prisma.aIRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { aiResponse: true },
    });
  }
}
