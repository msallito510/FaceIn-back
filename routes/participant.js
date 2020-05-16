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
    const participants = await Participant.find()
      .populate("participant")
      .populate("event");
    res.json(participants);
  } catch (error) {
    next(error);
  }
});

// para event-owner
// works
router.get("/:participantId", checkIfLoggedIn, async (req, res, next) => {
  const { participantId } = req.params;
  try {
    const participant = await Participant.findById(participantId)
      .populate("participant")
      .populate("event");
    if (participant) {
      res.json(participant);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// solo owner of event
// works
router.put("/:participantId/scan", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.participantId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { participantId } = req.params;
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const findEvent = await Participant.findById(participantId)
      .populate("participant")
      .populate("event");
    const { faceScanned } = req.body;
    if (findUser._id.toString() === findEvent.event.owner._id.toString()) {
      const participant = await Participant.findByIdAndUpdate(
        participantId,
        {
          faceScanned,
        },
        { new: true }
      );
      res.json(participant);
    }
  } catch (error) {
    next(error);
  }
});

// works
router.delete(
  "/:participantId/delete",
  checkIfLoggedIn,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.participantId)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
      }
      const { participantId } = req.params;
      const { _id } = req.session.currentUser;
      const findUser = await User.findById(_id);
      const findEvent = await Participant.findById(participantId)
        .populate("participant")
        .populate("event");
      const eventId = findEvent.event._id;
      const participant = findEvent.participant._id;
      if (findUser._id.toString() === findEvent.event.owner._id.toString()) {
        const deleteParticipant = await Participant.findByIdAndDelete(
          participantId
        );
        await User.findByIdAndUpdate(
          participantId,
          { $pull: { participantEvents: participant._id } },
          { new: true }
        );
        await Event.findByIdAndUpdate(
          eventId,
          { $pull: { participants: participant._id } },
          { new: true }
        );
        res.json(deleteParticipant);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
