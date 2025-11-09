// server/controllers/chatController.js
const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

/**
 * @desc    Get all of a user's conversations (their "Inbox")
 * @route   GET /api/chat
 * @access  Private
 */
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name email') // Get details of who you're talking to
    .populate('book', 'title imageUrl') // Get the book details
    .sort({ updatedAt: -1 }); // Show most recent chats first

  res.json(conversations);
});

/**
 * @desc    Get all messages for a single conversation
 * @route   GET /api/chat/:id
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  // First, check if the user is even part of this conversation
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // If they are, get all messages
  const messages = await Message.find({
    conversationId: req.params.id,
  }).sort({ createdAt: 1 }); // Show oldest first

  res.json(messages);
});

/**
 * @desc    Get a single conversation by its ID
 * @route   GET /api/chat/details/:id
 * @access  Private
 */
const getConversationDetails = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'name email')
    .populate('book', 'title imageUrl');

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user is part of this convo
  if (!conversation.participants.some((p) => p._id.equals(req.user._id))) {
    res.status(403);
    throw new Error('User not authorized');
  }

  res.json(conversation);
});

module.exports = {
  getMyConversations,
  getMessages,
  getConversationDetails,
};
