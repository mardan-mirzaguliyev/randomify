import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PLAN_LIMITS, FIELD_LENGTHS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: FIELD_LENGTHS.displayName,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'lifetime'],
      default: 'free',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    lastLoginAt: Date,
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.canCreateList = function (currentCount) {
  if (this.plan === 'pro' || this.plan === 'lifetime') return true;
  return currentCount < PLAN_LIMITS.free.maxLists;
};

userSchema.methods.canAddItem = function (currentCount) {
  if (this.plan === 'pro' || this.plan === 'lifetime') return true;
  return currentCount < PLAN_LIMITS.free.maxItemsPerList;
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

userSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    displayName: this.displayName,
    plan: this.plan,
    role: this.role,
    // Derived for backward compatibility with existing clients that read isAdmin.
    isAdmin: this.role === 'admin',
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);
