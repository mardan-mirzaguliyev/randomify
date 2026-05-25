import User from '../models/User.js';
import List from '../models/List.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.slice(7);

    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch {
    return res.status(500).json({ message: 'Authentication failed' });
  }
}

export function requirePro(req, res, next) {
  const plan = req.user?.plan;
  if (plan === 'pro' || plan === 'lifetime') {
    return next();
  }
  return res.status(403).json({
    message: 'This feature requires a Pro plan',
    code: 'UPGRADE_REQUIRED',
  });
}

export function listAccess(ownerOnly = false) {
  return async (req, res, next) => {
    try {
      const list = await List.findById(req.params.listId);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const userId = req.user._id.toString();
      const isOwner = list.ownerId.toString() === userId;
      const isCollaborator = list.collaboratorIds.some(
        (id) => id.toString() === userId
      );

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (ownerOnly && !isOwner) {
        return res.status(403).json({ message: 'Owner access required' });
      }

      req.list = list;
      req.isOwner = isOwner;
      next();
    } catch {
      return res.status(500).json({ message: 'Failed to verify list access' });
    }
  };
}
