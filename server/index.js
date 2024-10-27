// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Initialize express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Define a static campus code
const VALID_CAMPUS_CODE = 'MY_CAMPUS_CODE'; // Replace with your desired campus code

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware to serve static files
app.use(express.static('public'));

// Import models
const ChatMessage = require('./models/ChatMessage');
const UserSession = require('./models/UserSession');

// Store connected users in memory
const connectedUsers = {};

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinCampus', (campusCode) => {
    // Check if the entered campus code matches the predefined static value
    if (campusCode !== VALID_CAMPUS_CODE) {
      socket.emit('error', 'Invalid campus code. Please try again.');
      return;
    }

    // Save the user's socket ID to the connected users list
    connectedUsers[socket.id] = { campusCode }; // Store campus code or any other user info
    socket.join(campusCode);
    io.to(campusCode).emit('notification', `A new user has joined campus ${campusCode}`);
  });

  socket.on('message', async (msg) => {
    // Check if the recipient exists in connected users
    const recipientSocketId = Object.keys(connectedUsers).find(id => id === msg.recipientId);

    if (recipientSocketId) {
      // Save message to the database
      await ChatMessage.create(msg);
      // Send the message directly to the specified recipient
      io.to(recipientSocketId).emit('message', msg);
    } else {
      socket.emit('error', 'User not found.');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from connected users list
    delete connectedUsers[socket.id];
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
