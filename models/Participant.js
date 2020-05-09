const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const participantSchema = new Schema(
  {
    participant: {
      type: ObjectId,
      ref: 'User',
    },
    event: {
      type: ObjectId,
      ref: 'Event',
    },
    paid: {
      type: Date,
      default: Date.now,
    },
    faceScanned: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
