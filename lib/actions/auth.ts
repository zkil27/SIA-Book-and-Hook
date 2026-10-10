"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

export type FormState = { error: string | null; fields?: Record<string, string> };

function safeNext(next: FormDataEntryValue | null): string {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  if (!email || !password) return { error: "Enter your email and password.", fields: { email } };

  // Staff go to the admin after signing in unless a page asked for somewhere else.
  let target = next;
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    if (user?.role === "ADMIN" && next === "/") target = "/admin";
    if (user?.role !== "ADMIN" && next.startsWith("/admin")) {
      return { error: "This account doesn't have staff access. Sign in with a staff account.", fields: { email } };
    }
  } catch {
    return { error: "Can't reach the store database right now. Try again in a minute.", fields: { email } };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: target });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "That email and password don't match an account.", fields: { email } };
    }
    throw err; // redirect on success
  }
}

const Register = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const raw = {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  };
  const next = safeNext(form.get("next"));
  const parsed = Register.safeParse(raw);
  const fields = { name: raw.name, email: raw.email };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details.", fields };

  try {
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return { error: "An account with that email already exists. Sign in instead.", fields };
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        role: "CUSTOMER",
      },
    });
  } catch {
    return { error: "Can't reach the store database right now. Try again in a minute.", fields };
  }

  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: next });
  return { error: null };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
