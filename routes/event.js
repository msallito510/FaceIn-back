const express = require('express');
const mongoose = require('mongoose');

const {
  checkIfLoggedIn,
} = require('../middlewares/index');

const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User'); // populate
const Tag = require('../models/Tag'); // populate
const Like = require('../models/Like'); // populate
const Rating = require('../models/Rating'); // populate
const Participant = require('../models/Participant'); // populate
const Institution = require('../models/Institution'); // populate

// para admin y user
// works
router.get('/', checkIfLoggedIn, async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('owner')
      .populate('belongsToInstitution')
      .populate({
        path: 'tag',
        populate: { path: 'tagBelongsToEvents' },
      })
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      })
      .populate({
        path: 'participants',
        populate: { path: 'participant' },
      })
      .populate({
        path: 'likes',
        populate: { path: 'likeGivenBy' },
      });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// para admin y user
// works
router.get('/:eventId', checkIfLoggedIn, async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId)
      .populate('owner')
      .populate('belongsToInstitution')
      .populate({
        path: 'tag',
        populate: { path: 'tagBelongsToEvents' },
      })
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      })
      .populate({
        path: 'participants',
        populate: { path: 'participant' },
      })
      .populate({
        path: 'likes',
        populate: { path: 'likeGivenBy' },
      });
    if (event) {
      res.json(event);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// solo para owner
// works
router.post('/add', checkIfLoggedIn, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  const {
    title,
    description,
    frequency,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    price,
    // image,
    tagId,
  } = req.body;
  try {
    const user = await User.findById(_id);
    const userId = user._id;
    const institutionId = user.hasInstitution._id;
    if (user.hasInstitution._id === true) {
      const event = await Event.create({
        owner: userId,
        title,
        description,
        frequency,
        dateStart,
        dateEnd,
        timeStart,
        timeEnd,
        price,
        // image,
        belongsToInstitution: institutionId,
        tag: tagId,
      });
      await User.findByIdAndUpdate(userId, { $push: { eventsOwner: event._id } }, { new: true });
      await Tag.findByIdAndUpdate(
        tagId, { $push: { tagBelongsToEvents: event._id } },
        { new: true },
      );
      await Institution.findByIdAndUpdate(
        institutionId, { $push: { institutionHasEvents: event._id } },
        { new: true },
      );
      res.json(event);
    }
  } catch (error) {
    // user tiene que crear antes una institucion para poder crear eventos
    next(error);
  }
});

// solo para owner
// works
router.put('/:eventId/edit', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const { eventId } = req.params;
    const findEvent = await Event.findById(eventId);
    const {
      title,
      description,
      frequency,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd,
      price,
      // image,
      tagId,
    } = req.body;
    if (userId.toString() === findEvent.owner._id.toString()) {
      const event = await Event.findByIdAndUpdate(eventId, {
        title,
        description,
        frequency,
        dateStart,
        dateEnd,
        timeStart,
        timeEnd,
        price,
        // image,
        tags: tagId,
      }, { new: true });
      await Tag.findOneAndUpdate({ tagBelongsToEvents: event._id }, { $pull: { tagBelongsToEvents: event._id } }, { new: true });
      await Tag.findByIdAndUpdate(event.tag._id, { $push: { tagBelongsToEvents: event._id } }, { new: true }).populate('tagBelongsToEvents');
      res.json(event);
    }
  } catch (error) {
    next(error);
  }
});

// solo para owner
// works
router.delete('/:eventId/delete', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id
    const { eventId } = req.params;
    const findEvent = await Event.findById(eventId);
    // const tagId =
    // const ratingId =
    // const participantId =
    // const likeId =
    // const institutionId =
    if (userId.toString() === findEvent.owner._id.toString()) {
      const event = await Event.findByIdAndDelete(eventId);
      // falta chequearlo
      // await User.findByIdAndUpdate(userId, { $pull: { eventsOwner: eventId } }, { new: true });
      // await Tag.findByIdAndUpdate(tagId, { $pull: { tagBelongsToEvents: eventId } }, { new: true });
      // await Rating.findByIdAndUpdate(ratingId, { $pull: { ratingForEvent: eventId } }, { new: true });
      // await Participant.findByIdAndUpdate(participantId, { $pull: { event: eventId } }, { new: true });
      // await Like.findByIdAndUpdate(likeId, { $pull: { likeForEvent: eventId } }, { new: true });
      // await Institution.findByIdAndUpdate(institutionId, { $pull: { institutionHasEvents: eventId } }, { new: true });
      res.json(event);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

// works
router.get('/:eventId/add-like', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const { eventId } = req.params;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const findEventWithLike = await Event.findById(eventId)
      .populate({
        path: 'likes',
        populate: { path: 'likeGivenBy' },
      });

    function checkUserIdInLikes() {
      if (findEventWithLike.likes.length !== 0) {
        const tempSameId = findEventWithLike.likes.filter(like => like.likeGivenBy._id.toString() === userId.toString());
        console.log(tempSameId.length === 0)
        if (tempSameId.length === 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    const userIdNotFound = checkUserIdInLikes();

    function getLikeIdToDelete() {
      if (findEventWithLike.likes.length !== 0) {
        const tempLikeIdToDelete = findEventWithLike.likes.filter(like => like.likeGivenBy._id.toString() === userId.toString());
        const likeIdToDelete = tempLikeIdToDelete[0]._id;
        return likeIdToDelete;
      }
    }

    if (findEventWithLike.likes.length === 0 || (findEventWithLike.likes.length !== 0 && userIdNotFound === true)) {
      console.log('uno');
      const like = await Like.create({
        likeGivenBy: userId,
        likeForEvent: eventId,
      });
      await User.findByIdAndUpdate(userId, { $push: { likesGiven: like._id } }, { new: true });
      await Event.findByIdAndUpdate(eventId, { $push: { likes: like._id } }, { new: true });
      await Event.findByIdAndUpdate(eventId, { numberOfLikes: findEventWithLike.likes.length + 1 }, { new: true });
      res.json(like);
    } else {
      console.log('tres');
      const deleteLike = await Like.findByIdAndDelete(getLikeIdToDelete());
      await User.findByIdAndUpdate(userId, { $pull: { likesGiven: deleteLike._id } }, { new: true });
      await Event.findByIdAndUpdate(eventId, { $pull: { likes: deleteLike._id } }, { new: true });
      await Event.findByIdAndUpdate(eventId, { numberOfLikes: findEventWithLike.likes.length - 1 }, { new: true });
      res.json(deleteLike);
    }
  } catch (error) {
    next(error);
  }
});

// works
router.get('/:eventId/register', checkIfLoggedIn, async (req, res, next) => {
  const { eventId } = req.params;
  const { _id } = req.session.currentUser;
  const findUser = await User.findById(_id);
  const participantId = findUser._id;
  try {
    const participant = await Participant.create({
      participant: participantId,
      event: eventId,
    });
    await User.findByIdAndUpdate(participantId, { $push: { participantEvents: participant._id } }, { new: true });
    await Event.findByIdAndUpdate(eventId, { $push: { participant: participant._id } }, { new: true });
    res.json(participant);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
