"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Ban } from "lucide-react";
import { Button, Input } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { cancelCustomerOrder } from "@/lib/actions/checkout";

const QUICK_REASONS = [
  "Changed my mind",
  "Need to change items",
  "Need to change delivery slot",
  "Ordered by mistake",
  "Other reason",
];

export function CancelOrderDialog({ code }: { code: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(QUICK_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [cancelling, startCancel] = useTransition();

  const finalReason = selectedReason === "Other reason" && customNote.trim()
    ? customNote.trim()
    : selectedReason;

  function handleCancel() {
    startCancel(async () => {
      const res = await cancelCustomerOrder(code, finalReason);
      if (!res.ok) {
        toast({ title: "Couldn't cancel order", description: res.error, tone: "error" });
        return;
      }
      toast({
        title: `Order ${code} cancelled`,
        description: "Your order was cancelled and items returned to stock.",
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Ban className="size-3.5" aria-hidden />
        Cancel order
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <span className="font-mono text-marker-deep">{code}</span>
            <span className="text-ink">· Cancel order</span>
          </span>
        }
        description="Orders can be cancelled anytime before they are marked Out for delivery."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Keep order
            </Button>
            <Button
              variant="marker"
              loading={cancelling}
              onClick={handleCancel}
            >
              Yes, cancel order
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-marker-soft p-4 text-sm text-marker-deep ring-1 ring-inset ring-marker/30">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-marker" aria-hidden />
              <div>
                <p className="font-semibold">This action cannot be undone</p>
                <p className="mt-0.5 text-[13px] text-marker-deep/90">
                  Any fresh seafood reserved for this order will go back on the shelf immediately.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Why are you cancelling?</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_REASONS.map(r => {
                const active = selectedReason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`h-9 rounded-full px-3.5 text-xs font-semibold ring-1 ring-inset transition-colors cursor-pointer ${
                      active
                        ? "bg-ink text-white ring-ink"
                        : "bg-paper text-ink-2 ring-ice-3 hover:bg-ice hover:ring-ink-3"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedReason === "Other reason" && (
            <div>
              <label htmlFor="custom-cancel-note" className="text-xs font-semibold text-ink-2">
                Specify reason (optional)
              </label>
              <Input
                id="custom-cancel-note"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="Let us know why you are cancelling..."
                className="mt-1"
              />
            </div>
          )}
        </div>
      </Sheet>
    </>
  );
}
