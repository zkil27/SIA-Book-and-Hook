"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/primitives";

/**
 * Admin page error boundary. The usual cause is the database being
 * unreachable (a paused Supabase project), so the copy says so; the shell and
 * navigation stay usable around it.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto mt-10 flex max-w-lg flex-col items-center rounded-[var(--radius-card)] bg-paper p-10 text-center ring-1 ring-inset ring-ice-3">
      <CloudOff className="size-10 text-ink-3" aria-hidden />
      <p className="sign mt-4 text-[34px] text-ink">This page couldn&apos;t load</p>
      <p className="mt-2 text-sm text-ink-2">
        Most often the database is offline. If the Supabase project was paused for inactivity, restore it from the
        Supabase dashboard, then try again.
      </p>
      {error.digest && <p className="mt-2 font-mono text-[12px] text-ink-3">Ref {error.digest}</p>}
      <Button
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
