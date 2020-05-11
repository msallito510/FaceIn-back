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
router.delete("/:userId/delete", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const admin = await User.findById(_id);
    const { userId } = req.params;
    if (admin.role === "admin") {
      const user = await User.findByIdAndDelete(userId);
      // falta chequearlo
      // await Event.deleteMany({ owner: userId });
      // await Participant.deleteMany({ participant: userId });
      // await Rating.deleteMany({ ratingGivenBy: userId });
      // await Like.deleteMany({ likeGivenBy: userId });
      res.json(user);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});
// works
router.delete(
  "/:eventId/admin-delete",
  checkIfLoggedIn,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
      }
      const { _id } = req.session.currentUser;
      const user = await User.findById(_id);
      const { eventId } = req.params;
      if (user.role === "admin") {
        const eventDelete = await Event.findByIdAndDelete(eventId);
        // falta chequearlo
        // await User.deleteMany({ eventsOwner: eventId });
        // await Tag.deleteMany({ tagBelongsToEvents: eventId });
        // await Rating.deleteMany({ ratingForEvent: eventId });
        // await Participant.deleteMany({ event: eventId });
        // await Like.deleteMany({ likeForEvent: eventId });
        res.json(eventDelete);
      } else {
        res.json({});
      }
    } catch (error) {
      next(error);
    }
  }
);

// works
router.delete(
  "/:placeId/delete-admin",
  checkIfLoggedIn,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
      }
      const { _id } = req.session.currentUser;
      const user = await User.findById(_id);
      const { placeId } = req.params;
      const tempUserId = await Place.findById(placeId).populate("placeOwner");
      const userId = tempUserId.placeOwner._id;
      if (user.role === "admin") {
        const placeDelete = await Place.findByIdAndDelete(placeId);
        await User.findByIdAndUpdate(
          userId,
          { $pull: { hasPlace: placeId } },
          { new: true }
        );
        // falta chequearlo
        // await Event.deleteMany({ belongsToPlace: placeId });
        // await Rating.deleteMany({ ratingForPlace: placeId });
        res.json(placeDelete);
      } else {
        res.json({});
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
