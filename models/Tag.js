const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const tagSchema = new Schema(
  {
    tagName: {
      type: String,
      enum: ['Tango', 'Salsa', 'Cumbia', 'Bachata', 'Swing', 'Waltz', 'Merengue', 'Flamenco', 'Chacarera', 'Kizomba', 'Forro'],
      unique: [true, 'Hey Admin, we already have this tag 😀.'],
      required: [true, 'Ooops: Tag missing 😀.'],
    },
    tagBelongsToEvents: [{
      type: ObjectId,
      ref: 'Event',
    }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
