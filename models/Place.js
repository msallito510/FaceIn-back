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
    // image: {
    //   type: String,
    //   default: '',
    // },
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
    geometry: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number], // lng, lat
        required: true,
      },
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
