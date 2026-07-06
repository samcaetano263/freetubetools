// api/transcript.js — the one serverless function behind the transcript tool.
//
// YouTube blocks caption requests coming from datacenter IPs (Vercel, Netlify,
// any VPS), so this function NEVER naively fetches from the server's own IP in
// production. Instead it picks a caption source at runtime from env vars:
//
//   1. TRANSCRIPT_API_KEY set  -> Supadata transcript API (recommended, easiest)
//   2. PROXY_URL set           -> YouTube Innertube, routed through a rotating
//                                 residential proxy (supports http://user:pass@host:port)
//   3. ALLOW_DIRECT_FETCH=true -> YouTube Innertube straight from this machine.
//                                 *** DEV ONLY. Works from a home/residential IP,
//                                 WILL get blocked on a cloud server. Never set
//                                 this in production. ***
//   4. none set                -> friendly 501 telling the site owner to configure one.
//
// Response shape (identical for every source, the frontend depends on it):
//   { videoId, title, language, segments: [{ start, dur, text }] }

'use strict';

// How long we give any upstream request before giving up (ms)
const UPSTREAM_TIMEOUT = 10000;

// A YouTube video ID is exactly 11 chars from this alphabet
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

module.exports = async function handler(req, res) {
  // CORS + basic headers — the page and API live on the same origin in
  // production, but this keeps local testing painless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed. Use GET /api/transcript?url=...');
  }

  // Accept either a full YouTube URL or a bare 11-char video ID
  const raw = (req.query && (req.query.url || req.query.videoId)) || '';
  const videoId = extractVideoId(String(raw));
  if (!videoId) {
    return sendError(res, 400,
      "That doesn't look like a YouTube link. Paste a full video URL, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }

  const lang = sanitizeLang(req.query && req.query.lang);

  try {
    let result;
    if (process.env.TRANSCRIPT_API_KEY) {
      result = await fetchViaSupadata(videoId, lang);
    } else if (process.env.PROXY_URL) {
      result = await fetchViaInnertube(videoId, lang, process.env.PROXY_URL);
    } else if (process.env.ALLOW_DIRECT_FETCH === 'true') {
      // DEV ONLY — direct fetch from this machine's own IP (see header comment)
      result = await fetchViaInnertube(videoId, lang, null);
    } else {
      return sendError(res, 501,
        'The transcript service is not configured yet. Site owner: set TRANSCRIPT_API_KEY or PROXY_URL — see the README.');
    }
    // Cache successful transcripts at the edge for a day — they rarely change
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof UserFacingError) {
      return sendError(res, err.status, err.message);
    }
    console.error('transcript error for', videoId, err);
    return sendError(res, 502,
      "Something went wrong fetching this transcript. Please try again in a moment — if it keeps failing, the video may not have captions.");
  }
};

// Errors whose message is safe and useful to show the visitor
class UserFacingError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// Parse the video ID out of any YouTube URL shape we might get
// (watch?v=, youtu.be/, /shorts/, /embed/, /live/, extra params, bare ID)
function extractVideoId(input) {
  const trimmed = input.trim();
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  let url;
  try {
    // Tolerate links pasted without a protocol
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (!/(^|\.)youtube\.com$|^youtu\.be$|^youtube-nocookie\.com$/.test(host)) return null;

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1] || '';
    return VIDEO_ID_RE.test(id) ? id : null;
  }
  // youtube.com/watch?v=<id>
  const v = url.searchParams.get('v');
  if (v && VIDEO_ID_RE.test(v)) return v;
  // youtube.com/shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
  const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Keep the lang param to a simple BCP-47-ish token so it can't smuggle anything
function sanitizeLang(lang) {
  if (typeof lang !== 'string') return '';
  return /^[a-zA-Z-]{2,10}$/.test(lang) ? lang : '';
}

/* ── Source 1: Supadata transcript API ──────────────────────────────────── */

// Fetch the transcript from Supadata and normalize it to our segment shape
async function fetchViaSupadata(videoId, lang) {
  const params = new URLSearchParams({ url: 'https://www.youtube.com/watch?v=' + videoId });
  if (lang) params.set('lang', lang);

  const resp = await timedFetch('https://api.supadata.ai/v1/transcript?' + params, {
    headers: { 'x-api-key': process.env.TRANSCRIPT_API_KEY },
  });

  if (resp.status === 404 || resp.status === 206) {
    throw new UserFacingError(404, "This video doesn't have a transcript available. It may have captions disabled, or be private/removed.");
  }
  if (resp.status === 401 || resp.status === 403) {
    throw new UserFacingError(502, 'The transcript service rejected our API key. Site owner: check TRANSCRIPT_API_KEY.');
  }
  if (resp.status === 429) {
    throw new UserFacingError(503, "We're a bit busy right now (transcript quota reached). Please try again shortly.");
  }
  if (!resp.ok) {
    throw new UserFacingError(502, 'The transcript service had a problem (' + resp.status + '). Please try again.');
  }

  const data = await resp.json();
  const content = Array.isArray(data.content) ? data.content : [];
  if (!content.length) {
    throw new UserFacingError(404, "This video doesn't have a transcript available.");
  }

  return {
    videoId,
    title: data.title || '',
    language: data.lang || lang || '',
    // Supadata offsets/durations are in milliseconds — normalize to seconds
    segments: content
      .map((c) => ({
        start: (Number(c.offset) || 0) / 1000,
        dur: (Number(c.duration) || 0) / 1000,
        text: String(c.text || '').trim(),
      }))
      .filter((s) => s.text),
  };
}

/* ── Source 2/3: YouTube Innertube (via proxy, or direct in dev) ────────── */

// Ask YouTube's internal player endpoint for the caption track list, then
// download the chosen track as JSON3 and normalize it. The Android client
// context is used because it reliably returns caption URLs.
async function fetchViaInnertube(videoId, lang, proxyUrl) {
  const dispatcher = proxyUrl ? makeProxyDispatcher(proxyUrl) : undefined;

  const playerResp = await timedFetch(
    'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
    {
      method: 'POST',
      dispatcher,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.38',
            androidSdkVersion: 34,
            hl: 'en',
          },
        },
        videoId,
      }),
    }
  );

  if (!respLooksBlocked(playerResp) && !playerResp.ok) {
    throw new UserFacingError(502, 'YouTube had a problem answering (' + playerResp.status + '). Please try again.');
  }

  const player = await playerResp.json().catch(() => {
    throw new UserFacingError(502, 'YouTube sent an unreadable response. Please try again.');
  });

  const status = player.playabilityStatus && player.playabilityStatus.status;
  if (status === 'ERROR') {
    throw new UserFacingError(404, "We couldn't find that video. Double-check the link — it may have been removed.");
  }
  if (status === 'LOGIN_REQUIRED' || status === 'UNPLAYABLE' || status === 'AGE_CHECK_REQUIRED') {
    throw new UserFacingError(403, 'This video is private, age-restricted, or otherwise unavailable, so its transcript can\'t be fetched.');
  }

  const tracks =
    (player.captions &&
      player.captions.playerCaptionsTracklistRenderer &&
      player.captions.playerCaptionsTracklistRenderer.captionTracks) ||
    [];
  if (!tracks.length) {
    throw new UserFacingError(404, "This video doesn't have captions, so there's no transcript to fetch. (The uploader may have disabled them.)");
  }

  // Pick the caption track: requested language -> English -> first available
  const track =
    (lang && tracks.find((t) => t.languageCode === lang)) ||
    (lang && tracks.find((t) => (t.languageCode || '').startsWith(lang.split('-')[0]))) ||
    tracks.find((t) => (t.languageCode || '').startsWith('en')) ||
    tracks[0];

  const trackUrl = new URL(track.baseUrl);
  trackUrl.searchParams.set('fmt', 'json3');

  const capResp = await timedFetch(trackUrl.toString(), {
    dispatcher,
    headers: { 'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip' },
  });
  if (!capResp.ok) {
    throw new UserFacingError(502, 'YouTube refused to hand over the captions (' + capResp.status + '). Please try again.');
  }

  const json3 = await capResp.json().catch(() => {
    throw new UserFacingError(502, 'YouTube sent captions in a format we couldn\'t read. Please try again.');
  });

  // json3 events -> our segments. Each event has tStartMs/dDurationMs and segs[]
  const segments = (json3.events || [])
    .filter((e) => Array.isArray(e.segs))
    .map((e) => ({
      start: (Number(e.tStartMs) || 0) / 1000,
      dur: (Number(e.dDurationMs) || 0) / 1000,
      text: e.segs.map((s) => s.utf8 || '').join('').replace(/\n/g, ' ').trim(),
    }))
    .filter((s) => s.text);

  if (!segments.length) {
    throw new UserFacingError(404, "This video's caption track turned out to be empty — there's no transcript to show.");
  }

  const title = (player.videoDetails && player.videoDetails.title) || '';
  return { videoId, title, language: track.languageCode || '', segments };
}

// Detect the classic symptom of a blocked datacenter IP so the error can say so
function respLooksBlocked(resp) {
  return resp.status === 403 || resp.status === 429;
}

// Build an undici ProxyAgent for PROXY_URL (handles user:pass@host auth)
function makeProxyDispatcher(proxyUrl) {
  const { ProxyAgent } = require('undici');
  return new ProxyAgent(proxyUrl);
}

// fetch() with a hard timeout so a stalled upstream can't hang the function
async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new UserFacingError(504, 'The transcript source took too long to answer. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Exported for tests
module.exports.extractVideoId = extractVideoId;
