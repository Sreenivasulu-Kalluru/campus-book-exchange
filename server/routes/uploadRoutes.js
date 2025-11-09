// server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary'); // <-- Back to simple import
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
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
