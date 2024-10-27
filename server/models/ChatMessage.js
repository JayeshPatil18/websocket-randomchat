// server/models/ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  campusCode: { type: String, required: true }, // Reference to CampusCodes
  senderId: { type: String, required: true },   // Unique identifier for the sender (could be socket ID or anonymous ID)
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
