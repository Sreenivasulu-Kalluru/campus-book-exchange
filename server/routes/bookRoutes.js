const express = require('express');
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getMyListings,
  getMyHistory,
  manageBookPdf, // <-- ADD THIS
  deleteBookPdf, // <-- ADD THIS
  downloadBookPdf,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage, uploadPdf } = require('../config/cloudinary');

// --- Routes for /api/books ---
router
  .route('/')
  .post(protect, createBook) // POST /api/books
  .get(getAllBooks); // GET  /api/books

// @route   GET /api/books/my-listings
// @desc    Get all books for the logged-in user
// @access  Private
router.get('/my-listings', protect, getMyListings);

router.get('/my-history', protect, getMyHistory);

// --- Routes for /api/books/:id ---
router
  .route('/:id')
  .get(getBookById) // GET  /api/books/:id
  .put(protect, updateBook) // PUT  /api/books/:id
  .delete(protect, deleteBook); // DELETE /api/books/:id

module.exports = router;
