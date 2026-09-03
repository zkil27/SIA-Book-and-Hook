# Team Workflow

Small team, short deadline. These rules exist to prevent the two failures that
actually sink projects like this: code nobody can review once it's tangled in,
and artifacts that live outside the repo and disappear.

---

## Branching

`main` is protected and always deployable. Every change arrives through a pull
request.

```
main
 └── feat/admin-product-form
 └── feat/stock-ledger
 └── fix/variant-price-display
 └── docs/srs-section-3
```

Prefixes: `feat/`, `fix/`, `docs/`, `chore/`.

### Protecting main (do this before anyone's first commit)

GitHub → Settings → Branches → Add branch protection rule for `main`:
- Require a pull request before merging
- Require 1 approval
- Do not allow bypassing the above settings

Set this up on Day 1. Retrofitting branch protection after someone has pushed
directly to `main` for a week is a conversation nobody enjoys.

## Commits

Present tense, one logical change:

```
add stock movement model and migration
fix variant price rendering in admin table
seed 50 products across 6 categories
```

Not `update`, not `fix stuff`, not `asdf`. The documentator and the panel may
both read this history.

## Pull requests

Keep them small. A 40-file PR does not get reviewed, it gets approved — and
approving unread code is how you end up owning bugs you've never seen.

Review is not ceremony. For the lead it's the only reliable window into the
part-timer's code before it's woven into everything else. Read it properly.

**PR checklist** (also in `.github/pull_request_template.md`):
- [ ] Runs locally against seeded data
- [ ] No TypeScript errors, no console errors on the happy path
- [ ] Admin routes still reject a customer account, if auth was touched
- [ ] Migration committed and ERD regenerated, if the schema changed
- [ ] No new dependency added without asking
- [ ] Nothing built that isn't in `docs/scope.md`

## Everything lives in the repo

Committed, without exception:
- Documentation → `docs/`
- Diagrams → `docs/diagrams/` (export from Figma/draw.io **and** commit the
  source file, not just a PNG)
- Wireframes → `docs/design/` (plus a Figma link in the README)
- SQL dumps → `docs/sql/`
- The seed script — it is the closest thing you have to a backup

Not committed: `.env.local`, `node_modules/`, `.next/`, anything with a real
password in it.

The failure mode this prevents: the ERD exists only as an image in someone's
Messenger thread, that person is unreachable, and it's the night before
submission. This happens to some group every single term.

## Daily rhythm

A 10-minute check-in. Three questions each:
1. What did you finish?
2. What are you doing today?
3. What's blocking you?

If someone is blocked, unblock them before writing your own code. A blocked
teammate on a 14-day timeline costs more than a day of your own output.

## Communication

- Technical discussion belongs on the PR, not in chat, so it stays findable.
- Decisions get written into `docs/`. A decision that lives only in a chat thread
  will be re-litigated on Day 11.
- Scope questions go to the lead, and the default answer is the out-of-scope
  section.

## Who owns what

| Area | Owner | Reviewer |
|---|---|---|
| `prisma/`, auth, server actions | Lead | Part-timer |
| `components/`, admin forms and tables | Part-timer | Lead |
| `docs/` SRS and diagrams | Documentator | Lead |
| `docs/design/`, wireframes | UI/UX | Lead |

The lead reviews everything. That's the job on a team this size.
