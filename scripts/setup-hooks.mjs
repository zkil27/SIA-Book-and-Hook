/**
 * Points git at the committed `githooks/` directory so the repo's pre-commit
 * gate is active for everyone after a plain `npm install` — no husky, no extra
 * dependency, works on any OS.
 *
 * Runs from `postinstall` and from `npm run setup:hooks`. It must NEVER fail the
 * install: if git is missing or this isn't a git checkout (CI tarball, Docker
 * layer, etc.), it just logs and exits 0.
 */
import { execSync } from "node:child_process";

function tryGit(args) {
  return execSync(`git ${args}`, { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
}

try {
  // Are we inside a git work tree at all?
  const inRepo = tryGit("rev-parse --is-inside-work-tree") === "true";
  if (!inRepo) {
    console.log("[setup-hooks] not a git repo; skipping hook activation.");
    process.exit(0);
  }
  execSync("git config core.hooksPath githooks", { stdio: "ignore" });
  console.log("[setup-hooks] core.hooksPath -> githooks (pre-commit gate active).");
} catch {
  // git not installed, or any other issue: never block install.
  console.log("[setup-hooks] git unavailable; skipping hook activation.");
}

process.exit(0);
