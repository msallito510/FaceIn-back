const express = require("express");
const mongoose = require("mongoose");

const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { checkIfLoggedIn } = require("../middlewares/index");

const router = express.Router();
const User = require("../models/User");

router.get("/", checkIfLoggedIn, async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" })
      .populate("hasPlace")
      .populate({
        path: "eventsOwner",
        populate: { path: "owner" },
      })
      .populate({
        path: "participantEvents",
        populate: {
          path: "event",
          populate: {
            path: "participants",
            populate: {
              path: "participant",
            },
          },
        },
      })
      .populate({
        path: "ratingsGiven",
        populate: { path: "ratingForEvent" },
      })
      .populate({
        path: "likesGiven",
        populate: { path: "likeForEvent" },
      });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/userlikes", checkIfLoggedIn, async (req, res, next) => {

  const { _id } = req.session.currentUser;
  try {
    const user = await User.findById(_id)
      .populate('likesGiven');

    if (user) {
      res.json(user);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId)
      .populate("hasPlace")
      .populate({
        path: "eventsOwner",
        populate: { path: "owner" },
      })
      .populate({
        path: "participantEvents",
        populate: {
          path: "event",
          populate: {
            path: "participants",
            populate: {
              path: "participant",
            },
          },
        },
      })
      .populate({
        path: "ratingsGiven",
        populate: { path: "ratingForEvent" },
      })
      .populate({
        path: "likesGiven",
        populate: { path: "likeForEvent" },
      });
    if (user) {
      res.json(user);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:userId/likes", checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;

  try {
    const currentUser = await User.findById(_id);

    if (currentUser._id.toString() === userId.toString()) {
      const user = await User.findById(userId)
        .populate({
          path: "likesGiven",
          populate: { path: "likeForEvent" },
        });
      if (user) {
        res.json(user);
      } else {
        res.json({});
      }
    }

  } catch (error) {
    next(error);
  }
});

router.get("/:userId/futureEvents", checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;

  try {
    const currentUser = await User.findById(_id);

    if (currentUser._id.toString() === userId.toString()) {
      const user = await User.findById(userId)
        .populate({
          path: "participantEvents",
          populate: { path: "event" },
        });
      if (user) {
        res.json(user);
      } else {
        res.json({});
      }
    }

  } catch (error) {
    next(error);
  }
});


router.post('/:userId/add-photo', checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;
  const {
    imgSrc,
  } = req.body;
  try {
    const currentUser = await User.findById(_id);
    if (currentUser._id.toString() === userId.toString()) {

      const getURL = await cloudinary.v2.uploader.upload(imgSrc,
        {
          folder: process.env.CLOUDINARY_FOLDER_TWO,
          allowedFormats: ['jpg', 'png', 'jpeg'],
          public_id: _id,
          overwrite: true,
        });

      const newImage = await User.findByIdAndUpdate(
        userId,
        {
          imageCam: imgSrc,
          imageUrl: getURL.secure_url,
        },
        { new: true },
      );
      res.json(newImage);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:userId/get-photo', checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const currentUser = await User.findById(_id);
    const user = await User.findById(userId);
    const binaryData = user.imageCam;
    if (currentUser._id.toString() === userId.toString() && binaryData) {
      const string = binaryData.toString('base64');
      if (string) {
        res.json(string);
      } else {
        res.json({});
      }
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:userId/edit", checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    const { _id } = req.session.currentUser;
    const { userId } = req.params;
    const {
      username,
      email,
      firstName,
      familyName,
    } = req.body;
    const currentUser = await User.findById(_id);
    if (currentUser._id.toString() === userId.toString()) {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          username,
          email,
          firstName,
          familyName,
        },
        { new: true },
      );
      res.json(user);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
