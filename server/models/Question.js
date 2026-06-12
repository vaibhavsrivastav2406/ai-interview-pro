const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['DSA', 'System Design', 'Behavioral'], // Restricts to only these three options
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'], // Restricts to only these three options
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);