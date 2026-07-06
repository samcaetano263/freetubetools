// lib/ratelimit.js — shared cost-control helpers for the paid AI features
// (translate, summarize). These call real per-request-billed APIs, so unlike
// the free transcript fetch, an unmetered spike here turns directly into a
// credit-card bill. Two independent guards, both backed by Upstash Redis
// (a free-tier REST-based Redis — https://upstash.com, no npm client needed):
//
//   1. Per-IP hourly limit  — stops a single abusive visitor/bot/script.
//   2. Daily global cap     — stops an honest traffic spike (going viral)
//                              from draining the budget while nobody's watching.
//
// If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN aren't set, both guards
// fail OPEN (requests are allowed) so local dev keeps working without setup —
// see the README "Rate limiting & spend caps" section before enabling these
// features for real public traffic.

'use strict';

function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// INCR a key via the Upstash REST API and EXPIRE it the first time it's set.
// Returns the counter's new value, or null if Upstash isn't configured.
async function incrWithExpiry(key, windowSeconds) {
  if (!upstashConfigured()) return null;

  const base = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '');
  const auth = { Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN };

  const incrResp = await fetch(base + '/incr/' + encodeURIComponent(key), { headers: auth });
  if (!incrResp.ok) return null; // fail open on Upstash outage rather than blocking every request
  const { result } = await incrResp.json();

  if (result === 1) {
    // First hit in this window — set the window to expire so the counter resets
    await fetch(base + '/expire/' + encodeURIComponent(key) + '/' + windowSeconds, { headers: auth }).catch(() => {});
  }
  return result;
}

// Extract the visitor's IP from Vercel's forwarded-for header
function getClientIp(req) {
  const fwd = (req.headers && req.headers['x-forwarded-for']) || '';
  return String(fwd).split(',')[0].trim() || 'unknown';
}

// Enforce "at most `limit` calls per hour from this IP, for this feature".
// Returns { allowed, skipped } — skipped=true means Upstash isn't configured.
async function checkIpLimit(req, feature, limit) {
  const ip = getClientIp(req);
  const count = await incrWithExpiry(`rl:${feature}:${ip}`, 3600);
  if (count === null) return { allowed: true, skipped: true };
  return { allowed: count <= limit, skipped: false };
}

// Enforce "at most `limit` calls per calendar day, site-wide, for this feature".
// This is the guard that protects Sam's budget if the site goes viral overnight.
async function checkDailyCap(feature, limit) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const count = await incrWithExpiry(`cap:${feature}:${today}`, 60 * 60 * 26); // outlive the day, self-cleans
  if (count === null) return { allowed: true, skipped: false };
  return { allowed: count <= limit, skipped: false };
}

module.exports = { checkIpLimit, checkDailyCap, getClientIp, upstashConfigured };
