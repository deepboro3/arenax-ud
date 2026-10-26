const CREDENTIALS_KEY = 'arenax.credentials.demo';
const ITERATIONS = 150_000;

function readCredentials() {
  try { return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}'); } catch { return {}; }
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
}

export async function verifyOrCreateDemoPassword(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const credentials = readCredentials();
  const existing = credentials[normalizedEmail];
  if (existing) {
    const salt = Uint8Array.from(atob(existing.salt), (character) => character.charCodeAt(0));
    const digest = await derive(password, salt);
    return toBase64(digest) === existing.hash;
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  credentials[normalizedEmail] = { salt: toBase64(salt), hash: toBase64(await derive(password, salt)) };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  return true;
}

export async function changeDemoPassword(email, currentPassword, newPassword) {
  if (!await verifyOrCreateDemoPassword(email, currentPassword)) return false;
  const credentials = readCredentials();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  credentials[email.trim().toLowerCase()] = { salt: toBase64(salt), hash: toBase64(await derive(newPassword, salt)) };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  return true;
}
