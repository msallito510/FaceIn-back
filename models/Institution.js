const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const institutionSchema = new Schema(
  {
    institutionName: {
      type: String,
      unique: [true, 'Hey Admin, we already have this tag 😀.'],
      required: [true, 'Ooops: Institution name missing 😀.'],
    },
    // image: {
    //   type: String,
    //   default: '',
    // },
    institutionOwner: {
      type: ObjectId,
      ref: 'User',
    },
    institutionHasEvents: [{
      type: ObjectId,
      ref: 'Event',
    }],
    ratings: [{
      type: ObjectId,
      ref: 'Rating',
    }],
    type: { type: String, default: 'Feature' },
    geometry: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // lng, lat
        required: true,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;
