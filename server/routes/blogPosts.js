import { Router } from 'express';
import BlogPost from '../models/BlogPost.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// --- Public, unauthenticated endpoints for the visitor-facing blog ---
// Declared before `protect` so they remain open to anonymous visitors.
router.get('/public', async (req, res, next) => {
  try {
    const posts = await BlogPost.find({ status: 'published' }).sort({ publishedAt: -1 });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

router.get('/public/:id', async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ _id: req.params.id, status: 'published' });
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ post });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    next(err);
  }
});

// Everything below requires authentication.
router.use(protect);

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  return [];
}

// Admins can manage any post; regular users are scoped to their own.
async function findManageablePost(req, res, next) {
  try {
    const query = { _id: req.params.postId };
    if (req.user.role !== 'admin') {
      query.authorId = req.user._id;
    }

    const post = await BlogPost.findOne(query);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    req.blogPost = post;
    next();
  } catch (err) {
    next(err);
  }
}

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { authorId: req.user._id };
    const posts = await BlogPost.find(filter).sort({ updatedAt: -1 });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const post = await BlogPost.create({
      authorId: req.user._id,
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status,
      category: req.body.category,
      coverImage: req.body.coverImage,
      tags: normalizeTags(req.body.tags),
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

router.get('/:postId', findManageablePost, (req, res) => {
  res.json({ post: req.blogPost });
});

router.patch('/:postId', findManageablePost, async (req, res, next) => {
  try {
    const allowed = ['title', 'excerpt', 'content', 'status', 'category', 'coverImage'];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        req.blogPost[key] = req.body[key];
      }
    }

    if (req.body.tags !== undefined) {
      req.blogPost.tags = normalizeTags(req.body.tags);
    }

    await req.blogPost.save();
    res.json({ post: req.blogPost });
  } catch (err) {
    next(err);
  }
});

router.delete('/:postId', findManageablePost, async (req, res, next) => {
  try {
    await req.blogPost.deleteOne();
    res.json({ message: 'Blog post deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
