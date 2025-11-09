// src/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const http = require('http'); // We need the core http module
const { Server } = require('socket.io'); // Import the socket.io Server

// --- Import middleware ---
const { errorHandler } = require('./middleware/errorMiddleware');
const Message = require('./models/message.model');

// Create an Express app
const app = express();

// Use middleware
app.use(cors());
app.use(express.json());

// --- 2. CREATE THE HTTP SERVER ---
// We give our Express app to the http server
const server = http.createServer(app);

// --- 3. ATTACH SOCKET.IO TO THE SERVER ---
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// --- 4. SOCKET.IO LOGIC ---

// This is a simple way to track which user has which socket.
// In a real app, this would be in Redis, but this is fine.
let onlineUsers = [];

const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// This runs every time a user opens your frontend app
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // We need the user to tell us who they are
  // We'll listen for a "join" event from the frontend
  socket.on('join', (userId) => {
    addUser(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // This runs when they close the app
  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log(`A user disconnected: ${socket.id}`);
  });

  // This runs when they close the app
  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log(`A user disconnected: ${socket.id}`);
  });

  // --- 2. ADD THIS NEW EVENT LISTENER ---
  socket.on(
    'sendMessage',
    async ({ conversationId, senderId, receiverId, content }) => {
      try {
        // 1. Save the new message to the database
        const newMessage = new Message({
          conversationId,
          sender: senderId,
          content,
        });
        await newMessage.save();

        // 2. Find the receiver (if they are online)
        const receiver = getUser(receiverId);

        if (receiver) {
          // 3. Send the message to them in real-time
          io.to(receiver.socketId).emit('receiveMessage', {
            conversationId,
            sender: senderId,
            content,
            createdAt: newMessage.createdAt, // Send the timestamp
          });
        }
      } catch (error) {
        console.error('Error handling send-message event:', error);
      }
    }
  );
});

// --- 5. PASS 'io' and 'getUser' TO OUR CONTROLLERS ---
// We add 'io' to every request object so our controllers can use it
app.use((req, res, next) => {
  req.io = io;
  req.getUser = getUser; // Pass our user-finder function
  next();
});

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Mount Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// --- Error Handling Middleware ---
app.use(errorHandler);

// --- 6. START THE NEW SERVER ---
// We listen on 'server' now, not 'app'
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
