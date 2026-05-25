import jwt from 'jsonwebtoken';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '30d';

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export const REFRESH_COOKIE = 'refreshToken';

export function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}
