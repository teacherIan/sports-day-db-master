const mongoose = require('mongoose');

// now.toLocaleString('en-us', options);

const historySchema = new mongoose.Schema({
  house: String,
  points: Number,
  message: String,
  reason: String,
  ageGroup: String,
  lastUpdate: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model('history', historySchema, 'histories');
