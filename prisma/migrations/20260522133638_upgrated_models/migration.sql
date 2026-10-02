/*
  Warnings:

  - You are about to drop the column `isDepot` on the `Point` table. All the data in the column will be lost.
  - You are about to drop the column `unassignedPointIds` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the `RouteConstraint` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[solutionId,vehicleIndex]` on the table `VehicleRoute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Point` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxWorkDurationMinutes` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workEndMinutes` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workStartMinutes` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Solution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RouteConstraint" DROP CONSTRAINT "RouteConstraint_routeId_fkey";

-- AlterTable
ALTER TABLE "Point" DROP COLUMN "isDepot",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "breakAfterMinutes" INTEGER,
ADD COLUMN     "breakDurationMinutes" INTEGER,
ADD COLUMN     "depotPointId" TEXT,
ADD COLUMN     "maxWorkDurationMinutes" INTEGER NOT NULL,
ADD COLUMN     "returnToDepot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workEndMinutes" INTEGER NOT NULL,
ADD COLUMN     "workStartMinutes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "unassignedPointIds",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "totalCost" SET DEFAULT 0,
ALTER COLUMN "travelTime" SET DEFAULT 0,
ALTER COLUMN "workTimePenalty" SET DEFAULT 0,
ALTER COLUMN "timeWindowPenalty" SET DEFAULT 0,
ALTER COLUMN "returnToDepotPenalty" SET DEFAULT 0,
ALTER COLUMN "priorityPenalty" SET DEFAULT 0;

-- DropTable
DROP TABLE "RouteConstraint";

-- CreateTable
CREATE TABLE "UnassignedPoint" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnassignedPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnassignedPoint_solutionId_idx" ON "UnassignedPoint"("solutionId");

-- CreateIndex
CREATE UNIQUE INDEX "UnassignedPoint_solutionId_pointId_key" ON "UnassignedPoint"("solutionId", "pointId");

-- CreateIndex
CREATE INDEX "Route_depotPointId_idx" ON "Route"("depotPointId");

-- CreateIndex
CREATE INDEX "RouteStop_pointId_idx" ON "RouteStop"("pointId");

-- CreateIndex
CREATE INDEX "Solution_routeId_createdAt_idx" ON "Solution"("routeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleRoute_solutionId_vehicleIndex_key" ON "VehicleRoute"("solutionId", "vehicleIndex");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_depotPointId_fkey" FOREIGN KEY ("depotPointId") REFERENCES "Point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnassignedPoint" ADD CONSTRAINT "UnassignedPoint_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnassignedPoint" ADD CONSTRAINT "UnassignedPoint_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;
