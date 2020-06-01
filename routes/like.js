const express = require("express");

const { checkIfLoggedIn } = require("../middlewares/index");

const router = express.Router();

const Like = require("../models/Like");

router.get("/", checkIfLoggedIn, async (req, res, next) => {
  try {
    const likes = await Like.find()
      .populate("likeGivenBy")
      .populate("likeForEvent");
    res.json(likes);
  } catch (error) {
    next(error);
  }
});

router.get("/:likeId", checkIfLoggedIn, async (req, res, next) => {
  const { likeId } = req.params;
  try {
    const like = await Like.findById(likeId)
      .populate("likeGivenBy")
      .populate("likeForEvent");
    if (like) {
      res.json(like);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
