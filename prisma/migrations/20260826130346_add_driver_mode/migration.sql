/*
  Warnings:

  - You are about to drop the column `breakAfterMinutes` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `breakDurationMinutes` on the `Route` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DriverMode" AS ENUM ('TRUCK', 'COURIER', 'NONE');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "breakAfterMinutes",
DROP COLUMN "breakDurationMinutes",
ADD COLUMN     "courierBreakAfterMinutes" INTEGER,
ADD COLUMN     "courierBreakDurationMinutes" INTEGER,
ADD COLUMN     "driverMode" "DriverMode" NOT NULL DEFAULT 'TRUCK';
