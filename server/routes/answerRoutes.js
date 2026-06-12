const express = require('express');
const { submitAnswer, getMyAnswers } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware'); // Import the Bouncer

const router = express.Router();

// Notice we put 'protect' in the middle. 
// The server will run the protect middleware first. If it passes, it runs submitAnswer.
router.post('/', protect, submitAnswer);

// Fetching past answers also requires you to be logged in
router.get('/my', protect, getMyAnswers);

module.exports = router;