import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * STRICT OWNER ALLOWLIST:
 * Only these two email addresses are authorized to access the VELNIX.WEAR Owner Dashboard.
 * Hard-restricted on the backend. Cannot be modified or added to via frontend.
 */
export const AUTHORIZED_OWNER_EMAILS = [
  'ds694206968@gmail.com',
  'kambhampallivinay1@gmail.com'
] as const;

export type AuthorizedOwnerEmail = typeof AUTHORIZED_OWNER_EMAILS[number];

/**
 * Safely normalize email string: trim whitespace and lowercase.
 */
export function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Backend allowlist verification.
 * Rejects every email that does not strictly match one of the two pre-approved addresses.
 */
export function isAuthorizedOwnerEmail(email: unknown): email is AuthorizedOwnerEmail {
  const normalized = normalizeEmail(email);
  return (AUTHORIZED_OWNER_EMAILS as readonly string[]).includes(normalized);
}

// In-memory Active Owner Sessions
export interface OwnerSession {
  token: string;
  email: string;
  ownerId: string;
  ownerName: string;
  createdAt: number;
  expiresAt: number; // 24 hours
}

const sessionStore = new Map<string, OwnerSession>();
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Password hashing constants
const HASH_ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

interface OwnerCredential {
  email: string;
  salt: string;
  hash: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'owner_credentials.json');

// Initial default password (hashed securely on first launch; never stored in plaintext)
const DEFAULT_INITIAL_PASSWORD = 'VelnixOwner@2026';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
}

function loadCredentials(): Record<string, OwnerCredential> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Auth] Error reading credentials file:', err);
  }

  // Initialize secure credentials for both authorized owner accounts
  const initialCredentials: Record<string, OwnerCredential> = {};
  for (const ownerEmail of AUTHORIZED_OWNER_EMAILS) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(DEFAULT_INITIAL_PASSWORD, salt);
    initialCredentials[ownerEmail] = {
      email: ownerEmail,
      salt,
      hash,
      updatedAt: new Date().toISOString()
    };
  }

  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(initialCredentials, null, 2), 'utf-8');
    console.log('[Auth] Initialized secure salted credentials for authorized owners in data/owner_credentials.json');
  } catch (err) {
    console.error('[Auth] Failed to write initial credentials file:', err);
  }

  return initialCredentials;
}

function saveCredentials(creds: Record<string, OwnerCredential>): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
}

/**
 * Verify owner password securely on backend with timing-safe comparison.
 * Strictly checks backend allowlist.
 */
export function verifyOwnerPassword(rawEmail: string, rawPassword: string): {
  success: boolean;
  token: string;
  ownerEmail: string;
} {
  const normalized = normalizeEmail(rawEmail);

  // 1. Strict Allowlist check - reject all non-authorized emails
  if (!isAuthorizedOwnerEmail(normalized)) {
    throw new Error('Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.');
  }

  if (!rawPassword || typeof rawPassword !== 'string') {
    throw new Error('Password is required.');
  }

  const credentials = loadCredentials();
  const userCred = credentials[normalized];

  if (!userCred || !userCred.salt || !userCred.hash) {
    throw new Error('Owner credentials not configured. Please initialize your password.');
  }

  // 2. Compute PBKDF2 hash with stored salt
  const computedHash = hashPassword(rawPassword, userCred.salt);

  // 3. Constant-time comparison to prevent timing attacks
  const storedBuf = Buffer.from(userCred.hash, 'hex');
  const computedBuf = Buffer.from(computedHash, 'hex');

  if (storedBuf.length !== computedBuf.length || !crypto.timingSafeEqual(storedBuf, computedBuf)) {
    throw new Error('Invalid owner credentials. Please check your password and try again.');
  }

  // 4. Create cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: OwnerSession = {
    token,
    email: normalized,
    ownerId: normalized === 'kambhampallivinay1@gmail.com' ? 'vinay' : 'ds-owner',
    ownerName: normalized === 'kambhampallivinay1@gmail.com' ? 'Vinay Kambhampalli' : 'Co-Owner (ds694206968)',
    createdAt: now,
    expiresAt: now + SESSION_EXPIRY_MS
  };

  sessionStore.set(token, session);

  return {
    success: true,
    token,
    ownerEmail: normalized
  };
}

/**
 * Setup or reset owner password securely.
 */
export function setupOrUpdateOwnerPassword(
  rawEmail: string,
  newPassword: string,
  currentPassword?: string
): { success: boolean; message: string } {
  const normalized = normalizeEmail(rawEmail);

  if (!isAuthorizedOwnerEmail(normalized)) {
    throw new Error('Access Denied: Owner access is strictly restricted to pre-approved VELNIX.WEAR owner email addresses.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters in length.');
  }

  const credentials = loadCredentials();
  const currentCred = credentials[normalized];

  // If a password already exists and currentPassword is provided, verify it
  if (currentCred && currentPassword) {
    const computedHash = hashPassword(currentPassword, currentCred.salt);
    const storedBuf = Buffer.from(currentCred.hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (storedBuf.length !== computedBuf.length || !crypto.timingSafeEqual(storedBuf, computedBuf)) {
      throw new Error('Current password does not match.');
    }
  }

  // Generate fresh salt and compute PBKDF2 hash
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(newPassword, salt);

  credentials[normalized] = {
    email: normalized,
    salt,
    hash,
    updatedAt: new Date().toISOString()
  };

  saveCredentials(credentials);

  return {
    success: true,
    message: `Password updated successfully for authorized owner ${normalized}.`
  };
}

/**
 * Validate active owner session token.
 */
export function validateOwnerSession(token?: string): OwnerSession | null {
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }

  // Double-check allowlist integrity
  if (!isAuthorizedOwnerEmail(session.email)) {
    sessionStore.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidate session on logout.
 */
export function invalidateOwnerSession(token: string): boolean {
  return sessionStore.delete(token);
}

// Deprecated OTP handlers kept for legacy compatibility if called, but indicate OTP is disabled
export async function requestOwnerOtp(rawEmail: string) {
  const normalized = normalizeEmail(rawEmail);
  if (!isAuthorizedOwnerEmail(normalized)) {
    throw new Error('Unauthorized: This email address is not in the pre-approved VELNIX.WEAR owner allowlist.');
  }
  return {
    success: false,
    message: 'OTP login has been replaced with password-based authentication. Please sign in using your owner password.',
    resendCooldownSeconds: 0,
    expiresInSeconds: 0
  };
}

export function verifyOwnerOtp() {
  throw new Error('OTP login has been replaced with password-based authentication. Please sign in using your owner password.');
}
