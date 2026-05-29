import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 40,
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

blogPostSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    if (this.status === 'draft') {
      this.publishedAt = null;
    }
  }

  next();
});

export default mongoose.model('BlogPost', blogPostSchema);
