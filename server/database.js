// server/database.js
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://jp0916780:1234%40Abcd@cluster0.qes6n.mongodb.net/raisonikatta';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Define schemas
const UserSchema = new mongoose.Schema({
  socketId: String,
  campusCode: String,
  partnerSocketId: String,
  status: { type: String, enum: ['waiting', 'active'], default: 'waiting' },
});

const MessageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

// Define models
const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// Export models
module.exports = { User, Message };
