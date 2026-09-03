import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy Vite prototype — excluded from tsconfig too; not shipped code.
    "prototype_src/**",
    // Figma-exported asset modules (generated, not hand-authored).
    "imports/**",
    "public/imports/**",
  ]),
]);

export default eslintConfig;
