import path from 'path';
import { createHash } from 'crypto';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { ResumeRepo } from '../repos/resume.repo';
import { uploadResumeBuffer } from '../config/cloudinary';
import { BadRequestError, NotFoundError } from '../error';

const MIN_TEXT_LENGTH = 30;

export class ResumeService {
  constructor(private resumeRepo: ResumeRepo) {}

  async createFromText(userId: string, plainText: string) {
    const text = plainText.trim();
    const existing = await this.findDuplicate(userId, text);
    if (existing) return existing;

    return this.resumeRepo.create({
      userId,
      source: 'PASTED',
      plainText: text,
      contentHash: this.hash(text),
      originalFileName: null,
      filePath: null,
    });
  }

  async createFromFile(userId: string, file: Express.Multer.File) {
    const text = (await this.extractText(file)).trim();
    if (text.length < MIN_TEXT_LENGTH) {
      throw new BadRequestError(
        "We couldn't read any text from this file. If it's a scanned document or an image saved as a PDF, it has no selectable text to extract. Please upload a text-based PDF or DOCX."
      );
    }

    const existing = await this.findDuplicate(userId, text);
    if (existing) return existing;

    let filePath: string | null = null;
    try {
      const uploaded = await uploadResumeBuffer(file.buffer, file.originalname);
      filePath = uploaded.url;
    } catch (err) {
      console.warn(
        `[resume] Cloudinary upload failed for "${file.originalname}"; saving without stored file.`,
        err instanceof Error ? err.message : err
      );
    }
    return this.resumeRepo.create({
      userId,
      source: 'UPLOAD',
      plainText: text,
      contentHash: this.hash(text),
      originalFileName: file.originalname,
      filePath,
    });
  }

  // Extracts CV text from an uploaded file WITHOUT storing anything.
  // Used by the public (guest) preview flow.
  async extractPlainText(file: Express.Multer.File): Promise<string> {
    const text = (await this.extractText(file)).trim();
    if (text.length < MIN_TEXT_LENGTH) {
      throw new BadRequestError(
        "We couldn't read any text from this file. If it's a scanned document or an image saved as a PDF, it has no selectable text to extract. Please upload a text-based PDF or DOCX."
      );
    }
    return text;
  }

  listForUser(userId: string) {
    return this.resumeRepo.findByUser(userId);
  }

  async getForUser(id: string, userId: string) {
    const resume = await this.resumeRepo.findByIdForUser(id, userId);
    if (!resume) throw new NotFoundError('Resume not found');
    return resume;
  }

  private hash(text: string): string {
    const normalised = text.replace(/\s+/g, ' ').trim().toLowerCase();
    return createHash('sha256').update(normalised).digest('hex');
  }

  private findDuplicate(userId: string, text: string) {
    return this.resumeRepo.findByUserAndHash(userId, this.hash(text));
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = file.buffer; // memory storage → buffer is already in hand
    if (ext === '.pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    }
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    throw new BadRequestError('Unsupported file type. Upload a PDF or DOCX.');
  }
}
