/**
 * Footgun check — turns the project's written "never do this" rules into an
 * enforced, tool-agnostic gate.
 *
 * AGENTS.md and the steering/skill files list non-negotiables. An instruction
 * can be skimmed and ignored by a human or an AI tool; this script cannot. It
 * scans the source for the specific violations those rules describe and exits
 * non-zero if it finds any, so it works the same from `npm run verify`, a git
 * pre-commit hook, CI, or any editor/agent (Kiro, Cursor, Claude, Codex, ...).
 *
 * Pure Node — no dependencies, no DB connection. Static text analysis only.
 * Run with: npm run footguns
 *
 * These are deliberately conservative regexes: they aim for zero false
 * negatives on the obvious violation and accept the odd false positive, which
 * you can silence with a trailing `// footgun-ok: <reason>` comment on the line.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

// Directories we never scan.
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "prototype_src", // legacy Vite prototype, excluded from tsconfig
  "out",
  "build",
  "coverage",
  "scripts", // the checks themselves mention these patterns in comments
]);

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mts)$/;

interface Rule {
  id: string;
  description: string;
  /** Return true if this line violates the rule. */
  test: (line: string, filePath: string) => boolean;
  /** How to fix it, shown in the report. */
  fix: string;
}

const RULES: Rule[] = [
  {
    id: "stray-prisma-client",
    description:
      "`new PrismaClient()` outside lib/prisma.ts causes 'Too many connections' on Supabase.",
    fix: "Import the singleton: `import prisma from '@/lib/prisma'`.",
    test: (line, filePath) => {
      // Allowed in the singleton itself, and in standalone CLI scripts (seed).
      const norm = filePath.split(sep).join("/");
      if (norm.endsWith("lib/prisma.ts")) return false;
      if (norm.startsWith("prisma/")) return false; // seed.ts and friends
      return /\bnew\s+PrismaClient\s*\(/.test(line);
    },
  },
  {
    id: "float-money",
    description:
      "Money must be Int centavos. Dividing/multiplying a *Centavos value by 100 in logic (not display) reintroduces floats.",
    fix: "Keep money as integer centavos end-to-end; convert to pesos only in the render/format layer.",
    test: (line) => {
      // Heuristic: a Centavos identifier directly divided or multiplied by 100.
      // Display formatting typically lives in .tsx / format helpers; flag logic.
      return /[A-Za-z_]*[Cc]entavos\s*[*/]\s*100\b/.test(line) ||
        /\b100\s*[*/]\s*[A-Za-z_]*[Cc]entavos/.test(line);
    },
  },
  {
    id: "parseFloat-money",
    description: "parseFloat on a money/price/total value risks float money.",
    fix: "Parse money as integer centavos (e.g. parseInt, or multiply a validated decimal string with care in the input layer only).",
    test: (line) =>
      /parseFloat\s*\([^)]*(price|total|amount|centavos)/i.test(line),
  },
  {
    id: "hard-delete-catalog",
    description:
      "Products/variants are soft-deleted (active=false), never hard-deleted — orders reference them.",
    fix: "Set `active: false` via update instead of calling delete/deleteMany.",
    test: (line) =>
      /\bprisma\.(product|productVariant)\.deleteMany?\s*\(/.test(line),
  },
  {
    id: "delete-stock-movement",
    description:
      "The StockMovement ledger is append-only — never edit or delete a row; correct with a compensating movement.",
    fix: "Insert a new compensating StockMovement instead of update/delete.",
    test: (line) =>
      /\bprisma\.stockMovement\.(delete|deleteMany|update|updateMany)\s*\(/.test(
        line
      ),
  },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!IGNORE_DIRS.has(entry)) walk(full, out);
    } else if (SOURCE_EXT.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

interface Violation {
  file: string;
  line: number;
  ruleId: string;
  text: string;
}

function main() {
  console.log("\n=== Footgun check ===\n");
  const files = walk(ROOT);
  const violations: Violation[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    const relPath = relative(ROOT, file);
    lines.forEach((line, i) => {
      if (line.includes("footgun-ok")) return; // explicit opt-out
      for (const rule of RULES) {
        if (rule.test(line, relPath)) {
          violations.push({
            file: relative(ROOT, file),
            line: i + 1,
            ruleId: rule.id,
            text: line.trim(),
          });
        }
      }
    });
  }

  console.log(`  Scanned ${files.length} source files against ${RULES.length} rules.`);

  if (violations.length === 0) {
    console.log("  \u2713 No footguns found.\n");
    process.exit(0);
  }

  console.log(`\n  \u2717 ${violations.length} violation(s):\n`);
  for (const v of violations) {
    const rule = RULES.find((r) => r.id === v.ruleId)!;
    console.log(`  ${v.file}:${v.line}  [${v.ruleId}]`);
    console.log(`      ${v.text}`);
    console.log(`      why: ${rule.description}`);
    console.log(`      fix: ${rule.fix}`);
    console.log(
      `      (false positive? append "// footgun-ok: <reason>" to the line)\n`
    );
  }
  console.log(`--- Footgun check: ${violations.length} violation(s) ---\n`);
  process.exit(1);
}

main();
