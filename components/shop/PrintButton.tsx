"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/primitives";

/** Opens the browser's print dialog, which also covers Save as PDF. */
export function PrintButton({ label = "Print or save" }: { label?: string }) {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden /> {label}
    </Button>
  );
}
