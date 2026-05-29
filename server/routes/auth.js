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

function clearRefreshCookie(res) {
  const { maxAge, ...options } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, options);
}

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          $each: [refreshToken],
          $slice: -MAX_REFRESH_TOKENS,
        },
      },
    }
  );

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
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findOneAndUpdate(
      { _id: payload.sub, refreshTokens: token },
      { $pull: { refreshTokens: token } },
      { new: false }
    ).select('+refreshTokens');

    if (!user) {
      await User.updateOne({ _id: payload.sub }, { $set: { refreshTokens: [] } });
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Token reuse detected — please log in again' });
    }

    const accessToken = await issueTokens(user, res);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', protect, async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];

    if (token) {
      await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: token } });
    }

    clearRefreshCookie(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
