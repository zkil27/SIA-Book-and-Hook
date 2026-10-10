import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { listMyOrders } from "@/lib/orders";
import { requireUser } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth";
import { splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDateTime } from "@/lib/time";
import { Button, ButtonLink, StatusChip } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "My orders" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await listMyOrders(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="sign text-[clamp(44px,6vw,72px)] text-ink">My orders</h1>
          <p className="mt-1 text-ink-2">
            Signed in as <strong className="text-ink">{user.name ?? user.email}</strong>
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            <LogOut className="size-4" aria-hidden /> Sign out
          </Button>
        </form>
      </div>

      <div className="mt-8">
        {orders === "offline" ? (
          <p className="rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">
            Our order system is offline for a moment. Try again in a minute.
          </p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-paper px-6 py-14 text-center ring-1 ring-inset ring-ice-3">
            <p className="sign text-[34px] text-ink">No orders yet</p>
            <p className="mt-2 text-sm text-ink-3">Your orders and their status will show up here.</p>
            <ButtonLink href="/#catch" variant="tarp" className="mt-6">
              See today&apos;s catch
            </ButtonLink>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map(o => (
              <li key={o.code}>
                <Link
                  href={`/track?code=${o.code}`}
                  className="group flex items-center gap-4 rounded-[var(--radius-card)] bg-paper p-4 ring-1 ring-inset ring-ice-3 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5"
                >
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((i, idx) => (
                      <span key={idx} className="size-12 overflow-hidden rounded-full bg-ice-2 ring-2 ring-paper">
                        {i.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={i.image} alt="" className="size-full object-cover" />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-ink">{o.code}</span>
                      <StatusChip status={o.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-2">
                      {o.items.map(i => `${i.qty}× ${splitName(i.name).local}`).join(", ")}
                    </p>
                    <p className="text-[13px] text-ink-3">{fmtDateTime(o.createdAt)}</p>
                  </div>
                  <span className="tabular font-bold text-ink">{peso(o.total)}</span>
                  <ChevronRight className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
