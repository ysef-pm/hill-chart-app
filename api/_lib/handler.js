// Shared POST-JSON wrapper for the MCC endpoints: auth, body parsing, errors.

import { AuthError, verifyUser } from './auth.js';

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

// Upstream SDK errors carry `status` and a request id; keep both in the message
// so a screenshot of the UI is enough to diagnose. `err.source` is set by
// tagErrors() in the module that made the call.
export function describeUpstream(err) {
  const source = err?.source || 'Upstream';
  const id = err?.requestId || err?.headers?.get?.('request-id');
  const status = typeof err?.status === 'number' ? ` ${err.status}` : '';
  let message = `${source}${status}: ${err?.message || 'request failed'}`;
  if (id) message += ` (request ${id})`;
  return message;
}

// Run fn, labelling any error it throws with the upstream service name.
export async function tagErrors(source, fn) {
  try {
    return await fn();
  } catch (err) {
    if (err && typeof err === 'object' && !err.source) err.source = source;
    throw err;
  }
}

export function postHandler(fn) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
    try {
      await verifyUser(req);
      const body = await readJson(req);
      return send(res, 200, await fn(body));
    } catch (err) {
      if (err instanceof AuthError) return send(res, 401, { error: err.message });
      if (err instanceof BadRequest) return send(res, 400, { error: err.message });
      console.error(err, err?.body ?? '');
      return send(res, 502, { error: describeUpstream(err) });
    }
  };
}

export class BadRequest extends Error {}

export function requireString(body, key, max = 2000) {
  const value = typeof body[key] === 'string' ? body[key].trim() : '';
  if (!value) throw new BadRequest(`"${key}" is required.`);
  if (value.length > max) throw new BadRequest(`"${key}" is too long.`);
  return value;
}

export function optionalString(body, key, max = 500) {
  const value = typeof body[key] === 'string' ? body[key].trim() : '';
  if (value.length > max) throw new BadRequest(`"${key}" is too long.`);
  return value || undefined;
}
