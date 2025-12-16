// server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// Upload Image
router.post('/', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.status(200).json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
  });
});

module.exports = router;
