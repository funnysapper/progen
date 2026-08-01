import prisma from '../config/prisma';
import type { PromptType } from '../generated/prisma/client';

export class PromptTemplateRepo {
  // Returns the highest-version active template for a given type, or null.
  findActiveByType(promptType: PromptType) {
    return prisma.promptTemplate.findFirst({
      where: { promptType, active: true },
      orderBy: { version: 'desc' },
    });
  }

  listActive() {
    return prisma.promptTemplate.findMany({
      where: { active: true },
      orderBy: { promptType: 'asc' },
    });
  }

  findActiveById(id: string) {
    return prisma.promptTemplate.findFirst({ where: { id, active: true } });
  }
}
