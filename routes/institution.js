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
    const institutions = await Institution.find()
      .populate('institutionOwner')
      .populate('institutionHasEvents')
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      });
    res.json(institutions);
  } catch (error) {
    next(error);
  }
});

// para admin y user
// works
router.get('/:institutionId', checkIfLoggedIn, async (req, res, next) => {
  const { institutionId } = req.params;
  try {
    const institution = await Institution.findById(institutionId)
      .populate('institutionOwner')
      .populate('institutionHasEvents')
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      });
    if (institution) {
      res.json(institution);
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
    institutionName,
    // image,
    // direccion,
  } = req.body;
  try {
    const user = await User.findById(_id);
    const userId = user._id;
    if (user.hasInstitution === undefined) {
      const institution = await Institution.create({
        institutionName,
        // image,
        institutionOwner: userId,
        // direccion,
      });
      await User.findByIdAndUpdate(userId, { $push: { hasInstitution: institution._id } }, { new: true });
      res.json(institution);
    }
  } catch (error) {
    // user puede crear solo una institucion
    next(error);
  }
});

// solo para owner
// works
router.put('/:institutionId/edit', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.institutionId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const { institutionId } = req.params;
    const findInstitution = await Institution.findById(institutionId);
    const {
      institutionName,
      // image,
      // direccion,
    } = req.body;
    if (userId.toString() === findInstitution.institutionOwner._id.toString()) {
      const institution = await Institution.findByIdAndUpdate(institutionId, {
        institutionName,
        // image,
        // direccion,
      }, { new: true });
      res.json(institution);
    }
  } catch (error) {
    next(error);
  }
});

// solo para owner
// works
router.delete('/:institutionId/delete', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.institutionId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const findUser = await User.findById(_id);
    const userId = findUser._id
    const { institutionId } = req.params;
    const findInstitution = await Institution.findById(institutionId);
    // const eventId =
    // const ratingId =
    if (userId.toString() === findInstitution.institutionOwner._id.toString()) {
      const institution = await Institution.findByIdAndDelete(institutionId);
      await User.findByIdAndUpdate(userId, { $pull: { hasInstitution: institutionId } }, { new: true });
      // falta chequearlo
      // await Event.findByIdAndUpdate(eventId, { $pull: { belongsToInstitution: institutionId } }, { new: true });
      // await Rating.findByIdAndUpdate(ratingId, { $pull: { ratingForInstitution: institutionId } }, { new: true });
      res.json(institution);
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
router.post('/:institutionId/add-rating', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.institutionId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const { institutionId } = req.params;
    const { title, description, stars } = req.body;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const findInstitutionWithRating = await Institution.findById(institutionId)
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      });

    function checkUserIdInRatings() {
      if (findInstitutionWithRating.ratings.length !== 0) {
        const tempSameId = findInstitutionWithRating.ratings.filter(rating => rating.ratingGivenBy._id.toString() === userId.toString());
        if (tempSameId.length === 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    const userIdNotFound = checkUserIdInRatings();

    function getRatingIdToUpdate() {
      if (findInstitutionWithRating.ratings.length !== 0) {
        const tempRatingIdToUpdate = findInstitutionWithRating.ratings.filter(rating => rating.ratingGivenBy._id.toString() === userId.toString());
        const ratingIdToUpdate = tempRatingIdToUpdate[0]._id;
        return ratingIdToUpdate;
      }
    }

    if (findInstitutionWithRating.ratings.length === 0 || (findInstitutionWithRating.ratings.length !== 0 && userIdNotFound === true)) {
      console.log('uno');
      const rating = await Rating.create({
        title,
        description,
        stars,
        ratingGivenBy: userId,
        ratingForInstitution: institutionId,
      });
      await User.findByIdAndUpdate(userId, { $push: { ratingsGiven: rating._id } }, { new: true });
      await Institution.findByIdAndUpdate(institutionId, { $push: { ratings: rating._id } }, { new: true });
      res.json(rating);
    } else {
      const updateRating = await Rating.findByIdAndUpdate(getRatingIdToUpdate(), {
        title,
        description,
        stars,
      }, { new: true });
      res.json(updateRating);
    }
  } catch (error) {
    next(error);
  }
});

// user cual dio el rating puede borrar
// works
router.delete('/:institutionId/delete-rating', checkIfLoggedIn, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.institutionId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const { _id } = req.session.currentUser;
    const { institutionId } = req.params;
    const findUser = await User.findById(_id);
    const userId = findUser._id;
    const findInstitutionWithRating = await Institution.findById(institutionId)
      .populate({
        path: 'ratings',
        populate: { path: 'ratingGivenBy' },
      });

    function checkUserIdInRatings() {
      if (findInstitutionWithRating.ratings.length !== 0) {
        const tempSameId = findInstitutionWithRating.ratings.filter(rating => rating.ratingGivenBy._id.toString() === userId.toString());
        if (tempSameId.length === 0) {
          return true;
        } else {
          return false;
        }
      }
    }

    const userIdNotFound = checkUserIdInRatings();

    function getRatingIdToDelete() {
      if (findInstitutionWithRating.ratings.length !== 0) {
        const tempRatingIdToDelete = findInstitutionWithRating.ratings.filter(rating => rating.ratingGivenBy._id.toString() === userId.toString());
        const ratingIdToDelete = tempRatingIdToDelete[0]._id;
        return ratingIdToDelete;
      }
    }

    if (userIdNotFound === false) {
      const deleteRating = await Rating.findByIdAndDelete(getRatingIdToDelete());
      await User.findByIdAndUpdate(userId, { $pull: { ratingsGiven: deleteRating._id } }, { new: true });
      await Institution.findByIdAndUpdate(institutionId, { $pull: { ratings: deleteRating._id } }, { new: true });
      res.json(deleteRating);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
