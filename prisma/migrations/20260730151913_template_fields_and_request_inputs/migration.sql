-- AlterTable
ALTER TABLE "AIRequest" ADD COLUMN     "inputs" JSONB;

-- AlterTable
ALTER TABLE "PromptTemplate" ADD COLUMN     "fields" JSONB;
