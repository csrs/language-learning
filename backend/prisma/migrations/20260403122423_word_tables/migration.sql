/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordMeaning" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "partOfSpeechId" INTEGER NOT NULL,
    "exampleTarget" TEXT NOT NULL,
    "exampleBase" TEXT NOT NULL,

    CONSTRAINT "WordMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "fromWordId" INTEGER NOT NULL,
    "toWordId" INTEGER NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartOfSpeech" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "value" VARCHAR(2) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_value_languageId_key" ON "Word"("value", "languageId");

-- CreateIndex
CREATE INDEX "WordMeaning_wordId_idx" ON "WordMeaning"("wordId");

-- CreateIndex
CREATE INDEX "WordMeaning_partOfSpeechId_idx" ON "WordMeaning"("partOfSpeechId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_fromWordId_toWordId_key" ON "Translation"("fromWordId", "toWordId");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_value_key" ON "PartOfSpeech"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Language_value_key" ON "Language"("value");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordMeaning" ADD CONSTRAINT "WordMeaning_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordMeaning" ADD CONSTRAINT "WordMeaning_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_fromWordId_fkey" FOREIGN KEY ("fromWordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_toWordId_fkey" FOREIGN KEY ("toWordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
