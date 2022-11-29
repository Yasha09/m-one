/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");
