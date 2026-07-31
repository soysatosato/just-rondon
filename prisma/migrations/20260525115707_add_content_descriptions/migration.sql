-- DropForeignKey
ALTER TABLE "ContentSection" DROP CONSTRAINT "ContentSection_contentId_fkey";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "description" TEXT,
ADD COLUMN     "description2" TEXT,
ADD COLUMN     "description3" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "summary" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ContentSection" ADD COLUMN     "description2" TEXT,
ADD COLUMN     "description3" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "ContentSection" ADD CONSTRAINT "ContentSection_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
