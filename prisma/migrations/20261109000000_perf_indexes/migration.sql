-- Speed pass 2 (2026-11-07). Index-only migration: no table or data changes.

-- Covering index for stock: SUM("quantity") per variant is read from the
-- index alone instead of every ledger row in the table.
-- CreateIndex
CREATE INDEX "StockMovement_variantId_quantity_idx" ON "StockMovement"("variantId", "quantity");

-- The "All" orders tab and week totals sort/filter by createdAt across statuses.
-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- Dashboard: deliveries finished without a PIN in the last days.
-- CreateIndex
CREATE INDEX "OrderStatusEvent_toStatus_createdAt_idx" ON "OrderStatusEvent"("toStatus", "createdAt");
