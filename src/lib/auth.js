import { AUTH_SESSION_KEY, sha256 } from './utils';

export async function createSessionToken(passphrase) {
  return sha256(passphrase);
}

export async function verifyPassphrase(passphrase) {
  const secret = import.meta.env.VITE_AUTH_KEY || '';
  if (!secret) {
    return false;
  }
  return passphrase === secret;
}

export async function storeAdminSession(passphrase) {
  const token = await createSessionToken(passphrase);
  sessionStorage.setItem(AUTH_SESSION_KEY, token);
  return token;
}

export function clearAdminSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export async function isStoredSessionValid() {
  const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
  const secret = import.meta.env.VITE_AUTH_KEY || '';
  if (!stored || !secret) {
    return false;
  }
  const expected = await createSessionToken(secret);
  return stored === expected;
}
