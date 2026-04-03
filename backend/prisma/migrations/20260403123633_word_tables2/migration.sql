/*
  Warnings:

  - You are about to drop the column `fromWordId` on the `Translation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wordMeaningId,toWordId]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wordMeaningId` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_fromWordId_fkey";

-- DropIndex
DROP INDEX "Translation_fromWordId_toWordId_key";

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "fromWordId",
ADD COLUMN     "wordMeaningId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Translation_wordMeaningId_toWordId_key" ON "Translation"("wordMeaningId", "toWordId");

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_wordMeaningId_fkey" FOREIGN KEY ("wordMeaningId") REFERENCES "WordMeaning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
