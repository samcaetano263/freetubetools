# CitizenPrep

Drive reference: _BRAIN_ROOT/01_ACTIVE_PROJECTS/CitizenPrep
(Sam's Google Drive. Readable from Claude Code sessions —
search it directly. If a worker cannot reach it, note the
item in HANDOFF.md under "Blocked on Drive".)

We are cloning a third-party app. "Learnify" is THEIR
publisher name — never ours. See citizenprep/REUSE.md
for what is safe to reuse.

## Rules

- Merge authority: you only. Workers never merge.
- Branch convention: task/short-description
- Workers get non-overlapping files. If two tasks need
  the same file, they are one task — do not split them.
- Read HANDOFF.md first, every session. It answers
  "where was I".
- Never commit to main directly. Delete branches after merge.
- Sequential before parallel: shared surface (layout,
  schema, auth, config) is built by ONE worker alone
  before fanning out to parallel branches.
- Drive is read-reference, never a build target.
- Nothing binary in the repo.

## Workers

MiniMax/Mavis — cannot open PRs (you open them after
it pushes), does not survive session close. So
"write HANDOFF.md" must be instruction #1 in its task
files, not the last step.

Kimi K2, GLM 5.2, DeepSeek — untested. Do not assign
real work until capability-tested on something throwaway.

## Style

Sam works by voice on Android. Keep responses short.
