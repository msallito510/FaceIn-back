const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const placeSchema = new Schema(
  {
    placeName: {
      type: String,
      unique: [true, "Hey Admin, we already have this tag 😀."],
      required: [true, "Ooops: Place name missing 😀."],
    },
    placeOwner: {
      type: ObjectId,
      ref: "User",
    },
    placeHasEvents: [
      {
        type: ObjectId,
        ref: "Event",
      },
    ],
    ratings: [
      {
        type: ObjectId,
        ref: "Rating",
      },
    ],
    type: { type: String, default: "Feature" },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    coordinatesLatLong: {
      type: Object,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
