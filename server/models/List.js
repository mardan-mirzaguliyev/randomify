import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true,
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  affiliateUrl: {
    type: String,
    default: '',
  },
  weight: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  excludeFromPool: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastPickedAt: {
    type: Date,
    default: null,
  },
  watchedAt: {
    type: Date,
    default: null,
  },
  readAt: {
    type: Date,
    default: null,
  },
});

const listSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaboratorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    title: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'movies',
        'tv_shows',
        'books',
        'music',
        'games',
        'restaurants',
        'travel',
        'activities',
        'tasks',
        'other',
      ],
      default: 'other',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    clonedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      default: null,
    },
    pickMode: {
      type: String,
      enum: ['pure_random', 'weighted', 'cooldown', 'surprise'],
      default: 'pure_random',
    },
    cooldownDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    templatePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

listSchema.methods.getPickableItems = function () {
  const now = Date.now();
  const cooldownMs = (this.cooldownDays || 7) * 86400000;

  return this.items.filter((item) => {
    if (item.excludeFromPool) return false;

    if (this.pickMode === 'cooldown') {
      if (!item.lastPickedAt) return true;
      return now - new Date(item.lastPickedAt).getTime() > cooldownMs;
    }

    return true;
  });
};

listSchema.methods.isInCooldown = function (item) {
  if (this.pickMode !== 'cooldown' || !item.lastPickedAt) return false;
  const cooldownMs = (this.cooldownDays || 7) * 86400000;
  return Date.now() - new Date(item.lastPickedAt).getTime() <= cooldownMs;
};

export default mongoose.model('List', listSchema);
