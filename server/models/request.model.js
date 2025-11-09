const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema(
  {
    // The student who is requesting the book
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The book being requested
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    // The status of the request
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending',
    },
    // An optional initial message from the requester
    message: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
