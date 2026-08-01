-- CreateEnum
CREATE TYPE "ResumeSource" AS ENUM ('UPLOAD', 'PASTED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "source" "ResumeSource" NOT NULL DEFAULT 'UPLOAD',
ALTER COLUMN "originalFileName" DROP NOT NULL,
ALTER COLUMN "filePath" DROP NOT NULL;
