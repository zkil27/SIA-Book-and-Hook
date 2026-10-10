-- Storefront + admin overhaul (2026-10-10).
-- Adds: product images, variant soft-delete + price-change timestamp, payment
-- method and delivery details on orders, a readable order number, ledger links
-- (order + actor) on stock movements, and the append-only OrderStatusEvent table.
--
-- Existing order rows (seed data) get placeholder delivery values so the new
-- NOT NULL columns can be added; the defaults are dropped afterwards so new
-- orders must supply real values. Re-seeding replaces those rows anyway.

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('GCASH', 'COD');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "orderId" TEXT;

-- AlterTable (backfilled, then defaults removed)
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deliveryBarangay" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deliveryFeeCentavos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deliveryPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deliverySlot" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "orderNumber" SERIAL NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD';

ALTER TABLE "Order" ALTER COLUMN "deliveryAddress" DROP DEFAULT,
ALTER COLUMN "deliveryBarangay" DROP DEFAULT,
ALTER COLUMN "deliveryName" DROP DEFAULT,
ALTER COLUMN "deliveryPhone" DROP DEFAULT,
ALTER COLUMN "deliverySlot" DROP DEFAULT,
ALTER COLUMN "paymentMethod" DROP DEFAULT;

-- CreateTable
CREATE TABLE "OrderStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_variantId_createdAt_idx" ON "StockMovement"("variantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusEvent" ADD CONSTRAINT "OrderStatusEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
