import { Router } from 'express';
import BlogPost from '../models/BlogPost.js';
import { protect } from '../middleware/auth.js';

const router = Router();

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

async function findOwnedPost(req, res, next) {
  try {
    const post = await BlogPost.findOne({
      _id: req.params.postId,
      authorId: req.user._id,
    });

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
    const posts = await BlogPost.find({ authorId: req.user._id }).sort({ updatedAt: -1 });
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
      tags: normalizeTags(req.body.tags),
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

router.get('/:postId', findOwnedPost, (req, res) => {
  res.json({ post: req.blogPost });
});

router.patch('/:postId', findOwnedPost, async (req, res, next) => {
  try {
    const allowed = ['title', 'excerpt', 'content', 'status'];

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

router.delete('/:postId', findOwnedPost, async (req, res, next) => {
  try {
    await req.blogPost.deleteOne();
    res.json({ message: 'Blog post deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
