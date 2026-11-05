import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function getAdminSecret(): string {
  return process.env.ADMIN_PASSWORD || 'begena2026';
}

/**
 * Constant-time comparison between input and configured admin password.
 * Uses SHA-256 digests so both buffers are guaranteed equal length (32 bytes),
 * preventing timing side-channel attacks.
 */
export function verifyAdminPassword(inputPassword: string | undefined | null): boolean {
  if (typeof inputPassword !== 'string' || !inputPassword) {
    return false;
  }
  const expectedPassword = getAdminSecret();
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedPassword).digest();
  return crypto.timingSafeEqual(inputHash, expectedHash);
}

/**
 * Generates a signed cryptographic admin token valid for 7 days.
 */
export function generateAdminToken(): string {
  const payload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAdminSecret())
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Validates a signed admin token.
 */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getAdminSecret())
      .update(payloadBase64)
      .digest('base64url');

    const sigHash = crypto.createHash('sha256').update(signature).digest();
    const expHash = crypto.createHash('sha256').update(expectedSignature).digest();
    if (!crypto.timingSafeEqual(sigHash, expHash)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    if (payload.role !== 'admin') {
      return false;
    }

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts Bearer token from Authorization request header.
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Express middleware to restrict sensitive routes strictly to authenticated curators.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication required to access this resource.',
    });
  }
  next();
}

