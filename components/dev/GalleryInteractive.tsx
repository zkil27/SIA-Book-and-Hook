"use client";

import { useReducedMotion } from "motion/react";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useBasketActions } from "@/components/shop/basket";
import { BasketSheet } from "@/components/shop/BasketUI";

/** Toast triggers: success, error and undo. */
export function ToastTriggers() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Saved", description: "A success toast." })}>
        Success toast
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast({ title: "Not recorded", description: "An error toast names the problem.", tone: "error" })}
      >
        Error toast
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast({
            title: "Stock adjusted",
            description: "Undo writes a compensating entry.",
            undo: () => toast({ title: "Undone (preview only, nothing was written)" }),
          })
        }
      >
        Toast with undo
      </Button>
    </div>
  );
}

/**
 * Opens the real basket sheet. Rendered inside an in-memory
 * <BasketProvider persist={false}>, so it's always empty and never touches
 * a shopper's saved basket.
 */
export function EmptyBasketPreview() {
  const { setOpen } = useBasketActions();
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ShoppingBasket className="size-4" aria-hidden /> Open the empty basket
      </Button>
      <BasketSheet />
    </>
  );
}

export function MotionNote() {
  const reduce = useReducedMotion();
  return (
    <p className="text-[13px] text-ink-2">
      Reduced motion is <strong className="text-ink">{reduce ? "on" : "off"}</strong> in this browser.{" "}
      {reduce
        ? "Stamps, odometers and sheets should appear without movement."
        : "Turn on “reduce motion” in your OS settings to check the calm versions."}
    </p>
  );
}
