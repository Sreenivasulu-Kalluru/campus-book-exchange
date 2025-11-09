const express = require('express');
const router = express.Router();

// Import the controller function
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Define the route
// This will correspond to the URL: POST /api/users/register
router.post('/register', registerUser);

// This will correspond to the URL: POST /api/users/login
router.post('/login', loginUser);

router.get('/me', protect, getUserProfile);

module.exports = router;
