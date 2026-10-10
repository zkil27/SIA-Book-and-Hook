import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { AuthShell } from "@/components/shop/AuthShell";
import { RegisterForm } from "@/components/shop/AuthForms";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage(props: PageProps<"/register">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  if (await getUser()) redirect(next);
  return (
    <AuthShell title="Create an account" lede="Takes a few seconds. Your basket stays as it is.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
