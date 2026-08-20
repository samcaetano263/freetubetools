# Content gap

The screenshots show containers, not content. Every
deck and 5 of 8 chapters were locked at capture time,
so no study material came across.

## Missing

- Civics questions and answers — none. Need the official
  128 (2025). The 2008 100-question bank is lower priority
  but still live for pre-Oct-2025 filers.
- 1,478 flashcard fronts/backs — referenced by count only
- Handbook chapter body text — titles only
- Reading & Writing vocabulary lists
- N-400 interview questions
- Per-state answers (senators, governor, capital)
- Spanish translations

## Where it has to come from

Official source is uscis.gov. The civics questions,
reading vocabulary, and writing vocabulary are published
by USCIS and are US government works. The N-400 form is
also published there.

Test version is **decided: 2025** (128 questions).
See `TEST-VERSION.md` for the full rules and the sourcing
targets.

Import target: the official 128-question PDF from uscis.gov.
Note that uscis.gov is blocked by this environment's egress
proxy — a worker will need it fetched some other way, or
Sam drops the PDF into Drive.

## Not a blocker for

Shared surface work. Nav, screens, schema, entitlement
and settings are fully specified by SPEC.md and can be
built against seed/fixture content before the real bank
lands.
