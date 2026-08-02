import { PromptTemplateRepo } from '../repos/promptTemplate.repo';
import { NotFoundError } from '../error';
import type { PromptTemplate } from '../generated/prisma/client';

// The shape of a single question attached to a template. Shared with the
// proposal service, which uses it to read the user's answers.
export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  placeholder?: string;
}


function toPublicView(t: PromptTemplate) {
  return {
    id: t.id,
    name: t.name,
    promptType: t.promptType,
    version: t.version,
    fields: (t.fields as unknown as TemplateField[]) ?? [],
  };
}

export class TemplateService {
  constructor(private repo: PromptTemplateRepo) {}

  async listActive() {
    const templates = await this.repo.listActive();
    return templates.map(toPublicView);
  }

  async getActive(id: string) {
    const template = await this.repo.findActiveById(id);
    if (!template) throw new NotFoundError('Template not found');
    return toPublicView(template);
  }
}
