/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const cloudinary = require('cloudinary');

// const uploadMethods = require("../middlewares/cloudinary");

// const { uploadParticipantPic } = uploadMethods;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { checkIfLoggedIn } = require('../middlewares/index');

const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event'); // populate
const Tag = require('../models/Tag'); // populate
const Like = require('../models/Like'); // populate
const Rating = require('../models/Rating'); // populate
const Participant = require('../models/Participant'); // populate
const Place = require('../models/Place'); // populate

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

// para event-owner

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

// solo owner of event

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
    // console.log(getURL.secure_url)

    await Participant.findByIdAndUpdate(
      participantId,
      {
        imageCamParticipant: imgSrc,
        entryImage: getURL.secure_url,
      },
      { new: true },
    );
    console.log("cloudinary image -> ", getURL.url);

    if (findUser._id.toString() === findEvent.event.owner._id.toString()) {
      const pics = await Participant.findById(participantId)
        .populate('participant');

      const picOne = pics.participant.imageTwo;
      const picTwo = pics.entryImage;


      // const picOne = pics.participant.imageTwo;
      // const picTwo = pics.participant.imageTwo;

      console.log("image 1: ", picOne)
      console.log("image 2: ", picTwo)
      // const picOne = 'https://res.cloudinary.com/marcesallito/image/upload/v1590708257/profile/5eb6ea9e055c9d1404128bd4.jpg';
      // const picTwo = 'https://res.cloudinary.com/marcesallito/image/upload/v1590708257/profile/5eb6ea9e055c9d1404128bd4.jpg';
      // const picOne = 'https://res.cloudinary.com/marcesallito/image/upload/v1590709148/profile/obama_letterman_fgpk3g.jpg';
      // const picTwo = 'https://res.cloudinary.com/marcesallito/image/upload/v1590709152/profile/barack_obama_emb35q.jpg';

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
      console.log("image matched", matched.data);
      console.log("matched Obj ->> ", matched.data);

      if (matched.data.match === true) {
        const participant = await Participant.findByIdAndUpdate(
          participantId,
          {
            faceScanned: true,
          },
          { new: true }
        );

        res.json(participant);
      } else if (matched.data.matches === 0) {
        console.log(" matches = 0 ->> ", matched.data.matches);

        const participant = await Participant.findByIdAndUpdate(

          participantId,
          {
            faceScanned: false,
          },
          { new: true }
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
