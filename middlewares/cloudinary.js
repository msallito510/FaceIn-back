const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

const Event = require('../models/Event');
const User = require('../models/User');
const Participant = require('../models/Participant');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const eventStorage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: process.env.CLOUDINARY_FOLDER_ONE,
  allowedFormats: ['jpg', 'png', 'jpeg'],
  filename: async function (req, file, cb) {
    try {
      const { eventId } = req.params;
      const alreadyOneImage = await Event.findById(eventId);
      if (alreadyOneImage.image === undefined) {
        // cb(null, file.originalname);
        // cb(null, ‘’ + _id + ‘-’ + Date.now());
        cb(null, eventId);
      } else {
        cloudinary.v2.api.delete_resources(eventId);
        cb(null, eventId);
      }
    } catch (error) {
      next(error);
    }
  }

  // transformation: [{ width: 500, height: 500, crop: "limit" }]
  // filename: function (req, file, cb) {
  //   const { _id } = req.session.currentUser;
  //   // cb(null, file.originalname);
  //   // cb(null, '' + Date.now() + '-' + file.originalname);
  //   cb(null, '' + _id + '-' + Date.now());
  // }
});

// const profileStorage = cloudinaryStorage({
//   cloudinary: cloudinary,
//   folder: process.env.CLOUDINARY_FOLDER_TWO,
//   allowedFormats: ['jpg', 'png', 'jpeg'],
//   filename: async function (req, file, cb) {
//     try {
//       const { _id } = req.session.currentUser;
//       const alreadyOneImage = await User.findById(_id);
//       if (alreadyOneImage.image === undefined) {
//         cb(null, _id);
//       } else {
//         cloudinary.v2.api.delete_resources(_id);
//         cb(null, _id);
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// });

const participantStorage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: process.env.CLOUDINARY_FOLDER_THREE,
  allowedFormats: ['jpg', 'png', 'jpeg'],
  filename: async function (req, file, cb) {
    try {
      const { participantId } = req.session.currentUser;
      const alreadyOneImage = await Participant.findById(participantId);
      if (alreadyOneImage.image === undefined) {
        cb(null, participantId);
      } else {
        cloudinary.v2.api.delete_resources(participantId);
        cb(null, participantId);
      }
    } catch (error) {
      next(error);
    }
  }
});


const uploadEventImage = multer({ storage: eventStorage });

module.exports = {
  uploadEventImage,
  // profileStorage,
  // participantStorage,
};

// const uploadEventImage = multer({ storage: storage });
// // const uploadSelfie = multer({ storage: storage });

// module.exports = uploadEventImage;