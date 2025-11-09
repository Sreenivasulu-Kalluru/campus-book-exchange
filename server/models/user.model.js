const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Removes whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true, // Every email must be unique
      trim: true,
      lowercase: true, // Store emails in lowercase
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce a minimum password length
    },
    department: {
      type: String,
      trim: true,
      default: 'Not Specified',
    },
    booksListed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', // This links to the 'Book' model
      },
    ],
  },
  {
    // Add timestamps
    // This automatically adds 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
