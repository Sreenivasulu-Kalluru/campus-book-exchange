const https = require('https');
const asyncHandler = require('express-async-handler');
const Book = require('../models/book.model');
const User = require('../models/user.model');

/**
 * @desc    List a new book for exchange
 * @route   POST /api/books
 * @access  Private
 */
const createBook = asyncHandler(async (req, res) => {
  // 1. Get book details (price removed)
  const { title, author, condition, isbn, imageUrl } = req.body;

  // 2. Validation (price removed)
  if (!title || !author || !condition) {
    res.status(400);
    throw new Error(
      'Please fill in all required fields (title, author, condition)'
    );
  }

  // 3. Create the new book (seller -> lister)
  const book = await Book.create({
    title,
    author,
    condition,
    isbn: isbn || '',
    imageUrl: imageUrl || '',
    lister: req.user._id, // Changed from 'seller'
  });

  // 4. Add this book's ID to the user's 'booksListed' array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { booksListed: book._id },
  });

  res.status(201).json(book);
});

/**
 * @desc    Get all available books (with search and filtering)
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = asyncHandler(async (req, res) => {
  // 1. Get query parameters from the request (e.g., /api/books?search=physics)
  const { search, condition, department } = req.query;

  // 2. Build our base query object
  // We only want books that are "Available"
  const query = {
    status: 'Available',
  };

  // 3. Dynamically add search (if it exists)
  if (search) {
    // This will create a case-insensitive 'regex' search
    // It will search in both the 'title' and 'author' fields
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  // 4. Dynamically add filters (if they exist)
  if (condition) {
    query.condition = condition;
  }

  // --- Department Filter (Slightly more complex) ---
  // We need to query the 'lister' (User) collection first
  if (department) {
    // Find all users who are in that department
    const usersInDept = await User.find({ department }).select('_id');
    const userIds = usersInDept.map((user) => user._id);

    // Add this to our query: the 'lister' must be in our array of user IDs
    query.lister = { $in: userIds };
  }

  // 5. Execute the final query
  const books = await Book.find(query)
    .populate('lister', 'name department')
    .sort({ createdAt: -1 });

  res.json(books);
});

/**
 * @desc    Get a single book by its ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
  // Find the book in the database using the ID from the URL parameter
  const book = await Book.findById(req.params.id).populate(
    'lister',
    'name department'
  ); // Also get the lister's info

  if (book) {
    res.json(book);
  } else {
    res.status(404); // 404 Not Found
    throw new Error('Book not found');
  }
});

/**
 * @desc    Update a book's details
 * @route   PUT /api/books/:id
 * @access  Private
 */
const updateBook = asyncHandler(async (req, res) => {
  // 1. Find the book by its ID
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // 2. Authorization Check:
  //    Check if the logged-in user (from 'protect' middleware)
  //    is the same as the user who listed the book.
  if (book.lister.toString() !== req.user.id) {
    res.status(401); // 401 Unauthorized
    throw new Error('User not authorized to update this listing');
  }

  // 3. If authorized, update the book
  //    'req.body' will contain the fields to update (e.g., title, condition)
  //    '{ new: true }' tells Mongoose to return the *updated* document
  const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updatedBook);
});

/**
 * @desc    Delete a book listing
 * @route   DELETE /api/books/:id
 * @access  Private
 */
const deleteBook = asyncHandler(async (req, res) => {
  // 1. Find the book by its ID
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // 2. Authorization Check:
  if (book.lister.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to delete this listing');
  }

  // 3. If authorized, delete the book
  await Book.findByIdAndDelete(req.params.id);

  // 4. (Important) Remove the book from the user's 'booksListed' array
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { booksListed: req.params.id },
  });

  res.json({ id: req.params.id, message: 'Book listing removed successfully' });
});

/**
 * @desc    Get all books listed by the logged-in user
 * @route   GET /api/books/my-listings
 * @access  Private
 */
const getMyListings = asyncHandler(async (req, res) => {
  // 1. Find all books where the 'lister' matches...
  //    AND the 'status' is still 'Available'
  const books = await Book.find({
    lister: req.user._id,
    status: 'Available', // <-- ADD THIS FILTER
  }).sort({ createdAt: -1 });

  res.json(books);
});

/**
 * @desc    Get all books listed by the user that are SOLD
 * @route   GET /api/books/my-history
 * @access  Private
 */
const getMyHistory = asyncHandler(async (req, res) => {
  const books = await Book.find({
    lister: req.user._id,
    status: 'Sold', // <-- The only difference
  }).sort({ updatedAt: -1 }); // Sort by when it was sold

  res.json(books);
});

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getMyListings,
  getMyHistory,
};
