import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../utils/tokens.js';
import { MAX_REFRESH_TOKENS } from '../utils/constants.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

function clearRefreshCookie(res) {
  const { maxAge, ...options } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, options);
}

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user._id, user.role);
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

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Email, password, and display name are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
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

router.post('/login', authLimiter, async (req, res, next) => {
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

// One-time endpoint: promotes the authenticated user to admin if no admins
// exist yet in the database. Disabled automatically after the first admin
// is created, so it is safe to leave in place.
router.post('/claim-admin', protect, async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(409).json({ message: 'An admin account already exists.' });
    }

    req.user.role = 'admin';
    req.user.plan = 'lifetime';
    await req.user.save();

    res.json({ message: 'You are now an admin.', user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond OK to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = tokenHash;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: send email with reset link containing rawToken
    // In production wire this to your email provider (e.g. Resend, SendGrid)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry +refreshTokens');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.passwordHash = await User.hashPassword(password);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.refreshTokens = []; // invalidate all sessions on password reset
    await user.save();

    clearRefreshCookie(res);
    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.refreshTokens = []; // invalidate all other sessions
    await user.save();

    clearRefreshCookie(res);
    res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
});

export default router;
