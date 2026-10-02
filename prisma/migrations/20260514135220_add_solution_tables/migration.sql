-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN', 'GUEST');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "status" "RouteStatus" NOT NULL DEFAULT 'DRAFT',
    "vehicleCount" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteConstraint" (
    "id" TEXT NOT NULL,
    "workStartMinutes" INTEGER NOT NULL,
    "workEndMinutes" INTEGER NOT NULL,
    "maxWorkDurationMinutes" INTEGER NOT NULL,
    "breakAfterMinutes" INTEGER,
    "breakDurationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "returnToDepot" BOOLEAN NOT NULL DEFAULT false,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "RouteConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Point" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" VARCHAR(255),
    "serviceTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "timeWindowStart" INTEGER,
    "timeWindowEnd" INTEGER,
    "isDepot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "feasible" BOOLEAN NOT NULL,
    "status" "SolutionStatus" NOT NULL DEFAULT 'PENDING',
    "travelTime" DOUBLE PRECISION NOT NULL,
    "workTimePenalty" DOUBLE PRECISION NOT NULL,
    "timeWindowPenalty" DOUBLE PRECISION NOT NULL,
    "returnToDepotPenalty" DOUBLE PRECISION NOT NULL,
    "priorityPenalty" DOUBLE PRECISION NOT NULL,
    "unassignedPointIds" TEXT[],
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleRoute" (
    "id" TEXT NOT NULL,
    "vehicleIndex" INTEGER NOT NULL,
    "totalServiceTime" DOUBLE PRECISION,
    "totalTravelTime" DOUBLE PRECISION,
    "feasible" BOOLEAN,
    "solutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "vehicleRouteId" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Route_userId_idx" ON "Route"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteConstraint_routeId_key" ON "RouteConstraint"("routeId");

-- CreateIndex
CREATE INDEX "Point_routeId_idx" ON "Point"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_routeId_key" ON "Solution"("routeId");

-- CreateIndex
CREATE INDEX "VehicleRoute_solutionId_idx" ON "VehicleRoute"("solutionId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_pointId_key" ON "RouteStop"("pointId");

-- CreateIndex
CREATE INDEX "RouteStop_vehicleRouteId_idx" ON "RouteStop"("vehicleRouteId");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteConstraint" ADD CONSTRAINT "RouteConstraint_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleRoute" ADD CONSTRAINT "VehicleRoute_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_vehicleRouteId_fkey" FOREIGN KEY ("vehicleRouteId") REFERENCES "VehicleRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "Point"("id") ON DELETE CASCADE ON UPDATE CASCADE;
