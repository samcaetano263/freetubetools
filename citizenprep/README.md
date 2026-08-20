# CitizenPrep

A US citizenship test study app. Practice the **2025
naturalization civics test** — 128 questions, 20 asked at
interview, 12 correct to pass.

Status: **pre-code.** Spec and decisions only.

## Read first

| File | What |
|---|---|
| `HANDOFF.md` | Where was I. Read every session. |
| `CLAUDE.md` | Rules, branch conventions, worker notes. |
| `docs/SPEC.md` | Feature surface and data model. |
| `docs/TEST-VERSION.md` | Which test, and why it's a schema axis. |
| `docs/REUSE.md` | What we may reuse from the reference app. |
| `docs/CONTENT-GAP.md` | What content is missing and where it comes from. |
| `docs/screens/` | Verbatim transcriptions of the reference app. |

## What this is

We are cloning a third-party Android app, "2026 US
Citizenship Test" by **Learnify**. Learnify is their
publisher name, never ours — see `docs/REUSE.md` before
shipping anything traced from `docs/screens/`.

The civics questions themselves are published by USCIS and
are US government works, so the core content is free to
everyone. Their moat is packaging, not material.

## Planned surface

Five tabs: Tests · Flashcards · Handbook · Games · More.
Freemium — some chapters and decks gated.

Nothing is built yet. Per `CLAUDE.md`, the shared surface
(layout, schema, entitlement, settings) is built by ONE
worker alone before any parallel branches.

## Stack

Undecided. The reference app is Android; we have not
committed to native, cross-platform, or web.
