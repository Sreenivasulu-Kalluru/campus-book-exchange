// server/models/conversation.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    // 'participants' will be an array with two User IDs:
    // [listerId, requesterId]
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // We can also link this chat to the original book
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
  },
  {
    timestamps: true, // Tracks when the chat was created/last active
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
