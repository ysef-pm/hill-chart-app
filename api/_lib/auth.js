// Verifies the caller's Firebase ID token so only signed-in DevCom users can
// spend Anthropic / TypeSafe credits. No service account needed: tokens are
// checked against Google's public signing keys.

import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

export class AuthError extends Error {}

export async function verifyUser(req) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not configured.');

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Sign in to use this tool.');

  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    }));
  } catch {
    throw new AuthError('Your session has expired. Sign in again.');
  }

  // Optional allowlist, e.g. MCC_ALLOWED_EMAILS="you@x.com,@yourcompany.com"
  const allowed = (process.env.MCC_ALLOWED_EMAILS || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const email = String(payload.email || '').toLowerCase();
  if (allowed.length && !allowed.some((a) => (a.startsWith('@') ? email.endsWith(a) : email === a))) {
    throw new AuthError('Your account is not allowed to use the MCC Finder.');
  }
  return payload;
}
