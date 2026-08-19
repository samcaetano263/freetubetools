# What we can reuse from the reference app

`screens/` transcribes a competitor's app. Some of it is
free to copy, some of it needs re-expressing. The split
matters more than it looks — it decides what we write
fresh vs. what we lift.

Not legal advice. If real money rides on it, get a lawyer.

## Free to reuse

**Feature set and structure.** Five-tab nav, having
flashcard decks, a handbook, timed tests, arcade games,
a streak counter. Functionality isn't protectable. Every
study app in this category has most of this.

**Data model.** Decks, chapters, attempts, entitlements.
Ours anyway.

**Topic categories.** "Constitution & Amendments",
"States & Geography" — these describe the USCIS material,
not their creative work.

**The civics questions themselves.** USCIS publishes the
official question bank, reading vocabulary, and writing
vocabulary. US government works — public domain. This is
the single biggest asset and it's free to everyone,
including them. Pull from uscis.gov, never from their app.

## Re-express

**Their marketing copy.** Every game description in
`screens/games.md` is their writing:

> "Two balloons rise: TRUE and FALSE. Read the statement
> and pop the correct balloon before they float away"

Transcribed for reference. Do not ship it. Write our own.

**Game mode names.** Blitz 60, Interview Survival, Word
Forge, Who Am I?. Individually thin, but shipping all
seven verbatim reads as copying. Rename them.

**Chapter titles.** Close paraphrase is fine — the topics
are fixed by USCIS — but don't match their list word for
word down to the em-dashes.

## Don't touch

- The name **Learnify**. It's theirs. See below.
- Their icons, illustrations, color palette, exact layout
- Their app store listing copy or screenshots
- Any content pulled from behind their paywall

## Naming collision — needs a decision

Our project is currently called Learnify, in `CLAUDE.md`,
in the Drive folder, and in this repo path. That is the
name of the company publishing the app we are cloning.

Shipping under it invites a trademark problem, and it will
quietly confuse every worker and every future session about
which app is which. Rename early — it gets more expensive
after the schema, the repo, and the store listing exist.
