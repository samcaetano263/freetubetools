# Test version — decided: 2025

Sam's call, 2026-08-20. Verified against uscis.gov the
same day.

## The 2025 civics test

| | |
|---|---|
| Question bank | **128** questions |
| Asked at interview | **20** |
| Correct to pass | **12** |
| Wrong to fail | **9** |

The officer stops at 12 correct or 9 incorrect, whichever
comes first. So a session is 12–20 questions, never fewer
than 12.

Based on the 2020 test, with modified administration.
Implemented under Executive Order 14161.

## Both tests are live at once — this is a build requirement

Which test an applicant takes depends on their **N-400
filing date**, not on today's date:

- Filed **before Oct 20, 2025** → 2008 test
  (100 questions, 10 asked, 6 to pass)
- Filed **on or after Oct 20, 2025** → 2025 test
  (128 questions, 20 asked, 12 to pass)

People who filed before the cutoff are still working
through their applications now, so both banks have real
users. The reference app's "Test Version" setting is not
cosmetic — we need it too.

## Third mode: the 65/20 exception

Applicants **65 or older** who have been lawful permanent
residents **20+ years** get a different test: 10 questions
drawn from a specially selected 20-question subset, from
either the 2008 or 2025 bank.

So the version axis is not a boolean. Three configurations:

    2008 standard    100 bank -> 10 asked -> 6 to pass
    2025 standard    128 bank -> 20 asked -> 12 to pass
    65/20 exception   20 subset -> 10 asked -> (see note)

Passing score for the 65/20 exception is not recorded
here — confirm before building it.

## Scope decision

Build **2025 first**. It is the forward path — every new
applicant from Oct 20, 2025 onward takes it, so the 2008
bank shrinks toward zero over time.

But the schema must carry version from day one. Retrofitting
a version axis onto questions, decks, attempts and scoring
later is exactly the kind of rework that eats a rebuild.

## English reading & writing

Separate from civics and apparently unchanged — the reading
and writing vocabulary lists are still the M-715 (01/10)
documents. Not positively confirmed as current for 2025.
Verify before building the Reading & Writing deck or the
letter-tile game.

Format: read 1 of 3 sentences aloud correctly; write 1 of
3 sentences correctly.

## What their deck count implies

Their "USCIS 2025 Civics" deck shows **168 cards** against
an official bank of **128**. The extra 40 are theirs —
padding, rephrasings, or split multi-part answers. Their
"Civics Variations" deck (305) is separate.

Ours should be 128 for the official bank. If we add
variations, keep them in a separate deck so a user can
drill the real thing unmixed.

## Sources

- https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test
- https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf
- https://www.uscis.gov/policy-manual/volume-12-part-e-chapter-2

Note: uscis.gov is blocked by this environment's egress
proxy. Facts above came from search results, not from
fetching the pages. Re-verify the 128 PDF directly before
importing the bank.
