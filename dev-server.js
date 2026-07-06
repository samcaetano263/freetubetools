// dev-server.js — tiny local server for testing WITHOUT deploying.
// Serves the static pages and wires /api/transcript to the real function,
// exactly like Vercel will in production. Not used in deployment.
//
//   Run:   node dev-server.js     then open http://localhost:3000
//
// It enables ALLOW_DIRECT_FETCH so transcripts work from your home IP
// with no proxy or API key. (In production, set real env vars instead.)

'use strict';
process.env.ALLOW_DIRECT_FETCH = process.env.ALLOW_DIRECT_FETCH || 'true';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROUTES = {
  '/api/transcript': require('./api/transcript.js'),
  '/api/translate': require('./api/translate.js'),
  '/api/summarize': require('./api/summarize.js'),
};

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // Route the APIs exactly like Vercel does
  const handler = ROUTES[url.pathname];
  if (handler) {
    // req is already a readable stream (for the JSON-body POST routes) — just
    // attach the parsed query string so it looks like Vercel's request object
    req.query = Object.fromEntries(url.searchParams);
    const shim = {
      setHeader: (k, v) => res.setHeader(k, v),
      status(c) { res.statusCode = c; return shim; },
      json(b) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); return shim; },
    };
    return handler(req, shim);
  }

  // Static files, with directory -> index.html
  let file = path.join(__dirname, decodeURIComponent(url.pathname));
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  if (!file.startsWith(__dirname)) { res.statusCode = 403; return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(3000, () => console.log('Dev server running → http://localhost:3000'));
