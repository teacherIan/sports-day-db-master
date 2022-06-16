const mongoose = require('mongoose');

const housesSchema = new mongoose.Schema({
  house: String,
  points: Number,
  message: String,
  lastUpdate: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model('house', housesSchema);
