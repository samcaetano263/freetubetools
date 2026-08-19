# HANDOFF

Where was I. Read this first, update it before session close.

Last updated: 2026-08-19

## Current state

Repo is `samcaetano263/freetubetools` — a YouTube transcript
tool. It is **not** Learnify. CLAUDE.md (added this session)
describes Learnify conventions and points at the Learnify
Drive folder. Unresolved: either Learnify gets its own repo,
or this repo is being repurposed. Sam to decide.

Nothing Learnify-specific has been built.

## What's here (freetubetools)

- `index.html` — entire tool in one file: markup, CSS, JS,
  SEO/JSON-LD, ad slots. ~45KB.
- `api/transcript.js` — caption fetch. Source picked from env
  at runtime: TRANSCRIPT_API_KEY (Supadata) > PROXY_URL
  (residential proxy) > ALLOW_DIRECT_FETCH (dev only).
- `api/translate.js` (DeepL), `api/summarize.js` (Claude Haiku)
  — optional, cost money per call.
- `lib/ratelimit.js` — per-IP hourly limit + daily global spend
  cap, Upstash Redis. Fails open if env vars unset.
- `netlify/functions/transcript.js` — Netlify wrapper.
- `blog/` — index + one post. Duplicates index.html's shell.

Stack: vanilla HTML/CSS/JS, no framework, no build step.
Node serverless (CommonJS). One dep: undici. Vercel or Netlify.

## Shared surface: NOT built

- Layout — monolithic index.html, not reusable. Second page
  means copy-paste (blog already does this).
- Navigation — hardcoded header, three links.
- Data — none. No DB, no schema, no auth, no persisted state.
  Transcript segments are request-scoped and discarded.

Per CLAUDE.md "sequential before parallel": one worker builds
layout + schema + auth alone before any fan-out.

## Next

1. Sam: confirm whether Learnify lives in this repo or a new one.
2. Then: single worker on shared surface.
3. No parallel branches until 2 is merged.

## Blocked on Drive

(Nothing yet. Add items here when a task needs something from
_BRAIN_ROOT/01_ACTIVE_PROJECTS/Learnify — Sam retrieves them.)

## Branches

- `claude/learnify-setup-2xjkx1` — CLAUDE.md, HANDOFF.md. Not merged.
