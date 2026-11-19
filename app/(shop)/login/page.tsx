import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getUser } from "@/lib/session";
import { homeFor, isStaff, ROLE_LABEL } from "@/lib/roles";
import { AuthShell } from "@/components/shop/AuthShell";
import { LoginForm } from "@/components/shop/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  const denied = sp.denied === "1";
  const user = await getUser();
  if (user && !denied) redirect(next === "/" ? homeFor(user.role) : next);
  const staffDenied = denied && user && isStaff(user.role);

  return (
    <AuthShell
      title="Sign in"
      lede={
        next.startsWith("/admin") || next.startsWith("/staff")
          ? "Staff sign-in for Hook & Box."
          : "Sign in to check out and see your orders."
      }
    >
      {denied && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-tarp-soft px-3 py-2.5 text-sm font-medium text-[#5c4300]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {staffDenied ? (
            <span>
              That page belongs to a different staff job. You&apos;re signed in as a {ROLE_LABEL[user.role].toLowerCase()}.{" "}
              <Link href={homeFor(user.role)} className="font-semibold underline">
                Go to your screen
              </Link>
              , or sign in with another account.
            </span>
          ) : (
            "That area is for Hook & Box staff only. Sign in with a staff account to continue."
          )}
        </p>
      )}
      <LoginForm next={denied ? "/" : next} />
      <div className="mt-6 rounded-lg bg-ice p-3.5 text-[13px] text-ink-2">
        <p className="font-semibold text-ink">Demo accounts (fictional data)</p>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          <dt>Admin</dt>
          <dd>
            <span className="font-mono">admin@hookandbox.ph</span> / <span className="font-mono">admin123</span>
          </dd>
          <dt>Packer</dt>
          <dd>
            <span className="font-mono">packer@hookandbox.ph</span> / <span className="font-mono">packer123</span>
          </dd>
          <dt>Driver</dt>
          <dd>
            <span className="font-mono">driver@hookandbox.ph</span> / <span className="font-mono">driver123</span>
          </dd>
          <dt>Customer</dt>
          <dd>
            <span className="font-mono">maria@example.com</span> / <span className="font-mono">customer123</span>
          </dd>
        </dl>
      </div>
    </AuthShell>
  );
}
