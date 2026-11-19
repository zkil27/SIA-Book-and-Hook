-- Own-truck delivery: staff roles, a Packed step, delivery trips, the
-- customer's handoff PIN and slot dates. Nothing existing is rewritten except
-- the new deliveryDate backfill below; no order status or timeline row changes.

-- New staff roles.
ALTER TYPE "Role" ADD VALUE 'PACKER';
ALTER TYPE "Role" ADD VALUE 'DRIVER';

-- Packed sits between Confirmed and Ready (on the truck), in flow order.
ALTER TYPE "OrderStatus" ADD VALUE 'PACKED' BEFORE 'READY';

CREATE TYPE "TripStatus" AS ENUM ('PLANNED', 'OUT', 'RETURNED', 'REMITTED');

CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "tripNumber" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNED',
    "driverId" TEXT,
    "departedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "cashRemittedCentavos" INTEGER,
    "remitNote" TEXT,
    "remitConfirmedById" TEXT,
    "remittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Trip_tripNumber_key" ON "Trip"("tripNumber");
CREATE INDEX "Trip_date_slot_idx" ON "Trip"("date", "slot");
CREATE INDEX "Trip_driverId_date_idx" ON "Trip"("driverId", "date");
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_remitConfirmedById_fkey" FOREIGN KEY ("remitConfirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Order: delivery day, trip placement, loading tick, handoff PIN.
ALTER TABLE "Order" ADD COLUMN "deliveryDate" DATE;
ALTER TABLE "Order" ADD COLUMN "tripId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stopIndex" INTEGER;
ALTER TABLE "Order" ADD COLUMN "loadedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "handoffPin" TEXT;
ALTER TABLE "Order" ADD COLUMN "pinAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Order_deliveryDate_deliverySlot_status_idx" ON "Order"("deliveryDate", "deliverySlot", "status");
CREATE INDEX "Order_tripId_stopIndex_idx" ON "Order"("tripId", "stopIndex");

ALTER TABLE "Order" ADD CONSTRAINT "Order_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill the delivery day with the checkout rule (lib/time.ts
-- deliveryDateFor): ordered before 9 PM Manila → next day, otherwise the day
-- after; Sunday (store closed) moves to Monday. createdAt is stored as UTC.
UPDATE "Order"
SET "deliveryDate" = (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila')::date
  + CASE WHEN EXTRACT(HOUR FROM (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila')) >= 21 THEN 2 ELSE 1 END;
UPDATE "Order" SET "deliveryDate" = "deliveryDate" + 1 WHERE EXTRACT(DOW FROM "deliveryDate") = 0;

-- Existing orders have no PIN: drivers finish them with a logged reason.
