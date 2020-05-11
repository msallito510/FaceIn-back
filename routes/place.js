const express = require("express");
const mongoose = require("mongoose");

const { checkIfLoggedIn } = require("../middlewares/index");

const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User"); // populate
const Tag = require("../models/Tag"); // populate
const Like = require("../models/Like"); // populate
const Rating = require("../models/Rating"); // populate
const Participant = require("../models/Participant"); // populate
const Place = require("../models/Place"); // populate

// para admin y user
// works
router.get("/", checkIfLoggedIn, async (req, res, next) => {
  try {
    const places = await Place.find()
      .populate("placeOwner")
      .populate("placeHasEvents")
      .populate({
        path: "ratings",
        populate: { path: "ratingGivenBy" },
      });
    res.json(places);
  } catch (error) {
    next(error);
  }
});

// para admin y user
// works
router.get("/:placeId", checkIfLoggedIn, async (req, res, next) => {
  const { placeId } = req.params;
  try {
    const place = await Place.findById(placeId)
      .populate("placeOwner")
      .populate("placeHasEvents")
      .populate({
        path: "ratings",
        populate: { path: "ratingGivenBy" },
      });
    if (place) {
      res.json(place);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// solo para owner
// works
router.post("/add", checkIfLoggedIn, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  const {
    placeName,
    // image,
    // direccion,
  } = req.body;
  try {
    const user = await User.findById(_id);
    const userId = user._id;
    if (user.hasPlace === undefined) {
      const place = await Place.create({
        placeName,
        // image,
        placeOwner: userId,
        // direccion,
      });
      await User.findByIdAndUpdate(
        userId,
        { $push: { hasPlace: place._id } },
        { new: true }
      );
      res.json(place);
    }
  } catch (error) {
    // user puede crear solo una institucion
    next(error);
  }
});

// solo para owner
// works
router.put("/:placeId/edit", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const { placeId } = req.params;
    const findPlace = await Place.findById(placeId);
    const {
      placeName,
      // image,
      // direccion,
    } = req.body;
    if (userId.toString() === findPlace.placeOwner._id.toString()) {
      const place = await Place.findByIdAndUpdate(
        placeId,
        {
          placeName,
          // image,
          // direccion,
        },
        { new: true }
      );
      res.json(place);
    }
  } catch (error) {
    next(error);
  }
});

// solo para owner
// works
router.delete("/:placeId/delete", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const { placeId } = req.params;
    const findPlace = await Place.findById(placeId);
    // const eventId =
    // const ratingId =
    if (userId.toString() === findPlace.placeOwner._id.toString()) {
      const place = await Place.findByIdAndDelete(placeId);
      await User.findByIdAndUpdate(
        userId,
        { $pull: { hasPlace: placeId } },
        { new: true }
      );
      // falta chequearlo
      // await Event.findByIdAndUpdate(eventId, { $pull: { belongsToPlace: placeId } }, { new: true });
      // await Rating.findByIdAndUpdate(ratingId, { $pull: { ratingForPlace: placeId } }, { new: true });
      res.json(place);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// en postman, si no hay rating: post con 5 properties, si rating existe:
// solo mandar: title, description, stars
// works
router.post("/:placeId/add-rating", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const { placeId } = req.params;
    const { title, description, stars } = req.body;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const findPlaceWithRating = await Place.findById(placeId).populate({
      path: "ratings",
      populate: { path: "ratingGivenBy" },
    });

    function checkUserIdInRatings() {
      if (findPlaceWithRating.ratings.length !== 0) {
        const tempSameId = findPlaceWithRating.ratings.filter(
          (rating) => rating.ratingGivenBy._id.toString() === userId.toString()
        );
        if (tempSameId.length === 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    const userIdNotFound = checkUserIdInRatings();

    function getRatingIdToUpdate() {
      if (findPlaceWithRating.ratings.length !== 0) {
        const tempRatingIdToUpdate = findPlaceWithRating.ratings.filter(
          (rating) => rating.ratingGivenBy._id.toString() === userId.toString()
        );
        const ratingIdToUpdate = tempRatingIdToUpdate[0]._id;
        return ratingIdToUpdate;
      }
    }

    if (
      findPlaceWithRating.ratings.length === 0 ||
      (findPlaceWithRating.ratings.length !== 0 && userIdNotFound === true)
    ) {
      console.log("uno");
      const rating = await Rating.create({
        title,
        description,
        stars,
        ratingGivenBy: userId,
        ratingForPlace: placeId,
      });
      await User.findByIdAndUpdate(
        userId,
        { $push: { ratingsGiven: rating._id } },
        { new: true }
      );
      await Place.findByIdAndUpdate(
        placeId,
        { $push: { ratings: rating._id } },
        { new: true }
      );
      res.json(rating);
    } else {
      const updateRating = await Rating.findByIdAndUpdate(
        getRatingIdToUpdate(),
        {
          title,
          description,
          stars,
        },
        { new: true }
      );
      res.json(updateRating);
    }
  } catch (error) {
    next(error);
  }
});

// user cual dio el rating puede borrar
// works
router.delete(
  "/:placeId/delete-rating",
  checkIfLoggedIn,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
      }
      const { _id } = req.session.currentUser;
      const { placeId } = req.params;
      const findUser = await User.findById(_id);
      const userId = findUser._id;
      const findPlaceWithRating = await Place.findById(placeId).populate({
        path: "ratings",
        populate: { path: "ratingGivenBy" },
      });

      function checkUserIdInRatings() {
        if (findPlaceWithRating.ratings.length !== 0) {
          const tempSameId = findPlaceWithRating.ratings.filter(
            (rating) =>
              rating.ratingGivenBy._id.toString() === userId.toString()
          );
          if (tempSameId.length === 0) {
            return true;
          } else {
            return false;
          }
        }
      }

      const userIdNotFound = checkUserIdInRatings();

      function getRatingIdToDelete() {
        if (findPlaceWithRating.ratings.length !== 0) {
          const tempRatingIdToDelete = findPlaceWithRating.ratings.filter(
            (rating) =>
              rating.ratingGivenBy._id.toString() === userId.toString()
          );
          const ratingIdToDelete = tempRatingIdToDelete[0]._id;
          return ratingIdToDelete;
        }
      }

      if (userIdNotFound === false) {
        const deleteRating = await Rating.findByIdAndDelete(
          getRatingIdToDelete()
        );
        await User.findByIdAndUpdate(
          userId,
          { $pull: { ratingsGiven: deleteRating._id } },
          { new: true }
        );
        await Place.findByIdAndUpdate(
          placeId,
          { $pull: { ratings: deleteRating._id } },
          { new: true }
        );
        res.json(deleteRating);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
