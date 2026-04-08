/*
  Warnings:

  - You are about to drop the column `wordMeaningId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the `WordMeaning` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[exampleSentenceId,toWordId]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exampleSentenceId` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_wordMeaningId_fkey";

-- DropForeignKey
ALTER TABLE "WordMeaning" DROP CONSTRAINT "WordMeaning_partOfSpeechId_fkey";

-- DropForeignKey
ALTER TABLE "WordMeaning" DROP CONSTRAINT "WordMeaning_wordId_fkey";

-- DropIndex
DROP INDEX "Translation_wordMeaningId_toWordId_key";

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "wordMeaningId",
ADD COLUMN     "exampleSentenceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "WordMeaning";

-- CreateTable
CREATE TABLE "ExampleSentence" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "partOfSpeechId" INTEGER NOT NULL,
    "exampleTarget" TEXT NOT NULL,
    "exampleBase" TEXT NOT NULL,

    CONSTRAINT "ExampleSentence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExampleSentence_wordId_idx" ON "ExampleSentence"("wordId");

-- CreateIndex
CREATE INDEX "ExampleSentence_partOfSpeechId_idx" ON "ExampleSentence"("partOfSpeechId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_exampleSentenceId_toWordId_key" ON "Translation"("exampleSentenceId", "toWordId");

-- AddForeignKey
ALTER TABLE "ExampleSentence" ADD CONSTRAINT "ExampleSentence_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleSentence" ADD CONSTRAINT "ExampleSentence_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_exampleSentenceId_fkey" FOREIGN KEY ("exampleSentenceId") REFERENCES "ExampleSentence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
