const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const likeSchema = new Schema(
  {
    likeGivenBy: {
      type: ObjectId,
      ref: 'User',
    },
    likeForEvent: {
      type: ObjectId,
      ref: 'Event',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
