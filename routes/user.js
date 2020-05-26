const express = require("express");
const mongoose = require("mongoose");

const Buffer = require('buffer/').Buffer  // note: the trailing slash is important!

const uploadSelfie = require("../middlewares/cloudinary");

const { checkIfLoggedIn } = require("../middlewares/index");

const router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event"); // populate
const Tag = require("../models/Tag"); // populate
const Like = require("../models/Like"); // populate
const Rating = require("../models/Rating"); // populate
const Participant = require("../models/Participant"); // populate
const Place = require("../models/Place"); // populate

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

// router.get("/userlikes", checkIfLoggedIn, async (req, res, next) => {
//   try {
//     const { _id } = req.session.currentUser;
//     // const users = await User.find().populate({
//     //   path: "likesGiven",
//     //   match: { _id.toString },
//     // });
//     const users = await User.find({
//       path: "likesGiven",
//       match: { _id },
//     });

//     res.json(users);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/userlikes", checkIfLoggedIn, async (req, res, next) => {
  // const { userId } = req.params;
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


router.put(
  "/:userId/upload-photo",
  checkIfLoggedIn,
  uploadSelfie.single("imageUrl"),
  async (req, res, next) => {
    const { _id } = req.session.currentUser;
    const { userId } = req.params;
    const imgPath = req.file.url;
    const currentUser = await User.findById(_id);
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
      }
      if (currentUser._id.toString() === userId.toString()) {
        if (!req.file) {
          next(new Error("No file uploaded!"));
          return;
        }
        const userUpdate = await User.findByIdAndUpdate(
          _id,
          {
            selfie: imgPath,
          },
          { new: true }
        );
        res.json(userUpdate);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:userId/add-photo', checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;
  const {
    imgSrc,
  } = req.body;
  try {
    const currentUser = await User.findById(_id);
    if (currentUser._id.toString() === userId.toString()) {
      const newImage = await User.findByIdAndUpdate(
        userId,
        { imageCam: imgSrc },
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
router.get('/:userId/get-photoBlob', checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const currentUser = await User.findById(_id);
    const user = await User.findById(userId);
    const binaryData = user.imageCam;
    if (currentUser._id.toString() === userId.toString() && binaryData) {
      const string = binaryData.toString('base64');

      // const ab = new ArrayBuffer(128);
      // console.log(ab)
      // const two = new Float32Array(ab)
      // console.log(two)

      // function toArrayBuffer(binaryData) {
      //   console.log(binaryData)
      const ab = new ArrayBuffer(512);
      const view = new Float32Array(ab);
      for (let i = 0; i < binaryData.length; ++i) {
        view[i] = binaryData[i];
      }
      console.log(view)

      

      if (view) {
        res.json(test);
      } else {
        res.json({});
      }
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

      // const ab = new ArrayBuffer(128);
      // const two = new Float32Array(ab)
      // console.log(two)


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
      // avatar, selfie, password?? >> checkFieldsAreNotEmpty
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
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
