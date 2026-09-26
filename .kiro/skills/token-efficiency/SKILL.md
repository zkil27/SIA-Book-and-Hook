---
name: token-efficiency
description: >-
  How to work economically on this repo so agent turns cost fewer tokens/credits
  without sacrificing correctness. Use when a task involves reading multiple
  files, broad codebase exploration, large-file edits, repeated verification, or
  when the user mentions "tokens", "credits", "efficient", "cost", "cheaper",
  "faster", "context", or "don't re-read". Complements the "Token / credit
  efficiency" section in AGENTS.md.
---

# Working economically on Hook & Box

Goal: get the task right on the shortest path. Correctness always wins, but do
not spend tokens re-deriving things you already have.

## Reads and searches

- Reuse context. The steering/rules already state the stack, scope, data model,
  and known gaps. Do not open files just to reconfirm those facts.
- Batch independent reads and searches into a single turn. Avoid one-file-at-a-
  time round trips.
- Search narrow. Use a targeted grep/glob with an `includePattern` and read only
  the line ranges you need instead of whole large files (e.g. `app/StoreApp.tsx`
  is huge — grep for the symbol, then read the surrounding lines).
- For broad "how does X work across the repo" questions, delegate to the
  context-gatherer sub-agent and act on its summary rather than exploring inline.

## Edits

- Prefer targeted string-replace edits over rewriting a whole file.
- Never rewrite a large file wholesale to change a few lines.
- Make one coherent change per turn; don't thrash with many tiny follow-up edits.
- Use `replace_all` for a repeated token/class change (e.g. swapping a border
  color across a file) instead of many near-identical single edits.
- Gotcha: never put a literal `//` as JSX text (`<span>// Label</span>`) — the
  linter parses it as a comment (`react/jsx-no-comment-textnodes`) and each one
  becomes a fix. Wrap as `{"// Label"}` the first time.

## Large files and big restyles (the biggest lever here)

`app/StoreApp.tsx` is a ~1200-line monolith. Re-reading it before every edit is
the single largest avoidable cost — a dozen partial re-reads of one giant file
dwarfs everything else.

- Read each region **once**. Trust the freshness note: after your own edit, the
  post-edit state is already in context — don't re-read a region "to get accurate
  line numbers" when string-replace matches on content, not line numbers.
- Lock the design tokens / palette / type choices **up front** before editing, so
  they don't become mid-task retune points that trigger rework and re-reads.
- Split a whole-app restyle across a few **fresh, focused sessions** — e.g.
  "tokens + primitives", then "storefront", then "admin", then "checkout +
  remaining screens". Each fresh session starts lean instead of dragging the
  entire file's read history forward through one long turn.
- Prefer changing shared tokens/primitives (in `globals.css` or the `Btn`/`Card`/
  `Tag`/… primitives) over editing every call site — most of the look propagates
  from a few central changes.
- The known-gaps note already flags decomposing this monolith into real
  routes/components; once split, edits touch small files instead of re-reading
  one big one. That refactor pays for itself on every future prompt.

## Verification (once, at the end — mandatory)

- Run `npm run verify` (or its steps) **exactly once, as the final step**, after
  all edits are done. Never verify per-file, per-sub-task, or "to be sure".
- Batch all changes first; verify last. A green run is final — do not re-run.
- This is a hard rule (see AGENTS.md "Verification gate"), not a preference.
- Prep the toolchain in a separate step, not on the clock of feature work: if
  `node_modules` may be missing, run `npm install` and confirm `npm run verify`
  works up front. On Windows the `postinstall` `prisma generate` can hit an
  EPERM file-lock — sort that once so tasks don't spend budget discovering a
  broken toolchain.

## Loading context on demand

- Heavy references are behind manual/conditional inclusion — pull them only when
  the task needs them: `#deployment`, `#tech`, `#product`, `#structure`, and the
  other `.kiro/skills/` files.
- Don't restate the project brief or these rules back to the user.

## Output

- Keep responses proportional to the task. Short questions get short answers.
- Report what changed and which docs you updated; skip filler.
