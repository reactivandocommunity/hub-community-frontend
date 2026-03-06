import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  willTokenExpireSoon,
} from '../jwt';

// Helper: create a valid JWT with a given payload
function createJWT(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

const NOW_SECONDS = 1750000000; // a fixed unix timestamp

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW_SECONDS * 1000));
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── decodeToken ───────────────────────────────────────────────────
describe('decodeToken', () => {
  it('decodes a valid JWT payload', () => {
    const token = createJWT({ sub: 'user-123', exp: NOW_SECONDS + 3600 });
    const payload = decodeToken(token);
    expect(payload).toEqual({
      sub: 'user-123',
      exp: NOW_SECONDS + 3600,
    });
  });

  it('returns null for a completely invalid token', () => {
    expect(decodeToken('not.a.jwt')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeToken('')).toBeNull();
  });
});

// ─── isTokenExpired ────────────────────────────────────────────────
describe('isTokenExpired', () => {
  it('returns false when token is still valid', () => {
    const token = createJWT({ exp: NOW_SECONDS + 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('returns true when token has expired', () => {
    const token = createJWT({ exp: NOW_SECONDS - 100 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true when token has no exp claim', () => {
    const token = createJWT({ sub: 'user-123' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for an invalid token', () => {
    expect(isTokenExpired('invalid')).toBe(true);
  });
});

// ─── getTokenExpiration ────────────────────────────────────────────
describe('getTokenExpiration', () => {
  it('returns the exp timestamp from a valid token', () => {
    const exp = NOW_SECONDS + 7200;
    const token = createJWT({ exp });
    expect(getTokenExpiration(token)).toBe(exp);
  });

  it('returns null when token has no exp', () => {
    const token = createJWT({ sub: 'user' });
    expect(getTokenExpiration(token)).toBeNull();
  });

  it('returns null for an invalid token', () => {
    expect(getTokenExpiration('broken')).toBeNull();
  });
});

// ─── willTokenExpireSoon ───────────────────────────────────────────
describe('willTokenExpireSoon', () => {
  it('returns false when token expires well in the future', () => {
    const token = createJWT({ exp: NOW_SECONDS + 3600 }); // 1h left
    expect(willTokenExpireSoon(token, 300)).toBe(false);
  });

  it('returns true when token expires within the threshold', () => {
    const token = createJWT({ exp: NOW_SECONDS + 200 }); // 200s left, threshold 300s
    expect(willTokenExpireSoon(token, 300)).toBe(true);
  });

  it('returns true when token is already expired', () => {
    const token = createJWT({ exp: NOW_SECONDS - 10 });
    expect(willTokenExpireSoon(token)).toBe(true);
  });

  it('uses default 300s threshold', () => {
    const token = createJWT({ exp: NOW_SECONDS + 299 });
    expect(willTokenExpireSoon(token)).toBe(true);

    const token2 = createJWT({ exp: NOW_SECONDS + 301 });
    expect(willTokenExpireSoon(token2)).toBe(false);
  });

  it('returns true for an invalid token', () => {
    expect(willTokenExpireSoon('garbage')).toBe(true);
  });
});
