import express from 'express';
import User from '../models/User.js';
import List from '../models/List.js';
import Pick from '../models/Pick.js';
import BlogPost from '../models/BlogPost.js';
import { protect, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(protect, adminAuth);

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLists = await List.countDocuments();
    const totalPicks = await Pick.countDocuments();
    const activeSubscriptions = await User.countDocuments({
      plan: { $in: ['pro', 'lifetime'] }
    });
    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });

    res.json({
      totalUsers,
      totalLists,
      totalPicks,
      activeSubscriptions,
      totalPosts,
      publishedPosts
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Also delete user's lists and picks
    await List.deleteMany({ ownerId: req.params.id });
    await Pick.deleteMany({ pickedBy: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all lists
router.get('/lists', async (req, res) => {
  try {
    const lists = await List.find()
      .populate('ownerId', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

// Delete list
router.delete('/lists/:id', async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.id);
    await Pick.deleteMany({ listId: req.params.id });
    
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete list' });
  }
});

export default router;
