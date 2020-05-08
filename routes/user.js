const express = require('express');
const mongoose = require('mongoose');

const {
  checkIfLoggedIn,
} = require('../middlewares/index');

const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event'); // populate
const Tag = require('../models/Tag'); // populate
const Like = require('../models/Like'); // populate
const Rating = require('../models/Rating'); // populate
const Participant = require('../models/Participant'); // populate
const Institution = require('../models/Institution'); // populate

// para admin y user
// works
router.get('/', checkIfLoggedIn, async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .populate('hasInstitution')
      .populate({
        path: 'eventsOwner',
        populate: { path: 'owner' },
      })
      .populate({
        path: 'participantEvents',
        populate: {
          path: 'event',
          populate: {
            path: 'participants',
            populate: {
              path: 'participant',
            },
          },
        },
      })
      .populate({
        path: 'ratingsGiven',
        populate: { path: 'ratingForEvent' },
      })
      .populate({
        path: 'likesGiven',
        populate: { path: 'likeForEvent' },
      });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// para admin y user
// works
router.get('/:userId', checkIfLoggedIn, async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId)
      .populate('hasInstitution')
      .populate({
        path: 'eventsOwner',
        populate: { path: 'owner' },
      })
      .populate({
        path: 'participantEvents',
        populate: {
          path: 'event',
          populate: {
            path: 'participants',
            populate: {
              path: 'participant',
            },
          },
        },
      })
      .populate({
        path: 'ratingsGiven',
        populate: { path: 'ratingForEvent' },
      })
      .populate({
        path: 'likesGiven',
        populate: { path: 'likeForEvent' },
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

// solo para user
// works
router.put('/:userId/edit', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
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
      const user = await User.findByIdAndUpdate(userId, {
        username,
        email,
        firstName,
        familyName,
      }, { new: true });
      res.json(user);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
