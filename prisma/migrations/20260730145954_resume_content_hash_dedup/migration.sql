-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "contentHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_contentHash_key" ON "Resume"("userId", "contentHash");
