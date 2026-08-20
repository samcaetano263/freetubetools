# HANDOFF

Where was I. Read this first, update it before session close.

Last updated: 2026-08-19

## Current state

Our product is **CitizenPrep**.

We are **cloning a third-party US Citizenship Test study
app** (Android, "2026 / US Citizenship Test / By Learnify").
Learnify is THEIR publisher name, never ours. The project
briefly carried that name and was renamed 2026-08-19 — any
remaining "Learnify" in the repo refers to them and is
correct. Do not sweep it.

The target's feature surface is mapped in `citizenprep/SPEC.md`,
derived from 7 screenshots of their app. It is a reference,
not our design — we can diverge.

Repo is still `samcaetano263/freetubetools` — a YouTube
transcript tool, unrelated to CitizenPrep. Our material
lives in `citizenprep/` inside it. Unresolved: does
CitizenPrep get its own repo, or is this one being
repurposed? Sam to decide. No code written yet.

## Where the material came from

Screenshots lived in a Claude.ai sidebar Project called
"immigration and naturalization questions". That Project
transcribed them to Drive at
`_BRAIN_ROOT/01_ACTIVE_PROJECTS/Immigration_Naturalization`
(8 Docs). Copied into `citizenprep/screens/` from there.

The PNG originals are still only in that Claude Project.
Repo rule is nothing binary, so they stay out.

## Target app: what's known

- Nav: 5 bottom tabs — Tests, Flashcards, Handbook, Games, More
- 8 flashcard decks, 1,478 cards visible
- 8 handbook chapters, 3 free / 5 premium
- 7 game modes, 3 test modes
- Freemium: entitlement gates decks and chapters
- Settings: dark mode, test version, state, Español

See `citizenprep/SPEC.md` for the full surface and the
implied data model. See `citizenprep/REUSE.md` for what we
can lift verbatim vs. what must be rewritten — their
marketing copy and game names are theirs, the USCIS
question bank is public domain.

## Target app: what's missing

No study content at all — zero questions, zero card
fronts/backs, zero chapter text. Everything was locked
behind the paywall at capture time. See
`citizenprep/CONTENT-GAP.md`. Must be sourced from uscis.gov.

Test version **decided: 2025** — 128 questions, 20 asked,
12 to pass, 9 wrong to fail. Verified against uscis.gov
2026-08-20. See `citizenprep/TEST-VERSION.md`.

Important: the 2008 test is still live for anyone who
filed N-400 before Oct 20, 2025, and there is a third
config for 65+/20-year residents. Version is a schema
axis from day one, not a later setting.

uscis.gov is blocked by this environment's egress proxy.
Search works, fetching does not — the 128-question PDF
needs another route or a drop into Drive.

## Next

1. Sam: own repo or this one? Last open decision.
2. Get the official 128-question bank in (uscis.gov
   blocked here — Sam drops the PDF in Drive, or a worker
   fetches it from an unblocked environment).
3. Then: ONE worker builds shared surface (nav, schema
   incl. test-version axis, entitlement, settings) against
   fixture content.
4. No parallel branches until 3 is merged.

## Blocked on Drive

Nothing. Drive is readable from these sessions — CLAUDE.md
said otherwise and has been corrected. Our Drive folder
`01_ACTIVE_PROJECTS/CitizenPrep` (renamed from Learnify)
has three empty subfolders: 01_Source_Docs, 02_Assets,
03_Screens_and_Reference.

Screenshot transcriptions stay at
`01_ACTIVE_PROJECTS/Immigration_Naturalization` — already
copied into `citizenprep/screens/`, no need to re-read.

## Branches

- `claude/learnify-setup-2xjkx1` — CLAUDE.md, HANDOFF.md,
  citizenprep/. Not merged.
