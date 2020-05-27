const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

const Event = require('../models/Event');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: process.env.CLOUDINARY_FOLDER,
  allowedFormats: ['jpg', 'png'],

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

const uploadEventImage = multer({ storage: storage });
// const uploadSelfie = multer({ storage: storage });

module.exports = uploadEventImage;
