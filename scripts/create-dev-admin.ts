/**
 * Create (or update) a developer admin account with your own email and a
 * password you choose, so the live /admin/dev section isn't reached through
 * the seeded demo admin (whose password is printed on the login page).
 *
 * Credentials come from the environment, never from code or docs:
 *
 *   $env:DEV_ADMIN_EMAIL="you@example.com"
 *   $env:DEV_ADMIN_PASSWORD="a long passphrase"
 *   npm run dev:admin
 *
 * Then add the same email to DEV_EMAILS (locally in .env.local, and in Vercel)
 * to open /admin/dev. Writes one User row (role ADMIN); prints only the email.
 */
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  const email = (process.env.DEV_ADMIN_EMAIL ?? process.argv[2] ?? "").trim().toLowerCase();
  const password = process.env.DEV_ADMIN_PASSWORD ?? "";
  const name = (process.env.DEV_ADMIN_NAME ?? "Developer").trim() || "Developer";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Set DEV_ADMIN_EMAIL to a valid email address.");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Set DEV_ADMIN_PASSWORD to at least 12 characters (pass it through the environment, not argv).");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name },
    create: { email, passwordHash, role: "ADMIN", name },
    select: { email: true },
  });
  console.log(`Dev admin ready: ${user.email} (role ADMIN).`);
  console.log("Add this email to DEV_EMAILS (comma-separated) to open /admin/dev.");
}

main()
  .catch(e => {
    console.error("Could not create the dev admin:");
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
