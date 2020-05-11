const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
​
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
​
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: process.env.CLOUDINARY_FOLDER,
  allowedFormats: ['jpg'],
  // transformation: [{ width: 500, height: 500, crop: "limit" }]
  filename: function (req, file, cb) {
    const { _id } = req.session.currentUser;
    // cb(null, file.originalname);
    // cb(null, '' + Date.now() + '-' + file.originalname);
    cb(null, '' + _id + '-' + + Date.now());
  }
});
​
const uploadSelfie = multer({ storage: storage });
​
module.exports = uploadSelfie;