/*
  Warnings:

  - You are about to alter the column `savedPercent` on the `Solution` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Solution" ALTER COLUMN "savedPercent" SET DATA TYPE INTEGER;
