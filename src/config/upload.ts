import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../error';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.heic'];

// Memory storage: we get the file as a Buffer, extract its text, and stream it
// straight to Cloudinary — nothing is written to local disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    // Give a specific hint for the most common mistake — uploading an image.
    if (IMAGE_EXTENSIONS.includes(ext)) {
      return cb(
        new BadRequestError(
          'Images cannot be read as resumes because they contain no selectable text. Please upload a text-based PDF or DOCX file.'
        )
      );
    }
    return cb(
      new BadRequestError(
        `Unsupported file type "${ext || 'unknown'}". Please upload a PDF or DOCX resume.`
      )
    );
  },
});
