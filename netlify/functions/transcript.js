// netlify/functions/transcript.js
// Wraps the shared transcript logic for Netlify's function format.

const vercelHandler = require('../../api/transcript.js');

exports.handler = async function (event) {
  const query = event.queryStringParameters || {};

  let statusCode = 200;
  let headers = {};
  let body = '';

  const req = {
    method: event.httpMethod,
    query,
    headers: event.headers || {},
  };

  const res = {
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = JSON.stringify(data); return res; },
  };

  await vercelHandler(req, res);

  return { statusCode, headers, body };
};
