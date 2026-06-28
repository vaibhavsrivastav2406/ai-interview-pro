const express = require('express');
const { 
  submitAnswer, 
  getMyAnswers, 
  publishAnswer, 
  likeAnswer, 
  getPublicAnswers 
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware'); // Import the Bouncer

const router = express.Router();

// Notice we put 'protect' in the middle. 
// The server will run the protect middleware first. If it passes, it runs submitAnswer.
router.post('/', protect, submitAnswer);

// Fetching past answers also requires you to be logged in
router.get('/my', protect, getMyAnswers);

// Community social routes
router.get('/public', protect, getPublicAnswers);
router.put('/:id/publish', protect, publishAnswer);
router.put('/:id/like', protect, likeAnswer);

module.exports = router;