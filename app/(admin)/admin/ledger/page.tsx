import { Suspense } from "react";
import { ledgerVariants, loadLedger } from "@/lib/admin-data";
import { splitName } from "@/lib/meta";
import { PageHeader } from "@/components/admin/kit";
import { LedgerView } from "@/components/admin/LedgerView";

export const metadata = { title: "Stock ledger" };

export default async function LedgerPage(props: PageProps<"/admin/ledger">) {
  const sp = await props.searchParams;
  const v = typeof sp.v === "string" && sp.v ? sp.v : null;
  const p = typeof sp.p === "string" && ["1", "7", "30", "all"].includes(sp.p) ? sp.p : v ? "all" : "30";
  const sinceDays = p === "all" ? undefined : p === "1" ? 0 : Number(p);

  const [{ rows, truncated }, list] = await Promise.all([
    loadLedger({ variantId: v ?? undefined, sinceDays }),
    ledgerVariants(),
  ]);
  const variants = list.map(x => ({
    id: x.id,
    label: `${splitName(x.productName).local} · ${x.name}${x.archived ? " (archived)" : ""}`,
    stock: x.stock,
  }));

  return (
    <>
      <PageHeader
        title="Stock ledger"
        sub="Every kilo in and out, with who, when and why. Balance is that item's stock right after each entry."
      />
      <Suspense>
        <LedgerView rows={rows} truncated={truncated} variants={variants} variantId={v} period={p} />
      </Suspense>
    </>
  );
}
