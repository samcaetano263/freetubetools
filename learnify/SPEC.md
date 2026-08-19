# Learnify — US Citizenship Test app

Derived from 7 Android screenshots exported from the
"immigration and naturalization questions" Claude Project
via Drive. Source transcriptions in `screens/`.

App header reads: **2026 / US Citizenship Test / By Learnify**

This is the product. The screenshots are the shared
surface — nav, screens, and data model are all visible.

## Navigation

Bottom tab bar, 5 tabs, fixed order:

`Tests · Flashcards · Handbook · Games · More`

## Screens

### Tests
- Overall progress card: Average score (n/20),
  Total progress (Completed n%), progress bar,
  "Set test date" button, expand/collapse "See insights".
- Insights (6): Study Streak (days), Tests Completed,
  Total Questions, Correct Answers (green),
  Incorrect Answers (red), Accuracy Rate (% , blue).
- Quick-access tiles (2x2): Starred, Wrong, Weak Areas,
  Vocabulary.
- Take a Test:
  - Mock Test — 20 questions, timed, like the real test
  - Test by Topics — pick topics and test yourself
  - Mock Interview — practice the N-400 oral interview
  - (list may continue past capture)

### Flashcards
Header copy: "Pick a deck — tap to flip, swipe to sort
what you know."

- Top card: **All Topics** — shuffled from whole bank.
- By Topic — 8 decks, all locked in capture:

| Deck | Cards |
|---|---|
| USCIS 2025 Civics | 168 |
| Civics Variations | 305 |
| States & Geography | 200 |
| US History | 220 |
| Constitution & Amendments | 160 |
| Reading & Writing | 150 |
| N-400 Interview | 115 |
| US Presidents | 160 |
| **visible total** | **1,478** |

List continues past capture — deck count may exceed 8.

### Handbook
- "Your overall study progress n%"
- Tiles: Bookmarks, Highlights, Key Terms
- Section: "U.S. Citizenship — Chapters", 8 chapters:

| # | Chapter | Access |
|---|---|---|
| 1 | Government Basics | free |
| 2 | Rights and Responsibilities | free |
| 3 | American History — Colonial & Revolution | free |
| — | American History — 1800s | premium |
| — | American History — 1900s to Modern | premium |
| — | Geography | premium |
| — | U.S. Presidents | premium |
| — | The Naturalization Process | premium |

Free chapters carry a number; premium chapters show a
padlock and the label "Premium chapter" instead.

### Games
XP header: level badge, "Level n", "n XP", flame streak.

7 modes (verbatim descriptions in `screens/`):
- **Blitz 60** — 60s, combo multiplier on quick correct
- **Interview Survival** — 9 wrong = out, 12 correct = pass
- **Daily Sprint** — 10 fresh questions daily, streak
- **Memory Match** — pair question to answer, fewer moves
- **Balloon Pop** — TRUE/FALSE, pop before it floats away
- **Word Forge** — spell official vocabulary from tiles
- **Who Am I?** — guess figure from clue, 2x before clue 2

List continues past capture.

### More
- Header banner: 2026 / US Citizenship Test / By Learnify
- Premium card: "Unlock all tests" / "Go Premium & get
  unlimited access to all tests."
- Settings: Dark Mode (toggle), Test Version (= 2025 Test),
  Selected State (= New York), Español (toggle)
- Menu: Rate us, Share, Statistics, Achievements, About us

## Data model implied

- **Question** — the atom. Feeds tests, flashcards, and
  every game mode. Needs: topic, state-specific flag,
  EN/ES text, true/false form (Balloon Pop), vocabulary
  flag (Word Forge), figure/clue form (Who Am I?).
- **Deck** — named group of cards + count + entitlement.
- **Chapter** — handbook prose, ordered, + entitlement.
- **Attempt** — per test/game run; drives every insight
  counter and Weak Areas.
- **Progress** — streak, XP, level, per-question state
  (starred / wrong / weak).
- **Annotation** — bookmarks, highlights, key terms.
- **Entitlement** — free vs premium, per deck and chapter.
- **Settings** — dark mode, test version, state, language.

## Open questions

1. Header says **2026**, Test Version setting says
   **2025 Test**. Which governs the question bank?
   (USCIS has both a 2008 and a 2025 civics test.)
2. Selected State = New York — state-specific answers
   (senators, governor, capital) need a per-state table.
3. Español toggle — full bilingual bank, or UI only?
4. Card/chapter/game content does not exist in the
   export. Must be sourced. See `CONTENT-GAP.md`.
