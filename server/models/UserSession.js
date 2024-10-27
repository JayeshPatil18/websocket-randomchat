// server/models/UserSession.js
const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  campusCode: { type: String, required: true }, // Reference to CampusCodes
  socketId: { type: String, required: true, unique: true }, // Socket ID to track active connections
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserSession', userSessionSchema);
