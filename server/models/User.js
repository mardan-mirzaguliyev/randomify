import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'lifetime'],
      default: 'free',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.methods.canCreateList = function (currentCount) {
  if (this.plan === 'pro' || this.plan === 'lifetime') return true;
  return currentCount < 3;
};

userSchema.methods.canAddItem = function (currentCount) {
  if (this.plan === 'pro' || this.plan === 'lifetime') return true;
  return currentCount < 20;
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
    isAdmin: this.isAdmin,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);
