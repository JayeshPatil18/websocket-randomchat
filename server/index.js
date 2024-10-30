const { User, Message } = require('./database');

// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize express app and HTTP server
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials if needed
  },
});

const PORT = process.env.PORT || 3000;

// Define a static campus code
const VALID_CAMPUS_CODE = 'ghrcem'; // Replace with your desired campus code

// Middleware to serve static files
app.use(express.static('public'));
app.use(cors()); // Use the CORS middleware


// Add a new endpoint to check server status
app.get('/status', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    waitingList: waitingList.length,
    activeList: Object.keys(activeList).length
  });
});

// New endpoint to get all messages with specific fields
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find(); // Fetch all messages from the database

    // Map messages to include only the required fields
    const responseMessages = messages.map(msg => ({
      timestamp: msg.timestamp.toISOString().substring(0, 19).replace('T', ' '), // Convert to simple date:time format
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message,
    }));

    res.json(responseMessages); // Send the filtered messages back as JSON
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


// Store users in waiting and active lists
let waitingList = []; // Format: [{ socketId, campusCode }]
let activeList = {}; // Format: { [socketId]: partnerSocketId }

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinCampus', async (campusCode) => {
    // Check if the entered campus code matches the predefined static value
    if (campusCode.toLowerCase() !== VALID_CAMPUS_CODE.toLowerCase()) {
      socket.emit('error', 'Invalid campus code. Please try again.');
      return;
    }

    // Add user to the waiting list
    waitingList.push({ socketId: socket.id, campusCode });
    console.log(`User added to waiting list: ${socket.id}`);

    // Save new user to MongoDB
    await User.create({ socketId: socket.id, campusCode, status: 'waiting' });

    // Attempt to match user with a partner
    matchUser(socket);
    
    // Notify all users in the campus room
    socket.join(campusCode);
    io.to(campusCode).emit('notification', `A new user has joined campus ${campusCode}`);
  });

  socket.on('message', async (msg) => {
    const partnerId = activeList[socket.id];
    if (partnerId) {
      // Send the message to the partner
      io.to(partnerId).emit('message', { message: msg.message, senderId: socket.id });
    
      // Save message to MongoDB
    await Message.create({ senderId: socket.id, receiverId: partnerId, message: msg.message });
    } else {
      socket.emit('error', 'No active chat partner found.');
    }
  });

  socket.on('typing', () => {
    const partnerId = activeList[socket.id];
    if (partnerId) {
      io.to(partnerId).emit('typing');
    }
  });

  socket.on('stopTyping', () => {
    const partnerId = activeList[socket.id];
    if (partnerId) {
      io.to(partnerId).emit('stopTyping');
    }
  });

  socket.on('skip', () => {
    console.log(`User skipped: ${socket.id}`);
    handleSkip(socket);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleDisconnection(socket.id);
  });
});

// Helper function to match users
async function matchUser(socket) {
  // Check if there's another user in the waiting list
  const waitingUserIndex = waitingList.findIndex(user => user.socketId !== socket.id);

  if (waitingUserIndex !== -1) {
    const waitingUser = waitingList[waitingUserIndex];

    // If a match is found, connect both users
    activeList[socket.id] = waitingUser.socketId;
    activeList[waitingUser.socketId] = socket.id;

    // Notify both users
    io.to(socket.id).emit('paired', { message: 'You are now paired with a user.', partnerId: waitingUser.socketId });
    io.to(waitingUser.socketId).emit('paired', { message: 'You are now paired with a user.', partnerId: socket.id });

    // Remove both users from the waiting list
    waitingList.splice(waitingUserIndex, 1);
    waitingList = waitingList.filter(user => user.socketId !== socket.id);

    // Update both users' status in MongoDB to active
    await User.updateOne({ socketId: socket.id }, { status: 'active', partnerSocketId: waitingUser.socketId });
    await User.updateOne({ socketId: waitingUser.socketId }, { status: 'active', partnerSocketId: socket.id });

    console.log(`Users matched: ${socket.id} with ${waitingUser.socketId}`);
  }
}

// Handle user skipping the chat
async function handleSkip(socket) {
  const partnerId = activeList[socket.id];
  if (partnerId) {
    // Notify the partner that the user has skipped
    io.to(partnerId).emit('notification', 'Your chat partner has skipped. You are now in the waiting list.');

    // Remove both users from the active list
    delete activeList[partnerId];
    delete activeList[socket.id];

    // Update both users' status in MongoDB to waiting
    await User.updateOne({ socketId: socket.id }, { status: 'waiting', partnerSocketId: null });
    await User.updateOne({ socketId: partnerId }, { status: 'waiting', partnerSocketId: null });
  }

  // Add user back to the waiting list
  waitingList.push({ socketId: socket.id });
  console.log(`User added back to waiting list after skipping: ${socket.id}`);
  
  // Attempt to find a new partner
  matchUser(socket);
}

// Handle user disconnection
async function handleDisconnection(socketId) {
  // Remove user from active list
  const partnerId = activeList[socketId];
  if (partnerId) {
    delete activeList[partnerId]; // Remove partner
    io.to(partnerId).emit('notification', 'Your chat partner has disconnected.');
  }
  delete activeList[socketId]; // Remove the disconnecting user

  // Remove from waiting list if present
  waitingList = waitingList.filter(user => user.socketId !== socketId);

  // Remove user from MongoDB
  await User.deleteOne({ socketId });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
