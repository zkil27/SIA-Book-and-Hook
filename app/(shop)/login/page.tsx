import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getUser } from "@/lib/session";
import { AuthShell } from "@/components/shop/AuthShell";
import { LoginForm } from "@/components/shop/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  const denied = sp.denied === "1";
  const user = await getUser();
  if (user && !denied) redirect(user.role === "ADMIN" && next === "/" ? "/admin" : next);

  return (
    <AuthShell
      title="Sign in"
      lede={next.startsWith("/admin") ? "Staff sign-in for the Hook & Box admin." : "Sign in to check out and see your orders."}
    >
      {denied && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-tarp-soft px-3 py-2.5 text-sm font-medium text-[#5c4300]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          The admin is for Hook &amp; Box staff only. Sign in with a staff account to continue.
        </p>
      )}
      <LoginForm next={denied ? "/admin" : next} />
      <div className="mt-6 rounded-lg bg-ice p-3.5 text-[13px] text-ink-2">
        <p className="font-semibold text-ink">Demo accounts (fictional data)</p>
        <p className="mt-1">
          Staff: <span className="font-mono">admin@hookandbox.ph</span> / <span className="font-mono">admin123</span>
        </p>
        <p>
          Customer: <span className="font-mono">maria@example.com</span> / <span className="font-mono">customer123</span>
        </p>
      </div>
    </AuthShell>
  );
}
