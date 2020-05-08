const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Give yourself a fancy username 🙂.'],
      unique: [true, 'Ooops, this username is already taken 🙁.'],
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Your email address is missing 😞.'],
      unique: [
        true,
        'Looks like this email address was already registered 😮.',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    firstName: {
      type: String,
    },
    familyName: {
      type: String,
    },
    // avatar: {
    //   type: String,
    //   default: '',
    // },
    // selfie: {
    //   data: Buffer,
    //   contentType: String,
    //   required: [true, 'We need your selfie. Show us your best side 😃.'],
    // },
    hasInstitution: {
      type: ObjectId,
      ref: 'Institution',
    },
    eventsOwner: [
      {
        type: ObjectId,
        ref: 'Event',
      },
    ],
    participantEvents: [
      {
        type: ObjectId,
        ref: 'Participant',
      },
    ],
    ratingsGiven: [
      {
        type: ObjectId,
        ref: 'Rating',
      },
    ],
    likesGiven: [
      {
        type: ObjectId,
        ref: 'Like',
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
