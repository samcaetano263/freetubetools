// api/translate.js — translates an already-fetched transcript via DeepL.
//
// This runs AFTER a transcript is already on screen (the frontend sends the
// segments it already has), so it never re-fetches from YouTube. It costs
// real money per call (DeepL bills per character), so it's protected by the
// same two guards as summarize.js — see lib/ratelimit.js and the README
// "Rate limiting & spend caps" section before enabling this for public traffic.
//
// POST /api/translate   body: { segments: [{start,dur,text}], targetLang: "es" }
// -> { language, segments: [{start,dur,text}] }  (same shape, translated text)

'use strict';

const { checkIpLimit, checkDailyCap } = require('../lib/ratelimit');

const UPSTREAM_TIMEOUT = 15000;
const MAX_SEGMENTS = 2000; // sanity ceiling — no real transcript is this long

// Languages exposed in the frontend dropdown -> DeepL target codes
const SUPPORTED_LANGS = {
  es: 'ES', fr: 'FR', de: 'DE', pt: 'PT-PT', it: 'IT', nl: 'NL', pl: 'PL',
  ru: 'RU', tr: 'TR', ar: 'AR', hi: 'HI', ur: 'UR', ja: 'JA', ko: 'KO',
  zh: 'ZH', vi: 'VI', id: 'ID', en: 'EN-US',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST /api/translate.' });
  }

  if (!process.env.DEEPL_API_KEY) {
    return res.status(501).json({
      error: 'Translation isn\'t configured yet. Site owner: set DEEPL_API_KEY — see the README.',
    });
  }

  const body = await readJsonBody(req);
  const segments = Array.isArray(body.segments) ? body.segments : null;
  const targetLang = SUPPORTED_LANGS[String(body.targetLang || '').toLowerCase()];

  if (!segments || !segments.length) {
    return res.status(400).json({ error: 'No transcript text was sent to translate.' });
  }
  if (segments.length > MAX_SEGMENTS) {
    return res.status(400).json({ error: 'This transcript is too long to translate in one go.' });
  }
  if (!targetLang) {
    return res.status(400).json({ error: 'Pick a supported target language from the dropdown.' });
  }

  // ── Cost guards: an abusive IP, then a site-wide daily ceiling ──────────
  const ipLimit = Number(process.env.TRANSLATE_PER_IP_HOURLY_LIMIT) || 10;
  const dailyCap = Number(process.env.DAILY_TRANSLATE_CAP) || 300;

  const ipCheck = await checkIpLimit(req, 'translate', ipLimit);
  if (!ipCheck.allowed) {
    return res.status(429).json({ error: "You've hit the hourly translation limit. Please try again a bit later." });
  }
  const capCheck = await checkDailyCap('translate', dailyCap);
  if (!capCheck.allowed) {
    return res.status(429).json({ error: "We've reached today's translation limit for the whole site. Please try again tomorrow." });
  }

  try {
    const translatedTexts = await translateBatch(
      segments.map((s) => String(s.text || '')),
      targetLang
    );
    const translated = segments.map((s, i) => ({ start: s.start, dur: s.dur, text: translatedTexts[i] ?? s.text }));
    return res.status(200).json({ language: targetLang, segments: translated });
  } catch (err) {
    if (err instanceof UserFacingError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('translate error', err);
    return res.status(502).json({ error: 'Translation failed. Please try again in a moment.' });
  }
};

class UserFacingError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// DeepL free-tier keys end in ":fx" and must hit the free API host
function deeplHost(key) {
  return key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
}

// One DeepL call per transcript: send every segment as its own `text` param
// so segment boundaries (and therefore timestamps) are preserved.
async function translateBatch(texts, targetLang) {
  const params = new URLSearchParams();
  for (const t of texts) params.append('text', t);
  params.set('target_lang', targetLang);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
  let resp;
  try {
    resp = await fetch(deeplHost(process.env.DEEPL_API_KEY) + '/v2/translate', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: 'DeepL-Auth-Key ' + process.env.DEEPL_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new UserFacingError(504, 'Translation took too long. Please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (resp.status === 403) throw new UserFacingError(502, 'The translation service rejected our API key. Site owner: check DEEPL_API_KEY.');
  if (resp.status === 429 || resp.status === 456) throw new UserFacingError(503, "We've hit our translation quota. Please try again later.");
  if (!resp.ok) throw new UserFacingError(502, 'The translation service had a problem (' + resp.status + ').');

  const data = await resp.json();
  return (data.translations || []).map((t) => t.text);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // Vercel already parses JSON bodies
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return {};
  }
}

module.exports.SUPPORTED_LANGS = SUPPORTED_LANGS;
