-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'VEHICLE_RECEIVED', 'SERVICE_IN_PROGRESS', 'SERVICE_COMPLETED', 'FINAL_TOUCHUP_DONE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WASH_ONLY', 'OIL_CHANGE_SERVICE', 'FULL_SYSTEM_CLEANUP');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "odometerKm" INTEGER NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_referenceCode_key" ON "Booking"("referenceCode");
