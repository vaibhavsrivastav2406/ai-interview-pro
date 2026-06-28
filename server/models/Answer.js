const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  // Link to the User who answered
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Link to the Question they are answering
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  // The actual text the user typed
  answerText: { 
    type: String, 
    required: true 
  },
  // A placeholder for our AI feedback (we will use this in Phase 4!)
  feedback: {
    overallScore: Number,
    strengths: [String],
    weaknesses: [String],
    improvementSuggestions: [String]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);