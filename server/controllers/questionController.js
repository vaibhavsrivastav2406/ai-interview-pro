const Question = require('../models/Question');

// 1. Add a new question to the bank
const addQuestion = async (req, res) => {
  try {
    const { title, description, category, difficulty } = req.body;

    const newQuestion = await Question.create({
      title,
      description,
      category,
      difficulty,
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding question' });
  }
};

// 2. Get all questions from the bank
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find(); // Fetches everything in the collection
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
};

module.exports = { addQuestion, getQuestions };