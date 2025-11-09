const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Utility function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token will be valid for 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // 1. Get data from request body
  const { name, email, password } = req.body;

  // 2. Validate data
  if (!name || !email || !password) {
    res.status(400); // 400 Bad Request
    throw new Error('Please add all fields');
  }

  // 3. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 4. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 5. Create the new user in the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 6. Respond with user data and a token
  if (user) {
    res.status(201).json({
      // 201 Created
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate (login) a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  // 1. Get email and password from request body
  const { email, password } = req.body;

  // 2. Find the user in the database by email
  const user = await User.findOne({ email });

  // 3. Check if user exists AND if passwords match
  //    We use bcrypt.compare to check the hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    // 4. If credentials are correct, send back user data and a token
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    // 5. If credentials are wrong, send an error
    res.status(401); // 401 Unauthorized
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/me
 * @access  Private (because we will use our 'protect' middleware)
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // The 'protect' middleware already found the user and attached it to req.user.
  // So, we just need to send it back.
  res.json(req.user);
});

// Export the function
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
