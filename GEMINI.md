# FABRICO AntiGravity Project Context Loader

> This file is the startup pointer for the AntiGravity/Gemini coding agent.
> The agent must read the repository files below before making implementation decisions.

## Read order — mandatory

Read these files in this order:

1. `./Gemini.md`
2. `./agent.md`
3. `./README.md`
4. `./log.txt`

Then inspect the actual source tree and configuration files.

Do NOT begin implementation from memory or from this file alone.

---

## Canonical sources of truth

### Product requirements

`./README.md`

The README contains the detailed FABRICO website prompt/specification supplied for this project.

It is the canonical source for:

- Product requirements
- Customer experience
- Admin experience
- Analytics behavior
- WhatsApp ordering
- Visual direction
- Database requirements
- CMS requirements
- Responsive behavior
- SEO
- Performance

### Engineering rules

`./agent.md`

This file contains the AntiGravity development contract, continuation rules, security requirements, implementation priorities, verification requirements, and logging rules.

### Persistent handoff history

`./log.txt`

This file records what previous agents have actually done.

Use it to continue from the latest implementation state rather than restarting work.

---

## Mission

Continue the existing FABRICO project exactly where the previous hosted website-building agent stopped.

The previous builder's authorization/usage limit has been reached. AntiGravity is now the active development environment.

The project must become independent of obsolete builder-specific authorization where that authorization is not part of legitimate application security.

Do not destroy or reset existing work.

Inspect first.

Fix first.

Extend second.

---

## Required startup checks

Before editing:

1. Read `agent.md`.
2. Read `README.md`.
3. Read the latest `log.txt` entries.
4. Inspect `package.json` and lockfile.
5. Inspect environment/config files.
6. Inspect route/page structure.
7. Search for unfinished TODO/FIXME items.
8. Search for obsolete builder/Lovable-specific code.
9. Determine whether the project builds and identify baseline errors.

Useful repository searches include:

- `lovable`
- `Lovable`
- builder-specific auth/authorization
- redirects/callback URLs
- obsolete environment variable names
- placeholder/demo logic
- TODO/FIXME

Do not blindly remove authentication libraries. Determine what is obsolete versus required by FABRICO.

---

## Continuation rule

Use `log.txt` to find the last completed work.

If the previous session was working on Feature X, first finish/repair Feature X before moving to unrelated Feature Y unless the current codebase makes that impossible.

If `log.txt` and the source code disagree, inspect the code and record the discrepancy in the next log entry.

---

## README integration

The detailed FABRICO master prompt is already stored in `README.md`.

Do NOT ask the user to paste that prompt again unless the file is genuinely missing or unreadable.

Read it directly from the repository.

The implementation should satisfy the README's intent while adapting to the actual existing architecture.

---

## Required persistent log behavior

`./log.txt` is a shared handoff mechanism between coding agents.

Every meaningful session must APPEND, never replace, a session entry.

The next agent must be able to answer from `log.txt`:

- What did the last agent work on?
- Which files changed?
- Which features are complete?
- Which features are incomplete?
- Which bugs remain?
- What was tested?
- What should be done next?

Use factual statements only.

Never record an unverified test as passing.

---

## Current target architecture

The intended application has:

CUSTOMER STOREFRONT
+
ADMIN/CMS
+
BACKEND/DATABASE
+
ANALYTICS
+
WHATSAPP COMMERCE

The customer side should provide an editorial luxury fashion experience.

The admin side should provide operational control and merchandising intelligence.

Analytics should influence customer-facing merchandising without exposing private business metrics.

---

## Important business rule

A WhatsApp button click is NOT automatically a confirmed order.

The system must distinguish:

WhatsApp click
→ inquiry
→ admin confirmation
→ confirmed order

Only confirmed orders should be treated as confirmed sales in sales-oriented analytics.

---

## Final instruction to AntiGravity

Do the work in the existing repository.

Do not create a detached demo project.

Do not restart the application unnecessarily.

Do not silently remove required functionality.

Do not depend on the previous hosted builder's active authorization/session.

Continue from the latest real state.

Log what you did.

Leave the repository in a clean, testable, understandable state for the next agent.
