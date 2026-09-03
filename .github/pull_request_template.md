## What this does

<!-- One or two sentences. Link the scope item it implements. -->

Scope item: <!-- e.g. "Admin > Stock adjustment" from docs/scope.md -->

## How to test it

1.
2.

## Checklist

- [ ] Runs locally against seeded data
- [ ] No TypeScript errors, no console errors on the happy path
- [ ] Admin routes still reject a customer account (if auth was touched)
- [ ] Migration committed and ERD regenerated (if the schema changed)
- [ ] Money handled as Int centavos — no floats, no stray `/100`
- [ ] `StockMovement` rows are inserted, never updated or deleted
- [ ] No new dependency added without asking
- [ ] Nothing built that isn't in `docs/scope.md`

## Notes for the reviewer

<!-- Anything you're unsure about, or want a second opinion on. -->
