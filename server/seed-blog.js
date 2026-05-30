import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import BlogPost from './models/BlogPost.js';
// Reuse the same fixtures the frontend used to hardcode, so there's a single
// source of truth for the seeded content.
import { SAMPLE_BLOG_POSTS } from '../client/src/data/sampleBlogPosts.js';

// Migrates the previously-hardcoded sample blog posts into the database as real,
// admin-owned BlogPost documents so an admin can edit/delete them. Idempotent:
// re-running updates existing posts (matched by title + author) rather than
// creating duplicates.
async function seedBlog() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin =
      (await User.findOne({ role: 'admin' })) ||
      (await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@randomify.com' }));

    if (!admin) {
      console.error('No admin user found. Run create-admin.js first.');
      process.exit(1);
    }

    for (const sample of SAMPLE_BLOG_POSTS) {
      const publishedAt = sample.status === 'published' ? new Date(sample.date) : null;
      const fields = {
        authorId: admin._id,
        title: sample.title,
        excerpt: sample.excerpt,
        content: sample.content.trim(),
        status: sample.status,
        category: sample.category,
        coverImage: sample.image,
        tags: [sample.category],
        publishedAt,
      };

      const existing = await BlogPost.findOne({ title: sample.title, authorId: admin._id });
      if (existing) {
        Object.assign(existing, fields);
        await existing.save();
        console.log(`Updated: ${sample.title}`);
      } else {
        await BlogPost.create(fields);
        console.log(`Created: ${sample.title}`);
      }
    }

    console.log(`Seeded ${SAMPLE_BLOG_POSTS.length} blog post(s) for admin ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedBlog();
