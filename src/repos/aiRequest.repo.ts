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

  // Create the response if missing, or overwrite it (used when regenerating).
  upsertResponse(requestId: string, generatedText: string) {
    return prisma.aIResponse.upsert({
      where: { requestId },
      create: { requestId, generatedText },
      update: { generatedText, generatedAt: new Date() },
    });
  }

  // One proposal per (user + resume + job). Used to prevent duplicates and to
  // find the row to overwrite on regenerate.
  findByCombo(userId: string, resumeId: string, jobDescriptionId: string) {
    return prisma.aIRequest.findFirst({
      where: { userId, resumeId, jobDescriptionId },
      include: { aiResponse: true },
    });
  }

  updateInputs(id: string, inputs: Record<string, string>) {
    return prisma.aIRequest.update({ where: { id }, data: { inputs } });
  }

  // Owner-scoped delete. Removes the response first (FK), then the request.
  async deleteForUser(id: string, userId: string) {
    const existing = await prisma.aIRequest.findFirst({ where: { id, userId } });
    if (!existing) return null;
    await prisma.$transaction([
      prisma.aIResponse.deleteMany({ where: { requestId: id } }),
      prisma.aIRequest.delete({ where: { id } }),
    ]);
    return existing;
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
      include: { aiResponse: true, jobDescription: true },
    });
  }
}
