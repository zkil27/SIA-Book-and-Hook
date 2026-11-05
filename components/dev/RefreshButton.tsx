"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/primitives";

/** Re-runs a server-rendered panel by refreshing the route. */
export function RefreshButton({ label = "Run again" }: { label?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button variant="outline" size="sm" loading={pending} onClick={() => start(() => router.refresh())}>
      {!pending && <RotateCw className="size-3.5" aria-hidden />}
      {label}
    </Button>
  );
}
