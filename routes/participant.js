/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { checkIfLoggedIn } = require('../middlewares/index');

const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Participant = require('../models/Participant');

const matchFaces = axios.create({
  baseURL: process.env.FACE_BASE_URL,
  headers: {
    'content-type': 'application/json',
    'x-rapidapi-host': process.env.FACE_API_NAME,
    'x-rapidapi-key': process.env.FACE_API_KEY,
    accept: 'application/json',
    useQueryString: true,
  },
  withCredentials: true,
});

router.get('/', checkIfLoggedIn, async (req, res, next) => {
  try {
    const participants = await Participant.find()
      .populate('participant')
      .populate('event');
    res.json(participants);
  } catch (error) {
    next(error);
  }
});

router.get('/:participantId', checkIfLoggedIn, async (req, res, next) => {
  const { participantId } = req.params;
  try {
    const participant = await Participant.findById(participantId)
      .populate('participant')
      .populate('event');
    if (participant) {
      res.json(participant);
    } else {
      res.json({});
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:participantId/get-photo', checkIfLoggedIn, async (req, res, next) => {
  const { participantId } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const currentUser = await User.findById(_id);
    const participant = await Participant.findById(participantId);
    const binaryData = participant.imageCamParticipant;
    if (currentUser._id.toString() === participantId.toString() && binaryData) {
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

router.post('/:participantId/scan', checkIfLoggedIn, async (req, res, next) => {
  const { participantId } = req.params;
  const { _id } = req.session.currentUser;
  const {
    imgSrc,
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.participantId)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
    const findUser = await User.findById(_id);
    const findEvent = await Participant.findById(participantId)
      .populate('participant')
      .populate('event');

    const getURL = await cloudinary.v2.uploader.upload(imgSrc,
      {
        folder: process.env.CLOUDINARY_FOLDER_THREE,
        allowedFormats: ['jpg', 'png', 'jpeg'],
        public_id: _id,
        overwrite: true,
      });

    await Participant.findByIdAndUpdate(
      participantId,
      {
        imageCamParticipant: imgSrc,
        entryImage: getURL.secure_url,
      },
      { new: true },
    );

    if (findUser._id.toString() === findEvent.event.owner._id.toString()) {
      const pics = await Participant.findById(participantId)
        .populate('participant');

      const picOne = pics.participant.imageUrl;
      const picTwo = pics.entryImage;

      const matched = await matchFaces.post('/',
        {
          key: 'free',
          id: '5B3p2r8A',
          data: {
            known_image: [picOne],
            test_image: [picTwo],
          },
        },
      );

      if (matched.data.match === true) {
        console.log(" matches = ok ->> ", matched.data.match);
        const participant = await Participant.findByIdAndUpdate(
          participantId,
          {
            faceScanned: true,
          },
          { new: true },
        );

        res.json(participant);
      } else if (!matched.data.match) {
        console.log(" matches = 0 ->> ", matched.data.matches);

        const participant = await Participant.findByIdAndUpdate(

          participantId,
          {
            faceScanned: false,
          },
          { new: true },
        );

        res.json(participant);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.delete(
  '/:participantId/delete',
  checkIfLoggedIn,
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.participantId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
      const { participantId } = req.params;
      const { _id } = req.session.currentUser;
      const findUser = await User.findById(_id);
      const findEvent = await Participant.findById(participantId)
        .populate('participant')
        .populate('event');
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
