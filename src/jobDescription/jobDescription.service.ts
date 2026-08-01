import { JobDescriptionRepo } from '../repos/jobDescription.repo';
import { NotFoundError } from '../error';
import type { CreateJobDescriptionInput } from '../dtos/jobDescription.dto';

export class JobDescriptionService {
  constructor(private repo: JobDescriptionRepo) {}

  create(userId: string, input: CreateJobDescriptionInput) {
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
