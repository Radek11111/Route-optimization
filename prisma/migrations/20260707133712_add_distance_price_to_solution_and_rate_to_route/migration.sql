/*
  Warnings:

  - A unique constraint covering the columns `[depotPointId]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "ratePerKm" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Solution" ADD COLUMN     "estimatedPrice" DOUBLE PRECISION,
ADD COLUMN     "totalDistanceKm" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Route_depotPointId_key" ON "Route"("depotPointId");
