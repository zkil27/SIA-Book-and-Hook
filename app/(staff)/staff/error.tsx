"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/primitives";

/** Staff screen error boundary: usually the database is unreachable. */
export default function StaffError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  useEffect(() => {
    console.error("[staff]", error);
  }, [error]);

  return (
    <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] bg-paper p-8 text-center ring-1 ring-inset ring-ice-3">
      <CloudOff className="size-10 text-ink-3" aria-hidden />
      <p className="sign mt-4 text-[32px] text-ink">This screen couldn&apos;t load</p>
      <p className="mt-2 text-sm text-ink-2">
        The store database may be offline. Nothing you did was lost. Try again in a minute, or tell the office.
      </p>
      {error.digest && <p className="mt-2 font-mono text-[12px] text-ink-3">Ref {error.digest}</p>}
      <Button
        size="lg"
        className="mt-6"
        loading={pending}
        onClick={() =>
          start(() => {
            router.refresh();
            reset();
          })
        }
      >
        Try again
      </Button>
    </div>
  );
}
