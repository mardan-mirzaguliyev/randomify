import { Router } from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../utils/tokens.js';

const router = Router();
const MAX_REFRESH_TOKENS = 5;

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const userWithTokens = await User.findById(user._id).select('+refreshTokens');
  let tokens = [...(userWithTokens.refreshTokens || []), refreshToken];
  if (tokens.length > MAX_REFRESH_TOKENS) {
    tokens = tokens.slice(-MAX_REFRESH_TOKENS);
  }
  userWithTokens.refreshTokens = tokens;
  await userWithTokens.save();

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Email, password, and display name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
    });

    const accessToken = await issueTokens(user, res);
    res.status(201).json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = await issueTokens(user, res);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.refreshTokens.includes(token)) {
      user.refreshTokens = [];
      await user.save();
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
      return res.status(401).json({ message: 'Token reuse detected — please log in again' });
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();

    const accessToken = await issueTokens(user, res);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', protect, async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    const user = await User.findById(req.user._id).select('+refreshTokens');

    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }

    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
