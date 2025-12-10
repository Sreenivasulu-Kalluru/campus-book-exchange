// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- We only have one storage config now ---
const storageImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-book-exchange/covers',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const storagePdf = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-book-exchange/pdfs',
    resource_type: 'auto',
    allowed_formats: ['pdf'],
  },
});

const uploadImage = multer({ storage: storageImage });
const uploadPdf = multer({ storage: storagePdf });

module.exports = {
  uploadImage,
  uploadPdf,
};
