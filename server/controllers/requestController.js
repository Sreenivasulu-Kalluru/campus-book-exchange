const asyncHandler = require('express-async-handler');
const Request = require('../models/request.model');
const Book = require('../models/book.model');
const Conversation = require('../models/conversation.model'); // <-- 1. ADD THIS
const Message = require('../models/message.model'); // <-- 2. ADD THIS

/**
 * @desc    Create a new exchange request
 * @route   POST /api/requests
 * @access  Private
 */
const createRequest = asyncHandler(async (req, res) => {
  // 1. Get data
  const { bookId, message } = req.body;
  const requesterId = req.user._id;

  // 2. Find the book
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const listerId = book.lister;

  // 3. --- Validation Checks ---
  if (listerId.toString() === requesterId.toString()) {
    res.status(400);
    throw new Error('You cannot request your own book');
  }

  const existingRequest = await Request.findOne({
    book: bookId,
    requester: requesterId,
    status: { $in: ['Pending', 'Accepted'] },
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('You already have an active request for this book');
  }

  // --- 4. CREATE THE REQUEST (This part is working) ---
  const request = await Request.create({
    requester: requesterId,
    book: bookId,
    message: message || '',
  });

  // --- 5. CREATE THE CHAT (This is the new, robust logic) ---
  let conversationId = null;
  try {
    // --- STEP A: Try to find the conversation ---
    let conversation = await Conversation.findOne({
      book: bookId,
      participants: { $all: [requesterId, listerId] },
    });

    // --- STEP B: If it doesn't exist, create it ---
    if (!conversation) {
      console.log('No conversation found. Creating a new one...');
      conversation = await Conversation.create({
        book: bookId,
        participants: [requesterId, listerId],
      });
    }

    conversationId = conversation._id;

    // Create the first Message
    await Message.create({
      conversationId: conversationId,
      sender: requesterId,
      content: message || 'I am interested in this book.',
    });
  } catch (chatError) {
    console.error('--- CHAT CREATION FAILED ---');
    console.error(chatError);
    // We will still continue, so the 'Request' is created
  }

  // --- 6. SEND THE NOTIFICATION ---
  if (request && conversationId) {
    const listerSocket = req.getUser(listerId.toString());
    if (listerSocket) {
      req.io.to(listerSocket.socketId).emit('new_notification', {
        message: `You have a new request for "${book.title}" from ${req.user.name}.`,
        bookId: book._id,
        requesterName: req.user.name,
        conversationId: conversationId,
      });
      req.io.to(listerSocket.socketId).emit('new_conversation');
      console.log(`Notification & Chat created, sent to lister: ${listerId}`);
    }
  }

  res.status(201).json(request);
});

/**
 * @desc    Get all requests for books listed by the logged-in user
 * @route   GET /api/requests/received
 * @access  Private
 */
const getReceivedRequests = asyncHandler(async (req, res) => {
  // 1. Get the logged-in user's ID
  const listerId = req.user._id;

  // 2. Find all books that are listed by this user
  // We only select the '_id' field for efficiency
  const userBooks = await Book.find({ lister: listerId }).select('_id');

  // 3. Create an array of just the book IDs
  const userBookIds = userBooks.map((book) => book._id);

  // 4. Find all requests where the 'book' is in our array of book IDs
  // This finds all requests for all books listed by this user
  const requests = await Request.find({ book: { $in: userBookIds } })
    .populate('book', 'title') // Add book title
    .populate('requester', 'name department') // Add requester's name/dept
    .sort({ createdAt: -1 }); // Show newest requests first

  res.json(requests);
});

/**
 * @desc    Respond to a received request (Accept/Decline)
 * @route   PUT /api/requests/:id
 * @access  Private
 */
const respondToRequest = asyncHandler(async (req, res) => {
  // 1. Get the new status ('Accepted' or 'Declined') from the body
  const { status } = req.body;
  const listerId = req.user._id;

  // 2. Validate the new status
  if (!status || (status !== 'Accepted' && status !== 'Declined')) {
    res.status(400);
    throw new Error("Invalid status. Must be 'Accepted' or 'Declined'");
  }

  // 3. Find the request by its ID
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 4. Find the book associated with the request
  const book = await Book.findById(request.book);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // 5. --- Authorization Check ---
  //    Check if the logged-in user is the lister of this book
  if (book.lister.toString() !== listerId.toString()) {
    res.status(401);
    throw new Error('Not authorized to respond to this request');
  }

  // 6. --- Check if already handled ---
  if (request.status !== 'Pending') {
    res.status(400);
    throw new Error(
      `This request has already been ${request.status.toLowerCase()}`
    );
  }

  // 7. Update the request
  const updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  // 8. --- CRITICAL SIDE-EFFECT ---
  if (updatedRequest.status === 'Accepted') {
    // If 'Accepted', mark the book as 'Sold'
    await Book.findByIdAndUpdate(book._id, { status: 'Sold' });
  } else if (updatedRequest.status === 'Declined') {
    // --- ADD THIS BLOCK ---
    // If 'Declined', delete the request so the user can try again
    // await Request.findByIdAndDelete(req.params.id);
  }
  res.json(updatedRequest);
});

/**
 * @desc    Get all requests *sent* by the logged-in user
 * @route   GET /api/requests/sent
 * @access  Private
 */
const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ requester: req.user._id })
    .populate('book', 'title') // Get the book title
    .sort({ createdAt: -1 });

  res.json(requests);
});

/**
 * @desc    Check the status of a request for a book
 * @route   GET /api/requests/check/:bookId
 * @access  Private
 */
const checkRequestStatus = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const requesterId = req.user._id;

  // Find the *most recent* request for this book by this user
  const latestRequest = await Request.findOne({
    book: bookId,
    requester: requesterId,
  }).sort({ createdAt: -1 }); // Get the newest one

  if (latestRequest) {
    // Return the status
    res.json({ status: latestRequest.status }); // e.g., 'Pending', 'Accepted', 'Declined'
  } else {
    // No request has been sent
    res.json({ status: null });
  }
});
module.exports = {
  createRequest,
  getReceivedRequests,
  respondToRequest,
  getSentRequests,
  checkRequestStatus,
};
