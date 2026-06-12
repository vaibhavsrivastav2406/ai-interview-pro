const Answer = require('../models/Answer');
const Question = require('../models/Question'); // <-- We need this to get the question details
const { evaluateAnswer } = require('../services/aiService'); // <-- Import your AI service!

// 1. Submit a new answer (Now with AI!)
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    // Step A: Find the question in the database so we know what the user is answering
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Step B: Send the question and the user's answer to OpenAI for grading!
    console.log("Sending answer to AI for evaluation...");
    const aiFeedback = await evaluateAnswer(question.title, question.category, answerText);
    console.log("AI Evaluation complete!");

    // Step C: Save the answer AND the AI feedback to the database
    const answer = await Answer.create({
      userId: req.user._id, 
      questionId,
      answerText,
      feedback: aiFeedback, // <-- We attach the AI's JSON response here
    });

    res.status(201).json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error submitting answer' });
  }
};

// 2. Get only the logged-in user's answers (Stays exactly the same)
const getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user._id }).populate('questionId');
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching answers' });
  }
};

module.exports = { submitAnswer, getMyAnswers };