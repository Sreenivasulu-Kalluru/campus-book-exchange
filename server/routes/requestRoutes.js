const express = require('express');
const router = express.Router();
const {
  createRequest,
  getReceivedRequests,
  respondToRequest,
  getSentRequests,
  checkRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/requests
// @desc    Create a new exchange request
// @access  Private
router.post('/', protect, createRequest);

// @route   GET /api/requests/received
// @desc    Get all requests for the lister's books
// @access  Private
router.get('/received', protect, getReceivedRequests);

router.get('/sent', protect, getSentRequests);

router.get('/check/:bookId', protect, checkRequestStatus);

// @route   PUT /api/requests/:id
// @desc    Respond to a specific request
// @access  Private
router.put('/:id', protect, respondToRequest);

module.exports = router;
