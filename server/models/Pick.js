import mongoose from 'mongoose';

const pickSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true,
    index: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemTitleSnapshot: {
    type: String,
    required: true,
  },
  pickedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pickMode: {
    type: String,
    required: true,
  },
  poolSizeSnapshot: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

pickSchema.index({ listId: 1, createdAt: -1 });
pickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model('Pick', pickSchema);
