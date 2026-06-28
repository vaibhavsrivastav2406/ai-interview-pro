const express = require('express');
const { chatWithAI } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected chat route
router.post('/', protect, chatWithAI);

module.exports = router;
