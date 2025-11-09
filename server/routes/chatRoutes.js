// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMyConversations,
  getMessages,
  getConversationDetails,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Get my inbox
router.get('/', protect, getMyConversations);

// (Must be before '/:id' or "details" will be read as an ID)
router.get('/details/:id', protect, getConversationDetails);

// Get messages for one chat
router.get('/:id', protect, getMessages);

module.exports = router;
