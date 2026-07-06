// api/summarize.js — generates an AI summary of an already-fetched transcript.
//
// Uses Claude Haiku (cheap, fast) via the Anthropic API. Costs real money per
// call, so it's protected by the same two guards as translate.js — see
// lib/ratelimit.js and the README "Rate limiting & spend caps" section before
// enabling this for public traffic.
//
// POST /api/summarize   body: { text: "full transcript text..." }
// -> { summary: "plain-text summary + key takeaways" }

'use strict';

const { checkIpLimit, checkDailyCap } = require('../lib/ratelimit');

const UPSTREAM_TIMEOUT = 30000;
const MAX_CHARS = 60000; // roughly a 2-hour video's worth of transcript
const MODEL = 'claude-haiku-4-5-20251001';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST /api/summarize.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({
      error: 'Summarization isn\'t configured yet. Site owner: set ANTHROPIC_API_KEY — see the README.',
    });
  }

  const body = await readJsonBody(req);
  const text = String(body.text || '').trim();

  if (!text) {
    return res.status(400).json({ error: 'No transcript text was sent to summarize.' });
  }
  if (text.length > MAX_CHARS) {
    return res.status(400).json({ error: 'This transcript is too long to summarize in one go.' });
  }

  // ── Cost guards: an abusive IP, then a site-wide daily ceiling ──────────
  const ipLimit = Number(process.env.SUMMARIZE_PER_IP_HOURLY_LIMIT) || 10;
  const dailyCap = Number(process.env.DAILY_SUMMARIZE_CAP) || 300;

  const ipCheck = await checkIpLimit(req, 'summarize', ipLimit);
  if (!ipCheck.allowed) {
    return res.status(429).json({ error: "You've hit the hourly summary limit. Please try again a bit later." });
  }
  const capCheck = await checkDailyCap('summarize', dailyCap);
  if (!capCheck.allowed) {
    return res.status(429).json({ error: "We've reached today's summary limit for the whole site. Please try again tomorrow." });
  }

  try {
    const summary = await summarizeWithClaude(text);
    return res.status(200).json({ summary });
  } catch (err) {
    if (err instanceof UserFacingError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('summarize error', err);
    return res.status(502).json({ error: 'Summarizing failed. Please try again in a moment.' });
  }
};

class UserFacingError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function summarizeWithClaude(transcriptText) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
  let resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content:
            'Summarize this YouTube video transcript for someone deciding whether to watch it. ' +
            'Write 2-3 sentences of plain-prose summary, then a blank line, then "Key takeaways:" ' +
            'followed by 3-6 bullet points (each starting with "- "). No preamble, no markdown headings.\n\n' +
            'Transcript:\n' + transcriptText,
        }],
      }),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new UserFacingError(504, 'Summarizing took too long. Please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (resp.status === 401 || resp.status === 403) {
    throw new UserFacingError(502, 'The summary service rejected our API key. Site owner: check ANTHROPIC_API_KEY.');
  }
  if (resp.status === 429) {
    throw new UserFacingError(503, "We've hit our summary quota. Please try again later.");
  }
  if (!resp.ok) {
    throw new UserFacingError(502, 'The summary service had a problem (' + resp.status + ').');
  }

  const data = await resp.json();
  const block = (data.content || []).find((c) => c.type === 'text');
  if (!block || !block.text) throw new UserFacingError(502, 'The summary service returned an empty response.');
  return block.text.trim();
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return {};
  }
}
