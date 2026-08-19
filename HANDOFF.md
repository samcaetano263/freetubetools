# HANDOFF

Where was I. Read this first, update it before session close.

Last updated: 2026-08-19

## Current state

Learnify is a **US Citizenship Test study app** (Android,
header reads "2026 / US Citizenship Test / By Learnify").
Its shared surface is now specified in `learnify/SPEC.md`,
derived from 7 app screenshots.

Repo is still `samcaetano263/freetubetools` — a YouTube
transcript tool, unrelated to Learnify. Learnify material
now lives in `learnify/` inside it. Unresolved: does
Learnify get its own repo, or is this one being repurposed?
Sam to decide. Nothing Learnify has been built yet.

## Where the material came from

Screenshots lived in a Claude.ai sidebar Project called
"immigration and naturalization questions". That Project
transcribed them to Drive at
`_BRAIN_ROOT/01_ACTIVE_PROJECTS/Immigration_Naturalization`
(8 Docs). Copied into `learnify/screens/` from there.

The PNG originals are still only in that Claude Project.
Repo rule is nothing binary, so they stay out.

## Learnify: what's known

- Nav: 5 bottom tabs — Tests, Flashcards, Handbook, Games, More
- 8 flashcard decks, 1,478 cards visible
- 8 handbook chapters, 3 free / 5 premium
- 7 game modes, 3 test modes
- Freemium: entitlement gates decks and chapters
- Settings: dark mode, test version, state, Español

See `learnify/SPEC.md` for the full surface and the
implied data model.

## Learnify: what's missing

No study content at all — zero questions, zero card
fronts/backs, zero chapter text. Everything was locked
behind the paywall at capture time. See
`learnify/CONTENT-GAP.md`. Must be sourced from uscis.gov.

Blocking decision: **2008 test or 2025 test?** The app
displays both years in different places.

## Next

1. Sam: Learnify in this repo or a new one?
2. Sam: 2008 or 2025 civics test?
3. Then: ONE worker builds shared surface (nav, schema,
   entitlement, settings) against fixture content.
4. No parallel branches until 3 is merged.

## Blocked on Drive

Nothing. Drive is readable from these sessions — CLAUDE.md
says otherwise and is wrong on that point. The Learnify
Drive folder (`01_ACTIVE_PROJECTS/Learnify`) has three
empty subfolders: 01_Source_Docs, 02_Assets,
03_Screens_and_Reference.

## Branches

- `claude/learnify-setup-2xjkx1` — CLAUDE.md, HANDOFF.md,
  learnify/. Not merged.
