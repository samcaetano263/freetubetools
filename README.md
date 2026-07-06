# Free YouTube Transcript Generator

Paste a YouTube link → get the full transcript to read, copy, or download.
Static site + **one** serverless function. No framework, no build step.

```
index.html                                        ← the tool page
api/transcript.js                                 ← transcript backend
api/translate.js                                  ← translation backend (optional)
api/summarize.js                                  ← AI summary backend (optional)
lib/ratelimit.js                                  ← shared cost-control guards for translate/summarize
blog/index.html                                   ← blog index
blog/turn-youtube-transcript-into-seo-article.html ← sample post
```

---

## Why the backend is special (read this once)

YouTube blocks caption requests coming from **datacenter IPs** — the moment your
site runs on Vercel/Netlify/a VPS, direct fetching returns nothing. This is why
most copycat transcript tools silently break.

So `api/transcript.js` never fetches from the server's own IP in production.
It picks a caption source at runtime based on which env vars you've set:

| Priority | Env var | What it does |
|---|---|---|
| 1 | `TRANSCRIPT_API_KEY` | Uses the **Supadata** transcript API. Easiest — they solve the IP-blocking problem for you. **← set this one on day 1** |
| 2 | `PROXY_URL` | Fetches captions from YouTube directly, but routed through your **rotating residential proxy**. Format: `http://username:password@host:port` |
| 3 | `ALLOW_DIRECT_FETCH=true` | Fetches YouTube directly from the server's own IP. **Dev/local-testing only** — works from your home internet, gets blocked on any cloud host. Never set in production. |
| — | *(none set)* | Visitors see a friendly "not configured yet" message. |

If more than one is set, the higher-priority one wins (API > proxy > direct).

---

## Day-1 setup: Supadata (recommended)

1. Go to **https://supadata.ai** → Sign up (email, ~1 minute).
2. In their dashboard, copy your **API key**.
3. In Vercel: your project → **Settings → Environment Variables** → add
   `TRANSCRIPT_API_KEY` = *(your key)* → redeploy.

**Cost:** free tier ≈ **100 transcripts** to test with; the first paid tier is
around **$9/month for ~3,000 transcripts** — roughly **$0.003 per transcript**.
Ad revenue per visitor should comfortably beat that. (Check their pricing page —
plans shift occasionally.)

Alternative APIs that work the same way (swap the fetch in
`fetchViaSupadata` if you migrate): transcriptapi.com, youtube-transcript.io.

## Alternative: residential proxy (cheaper at high volume)

1. Sign up at **https://webshare.io** (cheapest entry, rotating residential
   from ~$4–7/month) or **https://decodo.com** (formerly Smartproxy, ~$7/month
   entry, pay-per-GB).
2. Create a **rotating residential** proxy endpoint and copy the credentials.
3. Set `PROXY_URL` in Vercel, e.g.
   `http://myuser:mypass@p.webshare.io:80`
4. Make sure `TRANSCRIPT_API_KEY` is **not** set (the API wins if both exist).

**Cost:** a transcript fetch is tiny (~50–200 KB), so 1 GB of proxy traffic ≈
**5,000–20,000 transcripts**. At ~$4–7/GB that's a fraction of a cent per
transcript — cheaper than the API at volume, but you maintain the YouTube
fetching code if YouTube changes something.

---

## Deploy to Vercel (5 minutes)

**Option A — from this folder (no GitHub needed):**
```bash
npx vercel          # first time: log in, accept the defaults
npx vercel --prod   # deploy to your live URL
```

**Option B — via GitHub:** push this folder to a repo, then on vercel.com →
**Add New → Project → Import** the repo → Deploy (no build settings needed;
Vercel auto-detects the static files and the `api/` function).

Then add your env var (above) under **Settings → Environment Variables** and
redeploy. That's it — the button works.

### Test locally first (free, no signup)

Your home internet is a residential IP, so direct fetching works from your PC —
no proxy or API key needed:

```bash
node dev-server.js                # then open http://localhost:3000
```

`dev-server.js` serves the pages and the API exactly like Vercel does, with
`ALLOW_DIRECT_FETCH` enabled automatically. (It's a local convenience only —
Vercel ignores it when you deploy.) Alternatively, `npx vercel dev` works too
if you put `ALLOW_DIRECT_FETCH=true` in a `.env.local` file.

---

## Renaming the site / setting your domain

The brand is a placeholder. When you have a name + domain, in each of the three
HTML files find-and-replace:

- `FreeTubeTools` → your site name
- `https://freetubetools.com` → your domain

(Each file has a `SITE IDENTITY` comment at the top of `<head>` marking the spot.)

## Adding a blog post (2 steps)

1. Copy `blog/turn-youtube-transcript-into-seo-article.html`, rename it
   (e.g. `blog/my-new-post.html`), and edit the content + the `<title>`,
   meta description, OG tags, and the Article JSON-LD dates/headline.
2. Open `blog/index.html`, find the `POSTS` array (marked
   `ADD NEW BLOG POSTS HERE`), and add one entry at the top.

## Adding a tool to "Discover more"

Open `index.html`, find the `TOOLS` array near the bottom, and edit it.
Set `href` to the tool's real path when it exists — cards with `href: '#'`
automatically show a "Coming soon" badge.

## Where to paste AdSense

Each page has **three clearly commented ad slots** — search any HTML file for
`ADSENSE SLOT`. Paste your ad unit code *inside* those `<div class="ad-slot">`
containers. They're pre-styled with a reserved minimum height so the page
doesn't jump when ads load. Locations:

- **Tool page:** below hero/results · between how-to and FAQ · above footer
- **Blog post:** after intro · mid-article · end of article
- **Blog index:** below header · above footer

## Optional: Translate & AI Summary features

The tool page also has **Translate** and **Summarize** buttons in the results
toolbar. Both are **off until you configure them** — with no env vars set,
clicking either shows a friendly "not configured yet" message and nothing is
charged. They're optional add-ons, not required to launch.

**Important difference from the core transcript feature:** the transcript
fetch (Supadata/proxy) is the only cost baked into your ad-revenue math from
day one. Translate and Summarize are each an *extra*, separate paid API call
— so before turning them on, read "Rate limiting & spend caps" below.

### Translate — DeepL API

1. Go to **https://www.deepl.com/pro-api** → sign up for the **Free** plan (no
   card required to start).
2. Copy your API key from the account dashboard — free-tier keys end in `:fx`.
3. In Vercel: **Settings → Environment Variables** → add `DEEPL_API_KEY` →
   redeploy.

**Cost:** free tier = **500,000 characters/month** (roughly 100–250 typical
transcripts, since each is ~2,000–5,000 characters), then about **$20–25 per
additional million characters** on the paid tier. Supports 18 languages in
this tool, including Arabic, Hindi, and Urdu.

### Summarize — Anthropic API (Claude Haiku)

1. Go to **https://console.anthropic.com** → sign up → **Settings → API Keys**
   → create a key.
2. In Vercel: add `ANTHROPIC_API_KEY` → redeploy.
3. Add a few dollars of credit on the **Billing** page — Anthropic requires
   prepaid credit before the API will respond.

**Cost:** uses Claude Haiku, the cheapest current Claude model. A typical
transcript summary costs roughly **$0.003–0.01 per summary** (a few tenths of
a cent) — a few dollars of credit covers hundreds of summaries.

### Rate limiting & spend caps — set this up BEFORE enabling either feature

Unlike the transcript fetch, Translate and Summarize cost you money **per
click with no revenue attached** (ads pay per impression, not per API call).
An honest traffic spike (going viral on Reddit) or a bot hammering the button
overnight can run up a real bill if nothing stops it. Both endpoints check two
independent guards before calling the paid API — both backed by a free Redis:

1. Go to **https://upstash.com** → sign up (free tier, generous — this tool
   uses a handful of commands per request).
2. Create a Redis database → copy the **REST URL** and **REST Token** from its
   dashboard.
3. In Vercel: add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` →
   redeploy.

With those two set, each feature enforces:

| Guard | Env var | Default | What it stops |
|---|---|---|---|
| Per-IP hourly limit | `TRANSLATE_PER_IP_HOURLY_LIMIT` | 10/hour | One visitor or bot script hammering the button |
| Per-IP hourly limit | `SUMMARIZE_PER_IP_HOURLY_LIMIT` | 10/hour | Same, for summaries |
| Site-wide daily cap | `DAILY_TRANSLATE_CAP` | 300/day | A viral spike draining your budget overnight |
| Site-wide daily cap | `DAILY_SUMMARIZE_CAP` | 300/day | Same, for summaries |

Raise or lower these by setting the env var to a different number — no code
changes needed. **If Upstash isn't configured, both guards fail open** (the
feature still works, just unprotected) so local testing isn't blocked by
setup — but don't leave it that way once the site is public and these keys
are live.

As a second layer of defense, also set spend/budget alerts directly in the
DeepL and Anthropic dashboards, so you get warned even if there's ever a bug
in this rate-limiting code.

## API reference

`GET /api/transcript?url=<youtube-url-or-video-id>&lang=<optional, e.g. es>`
→ `{ videoId, title, language, segments: [{ start, dur, text }] }`
(start/dur in seconds). Edge-cached 24 h.

`POST /api/translate` body `{ segments, targetLang }` (segments = the array
already returned by `/api/transcript`) → `{ language, segments }` translated.

`POST /api/summarize` body `{ text }` (the joined transcript text) →
`{ summary }` (plain text: short summary + bulleted key takeaways).

All three return `{ error: "friendly message" }` with a meaningful HTTP
status on failure (400 bad input, 429 rate-limited, 501 not configured, 502/503/504 upstream problems).
