/*
  Warnings:

  - A unique constraint covering the columns `[keyHash]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyHash` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "keyHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_keyHash_key" ON "Project"("keyHash");
