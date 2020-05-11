const express = require("express");
const mongoose = require("mongoose");

const { checkIfLoggedIn } = require("../middlewares/index");

const router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event"); // populate
const Tag = require("../models/Tag"); // populate
const Like = require("../models/Like"); // populate
const Rating = require("../models/Rating"); // populate
const Participant = require("../models/Participant"); // populate
const Place = require("../models/Place"); // populate

// works
router.get("/", checkIfLoggedIn, async (req, res, next) => {
  try {
    const ratings = await Rating.find()
      .populate("ratingGivenBy")
      .populate({
        path: "ratingForPlace",
        populate: { path: "owner" },
      })
      .populate({
        path: "ratingForPlace",
        populate: {
          path: "ratings",
          populate: { path: "rating" },
        },
      });
    res.json(ratings);
  } catch (error) {
    next(error);
  }
});

// works
router.get("/:ratingId", checkIfLoggedIn, async (req, res, next) => {
  const { ratingId } = req.params;
  try {
    const rating = await Rating.findById(ratingId)
      .populate("ratingGivenBy")
      .populate({
        path: "ratingForPlace",
        populate: { path: "owner" },
      })
      .populate({
        path: "ratingForPlace",
        populate: {
          path: "ratings",
          populate: { path: "rating" },
        },
      });
    if (rating) {
      const stars = [];
      for (let i = 0; i < rating.stars; i++) {
        stars.push("⭐️");
      }
      res.json(rating);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// event-owner o admin puede borrar rating
// works
router.delete("/:ratingId/delete", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.ratingId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { ratingId } = req.params;
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const findRatingForPlace = await Rating.findById(ratingId)
      .populate({
        path: "ratingForPlace",
        populate: { path: "owner" },
      })
      .populate({
        path: "ratingForPlace",
        populate: {
          path: "ratings",
          populate: { path: "ratingGivenBy" },
        },
      });

    function checkUserIsOwner() {
      const tempOwnerId = findRatingForPlace.ratingForPlace;
      if (tempOwnerId.owner._id.toString() === userId.toString()) {
        return true;
      } else {
        return false;
      }
    }

    function getUserIdOfRating() {
      const tempUserIdOfRating = findRatingForPlace.ratingForPlace.ratings.filter(
        (rating) => rating._id.toString() === ratingId.toString()
      );
      const userIdOfRating = tempUserIdOfRating[0].ratingGivenBy._id;
      return userIdOfRating;
    }

    function getPlaceIdOfRating() {
      const tempPlaceIdOfRating = findRatingForPlace.ratingForPlace.ratings.filter(
        (rating) => rating._id.toString() === ratingId.toString()
      );
      const placeIdOfRating = tempPlaceIdOfRating[0].ratingForPlace._id;
      return placeIdOfRating;
    }

    const userIsOwnerOfPlaceWithRating = checkUserIsOwner();
    const userIdOfRating = getUserIdOfRating();
    const placeIdOfRating = getPlaceIdOfRating();

    if (userIsOwnerOfPlaceWithRating === true || findUser.role === "admin") {
      const deleteRating = await Rating.findByIdAndDelete(ratingId);
      await User.findByIdAndUpdate(
        userIdOfRating,
        { $pull: { ratingsGiven: deleteRating._id } },
        { new: true }
      );
      await Place.findByIdAndUpdate(
        placeIdOfRating,
        { $pull: { ratings: deleteRating._id } },
        { new: true }
      );
      res.json(deleteRating);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
