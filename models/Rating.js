const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const ratingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Short title missing 🙂.'],
    },
    description: {
      type: String,
      // required: [true, 'Oops: Description missing 🙂.'],
    },
    stars: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 4,
      required: [true, 'Oops: Stars missing 🙂.'],
    },
    writtenOn: {
      type: Date,
      default: Date.now,
    },
    ratingGivenBy: {
      type: ObjectId,
      ref: 'User',
    },
    ratingForInstitution: {
      type: ObjectId,
      ref: 'Institution',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
