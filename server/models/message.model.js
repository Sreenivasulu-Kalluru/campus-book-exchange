// server/models/message.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    // Which chat room does this message belong to?
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    // Who sent the message?
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // The actual text
    content: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Tracks when the message was sent
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
