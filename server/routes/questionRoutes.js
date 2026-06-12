const express = require('express');
const { addQuestion, getQuestions } = require('../controllers/questionController');

const router = express.Router();

// GET request to /api/questions will fetch all questions
router.get('/', getQuestions);

// POST request to /api/questions will add a new question
router.post('/', addQuestion);

module.exports = router;