const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const eventSchema = new Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "What is the title of your event?"],
    },
    description: {
      type: String,
      required: [true, "What is your event about 🙂?"],
    },
    frequency: {
      type: String,
      enum: ["once", "weekly"],
      default: "once",
      required: true,
    },
    dateStart: {
      type: Date,
      required: [true, "Ooops: Date missing 🙂."],
    },
    dateEnd: {
      type: Date,
      required: [true, "Ooops: Date missing 🙂."],
    },
    timeStart: {
      type: String,
      required: [true, "Ooops: Time missing 🙂."],
    },
    timeEnd: {
      type: String,
      required: [true, "Ooops: Time missing 🙂."],
    },
    price: {
      type: Number,
      default: 0.0,
    },
    image: {
      type: String,
    },
    belongsToPlace: {
      type: ObjectId,
      ref: "Place",
      required: [true, "Ooops: Place missing 🙂."],
    },
    // tag: {
    //   type: ObjectId,
    //   ref: "Tag",
    //   required: [true, "Ooops: Tag missing 🙂."],
    // },
    participants: [
      {
        type: ObjectId,
        ref: "Participant",
      },
    ],
    likes: [
      {
        type: ObjectId,
        ref: "Like",
      },
    ],
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
