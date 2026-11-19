"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copies a tracking link (absolute) so the customer can send it to family. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2200);
        } catch {
          window.prompt("Copy this tracking link", new URL(path, window.location.origin).toString());
        }
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-deep underline-offset-4 hover:underline"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : "Copy tracking link"}</span>
    </button>
  );
}
