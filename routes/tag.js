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
    const tags = await Tag.find().populate("tagBelongsToEvents");
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

// works
router.get("/:tagId", checkIfLoggedIn, async (req, res, next) => {
  const { tagId } = req.params;
  try {
    const tag = await Tag.findById(tagId).populate("tagBelongsToEvents");
    if (tag) {
      res.json(tag);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// solo admin puede subir tags nuevos
// works
router.post("/add", checkIfLoggedIn, async (req, res, next) => {
  try {
    const { _id } = req.session.currentUser;
    const { tagName } = req.body;
    const user = await User.findById(_id);
    if (user.role === "admin") {
      const tag = await Tag.create({
        tagName,
      });
      res.json(tag);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// solo admin
// works
router.delete("/:tagId/delete", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.tagId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const user = await User.findById(_id);
    const { tagId } = req.params;
    if (user.role === "admin") {
      const tagDelete = await Tag.findByIdAndDelete(tagId);
      // chequearlo, pero ojo ya tag esta en required para la creacion del evento
      // await Event.deleteMany({ tag: eventId });
      res.json(tagDelete);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
