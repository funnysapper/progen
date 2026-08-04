import { JobDescriptionRepo } from '../repos/jobDescription.repo';
import { NotFoundError } from '../error';
import type { CreateJobDescriptionInput } from '../dtos/jobDescription.dto';

export class JobDescriptionService {
  constructor(private repo: JobDescriptionRepo) {}

  // De-duplicated: an identical posting (same title + company + description)
  // reuses the existing row so the same job maps to one JobDescription.
  async create(userId: string, input: CreateJobDescriptionInput) {
    const existing = await this.repo.findByContent(userId, input.title, input.company, input.description);
    if (existing) return existing;
    return this.repo.create({ userId, ...input });
  }

  listForUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async getForUser(id: string, userId: string) {
    const jd = await this.repo.findByIdForUser(id, userId);
    if (!jd) throw new NotFoundError('Job description not found');
    return jd;
  }
}
