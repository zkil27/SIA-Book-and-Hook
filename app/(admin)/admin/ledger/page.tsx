import { Suspense } from "react";
import { loadInventory, loadLedger } from "@/lib/admin-data";
import { splitName } from "@/lib/meta";
import { PageHeader } from "@/components/admin/kit";
import { LedgerView } from "@/components/admin/LedgerView";

export const metadata = { title: "Stock ledger" };

export default async function LedgerPage(props: PageProps<"/admin/ledger">) {
  const sp = await props.searchParams;
  const v = typeof sp.v === "string" && sp.v ? sp.v : null;
  const p = typeof sp.p === "string" && ["1", "7", "30", "all"].includes(sp.p) ? sp.p : v ? "all" : "30";
  const sinceDays = p === "all" ? undefined : p === "1" ? 0 : Number(p);

  const [rows, inv] = await Promise.all([loadLedger({ variantId: v ?? undefined, sinceDays }), loadInventory()]);
  const variants = inv.flatMap(prod =>
    prod.variants.map(x => ({ id: x.id, label: `${splitName(prod.name).local} · ${x.name}${prod.active && x.active ? "" : " (archived)"}`, stock: x.stock }))
  );

  return (
    <>
      <PageHeader
        title="Stock ledger"
        sub="Every kilo in and out, with who, when and why. Balance is that item's stock right after each entry."
      />
      <Suspense>
        <LedgerView rows={rows} variants={variants} variantId={v} period={p} />
      </Suspense>
    </>
  );
}
