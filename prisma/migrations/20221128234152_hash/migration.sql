/*
  Warnings:

  - Added the required column `hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hash" VARCHAR(255) NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
