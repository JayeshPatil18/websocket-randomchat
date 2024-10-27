// server/models/CampusCode.js
const mongoose = require('mongoose');

const campusCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('CampusCode', campusCodeSchema);
