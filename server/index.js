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
const VALID_CAMPUS_CODE = 'ghrcem'; // Replace with your desired campus code

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware to serve static files
app.use(express.static('public'));

// Import models
const ChatMessage = require('./models/ChatMessage');
const UserSession = require('./models/UserSession');

// Store connected users and their assigned chat partners
const connectedUsers = {};

// Helper function to find a random user (excluding the current user)
function getRandomUser(currentSocketId) {
  const activeUsers = Object.keys(connectedUsers).filter(id => id !== currentSocketId);
  if (activeUsers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * activeUsers.length);
  return activeUsers[randomIndex];
}

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinCampus', (campusCode) => {
    // Check if the entered campus code matches the predefined static value
    if (campusCode.toLowerCase() !== VALID_CAMPUS_CODE.toLowerCase()) {
      socket.emit('error', 'Invalid campus code. Please try again.');
      return;
    }

    // Assign a random user as chat partner or wait for the next user to join
    const randomPartnerId = getRandomUser(socket.id);
    if (randomPartnerId) {
      connectedUsers[socket.id] = { campusCode, partnerId: randomPartnerId };
      connectedUsers[randomPartnerId].partnerId = socket.id;

      // Notify both users that they have been paired
      socket.emit('paired', `You are now paired with a random user.`);
      io.to(randomPartnerId).emit('paired', `You are now paired with a random user.`);
    } else {
      // Add the user to the list, without a partner yet
      connectedUsers[socket.id] = { campusCode, partnerId: null };
      socket.emit('waiting', `Waiting for another user to join...`);
    }

    socket.join(campusCode);
    io.to(campusCode).emit('notification', `A new user has joined campus ${campusCode}`);
  });

  socket.on('message', async (msg) => {
    const user = connectedUsers[socket.id];
    if (!user || !user.partnerId) {
      socket.emit('error', 'No partner found to chat with. Waiting for another user.');
      return;
    }

    const recipientSocketId = user.partnerId;

    if (connectedUsers[recipientSocketId]) {
      // Save message to the database
      await ChatMessage.create({ campusCode: user.campusCode, senderId: socket.id, message: msg.message });

      // Send the message directly to the chat partner
      io.to(recipientSocketId).emit('message', { message: msg.message, senderId: socket.id });
    } else {
      socket.emit('error', 'Your chat partner has disconnected.');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Notify partner of disconnection and remove partner link
    const user = connectedUsers[socket.id];
    if (user && user.partnerId) {
      const partnerSocketId = user.partnerId;
      if (connectedUsers[partnerSocketId]) {
        io.to(partnerSocketId).emit('notification', 'Your chat partner has disconnected.');
        connectedUsers[partnerSocketId].partnerId = null;
      }
    }
    
    // Remove user from connected users list
    delete connectedUsers[socket.id];
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
