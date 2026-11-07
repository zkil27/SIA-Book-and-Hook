-- Saved delivery details on the account. Nullable: a new customer has none
-- until their first checkout, and staff accounts never need them.
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "barangay" TEXT;

-- Backfill each customer from their most recent order. Orders are only read;
-- their delivery snapshots stay as they are.
UPDATE "User" AS u
SET "phone" = latest."deliveryPhone",
    "address" = latest."deliveryAddress",
    "barangay" = latest."deliveryBarangay"
FROM (
  SELECT DISTINCT ON ("customerId")
    "customerId", "deliveryPhone", "deliveryAddress", "deliveryBarangay"
  FROM "Order"
  ORDER BY "customerId", "createdAt" DESC
) AS latest
WHERE latest."customerId" = u."id";
